import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../../lib/api'

const GREETING = "Hi! I'm Loki, your AI tutor. How can I help you today?"

/** Convert theory sections array to plain readable text */
function sectionsToText(sections = []) {
  return sections
    .map(s => {
      if (s.type === 'heading') return s.content
      if (s.type === 'list') return (s.items || []).join('. ')
      return s.content || ''
    })
    .join('\n')
}

/** Client-side Markdown sanitizer as a safety net */
function sanitize(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function VoiceTutor({ moduleConfig, currentCode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle | listening | processing | speaking
  const [transcript, setTranscript] = useState('')
  const [conversation, setConversation] = useState([])
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState(null)

  // Notification Bubble state
  const [showNotification, setShowNotification] = useState(true)

  // Drag state for the main panel
  const [pos, setPos] = useState({ x: null, y: null }) // null = centered (default)
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const panelRef = useRef(null)

  // Drag state for the trigger button
  const [btnPos, setBtnPos] = useState({ x: null, y: null }) // null = bottom centered (default)
  const [btnDragging, setBtnDragging] = useState(false)
  const btnDragOffset = useRef({ x: 0, y: 0 })
  const btnStartPos = useRef({ x: 0, y: 0 })
  const triggerRef = useRef(null)

  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const chatBodyRef = useRef(null)
  const hasGreeted = useRef(false)
  const textInputRef = useRef(null)

  // Auto-scroll conversation
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [conversation])

  // Play greeting when panel opens for the first time
  useEffect(() => {
    if (isOpen && !hasGreeted.current) {
      hasGreeted.current = true
      setConversation([{ role: 'assistant', content: GREETING }])
      speakText(GREETING)
    }
  }, [isOpen])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  // ── Drag Logic (unified window listeners for both panel & trigger button) ──
  const onDragStart = useCallback((e) => {
    if (!panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    setDragging(true)
    e.preventDefault()
  }, [])

  const onBtnDragStart = useCallback((e) => {
    if (e.button !== 0) return; // Left click only
    if (!triggerRef.current) return

    // Record start coordinates to separate drag from click
    btnStartPos.current = { x: e.clientX, y: e.clientY }

    const rect = triggerRef.current.getBoundingClientRect()
    btnDragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    setBtnDragging(true)
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useEffect(() => {
    if (!dragging && !btnDragging) return

    const onMove = (e) => {
      if (dragging && panelRef.current) {
        const newX = e.clientX - dragOffset.current.x
        const newY = e.clientY - dragOffset.current.y
        const w = panelRef.current.offsetWidth
        const h = panelRef.current.offsetHeight
        // Clamp inside viewport
        setPos({
          x: Math.min(Math.max(newX, 0), window.innerWidth - w),
          y: Math.min(Math.max(newY, 0), window.innerHeight - h)
        })
      } else if (btnDragging && triggerRef.current) {
        const newX = e.clientX - btnDragOffset.current.x
        const newY = e.clientY - btnDragOffset.current.y
        const w = triggerRef.current.offsetWidth
        const h = triggerRef.current.offsetHeight
        // Clamp inside viewport with 10px padding
        setBtnPos({
          x: Math.min(Math.max(newX, 10), window.innerWidth - w - 10),
          y: Math.min(Math.max(newY, 10), window.innerHeight - h - 10)
        })
      }
    }

    const onUp = (e) => {
      if (btnDragging) {
        setBtnDragging(false)
        // If client coords barely changed, count it as a click!
        const dist = Math.hypot(e.clientX - btnStartPos.current.x, e.clientY - btnStartPos.current.y)
        if (dist < 6) {
          setIsOpen(true)
          setShowNotification(false)
        }
      }
      setDragging(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, btnDragging])

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speakText = useCallback(async (text) => {
    setStatus('speaking')
    try {
      const audioBlob = await api.voiceTutor.tts(text)
      if (!audioBlob) {
        setStatus('idle')
        return
      }
      const url = URL.createObjectURL(audioBlob)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = url
        audioRef.current.play()
        audioRef.current.onended = () => {
          URL.revokeObjectURL(url)
          setStatus('idle')
        }
      }
    } catch (err) {
      console.warn('TTS failed, text-only mode:', err)
      setStatus('idle')
    }
  }, [])

  // ── Send question (shared between voice & text) ───────────────────────────
  const sendQuestion = useCallback(async (question) => {
    const q = question.trim()
    if (!q || status === 'processing') return

    setStatus('processing')
    setError(null)

    const lessonContent = sectionsToText(moduleConfig?.theory?.sections)
    const userMsg = { role: 'user', content: q }
    const updatedHistory = [...conversation, userMsg]
    setConversation(updatedHistory)

    try {
      const { message } = await api.voiceTutor.chat({
        lessonContent,
        code: currentCode || '',
        history: conversation,
        question: q
      })

      const clean = sanitize(message)
      setConversation([...updatedHistory, { role: 'assistant', content: clean }])
      await speakText(clean)
    } catch (err) {
      setError('Sorry, I had trouble responding. Please try again.')
      setStatus('idle')
    }
  }, [conversation, moduleConfig, currentCode, speakText, status])

  // ── Text input submit ─────────────────────────────────────────────────────
  const handleTextSubmit = (e) => {
    e?.preventDefault()
    if (!textInput.trim()) return
    sendQuestion(textInput)
    setTextInput('')
  }

  // ── Voice input ───────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }
    if (status !== 'idle') return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition
    setTranscript('')
    setStatus('listening')
    setError(null)

    let finalText = ''

    recognition.onresult = (e) => {
      let interim = ''
      finalText = ''
      for (const result of e.results) {
        if (result.isFinal) finalText += result[0].transcript
        else interim += result[0].transcript
      }
      setTranscript(finalText || interim)
    }

    recognition.onend = () => {
      setTranscript('')
      if (finalText.trim()) {
        sendQuestion(finalText)
      } else {
        setStatus('idle')
      }
    }

    recognition.onerror = (e) => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        setError(`Microphone error: ${e.error}`)
      } else if (e.error === 'no-speech') {
        setError('No speech detected. Try again.')
      }
      setStatus('idle')
    }

    recognition.start()
  }, [status, sendQuestion])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setStatus('idle')
  }, [])

  const handleClose = () => {
    stopListening()
    stopSpeaking()
    setIsOpen(false)
    setConversation([])
    setTranscript('')
    setTextInput('')
    setStatus('idle')
    setError(null)
    hasGreeted.current = false
  }

  // ── Status config ─────────────────────────────────────────────────────────
  const statusMap = {
    idle:       { label: 'Ready',        dotCls: 'bg-on-surface-variant/40',     textCls: 'text-on-surface-variant' },
    listening:  { label: 'Listening…',   dotCls: 'bg-emerald-500 animate-pulse', textCls: 'text-emerald-500' },
    processing: { label: 'Thinking…',    dotCls: 'bg-[#6366f1] animate-ping',    textCls: 'text-[#6366f1]' },
    speaking:   { label: 'Speaking…',    dotCls: 'bg-amber-500 animate-pulse',   textCls: 'text-amber-500' },
  }
  const st = statusMap[status]

  // ── Panel positioning styles ──
  const panelStyle = pos.x !== null
    ? { position: 'fixed', left: pos.x, top: pos.y, transform: 'none', zIndex: 50 }
    : { position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }

  // ── Floating Button styling (draggable position fallback to bottom right) ──
  const triggerStyle = btnPos.x !== null
    ? { position: 'fixed', left: btnPos.x, top: btnPos.y, transform: 'none', zIndex: 50 }
    : { position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }

  return (
    <>
      <audio ref={audioRef} hidden />

      {/* ── Draggable Floating trigger button + Notification Bubble ── */}
      {!isOpen && (
        <div style={triggerStyle} ref={triggerRef} className="relative select-none">
          {/* Notification bubble (Hey I'm Loki) */}
          {showNotification && (
            <div className="absolute bottom-full right-0 mb-4 w-[260px] bg-surface border border-[#6366f1]/30 p-3 rounded-2xl shadow-xl flex items-start gap-2 z-[60] origin-bottom-right transition-all">
              {/* Green Loki Crown / Magic Icon */}
              <div className="w-6 h-6 rounded-full bg-[#10b981]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#10b981]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-on-surface leading-snug">
                  Hey, I'm <span className="text-[#6366f1]">Loki</span>! Your interactive Voice Assistant.
                </p>
                <p className="text-[9px] text-on-surface-variant leading-none mt-1">
                  Drag me anywhere, or click to talk!
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNotification(false)
                }}
                className="text-on-surface-variant hover:text-on-surface text-[14px] leading-none p-0.5 shrink-0"
                title="Dismiss"
              >
                &times;
              </button>
              {/* Tooltip arrow pointer */}
              <div className="absolute top-full right-6 border-[8px] border-transparent border-t-surface drop-shadow-[0_1px_0_rgba(99,102,241,0.2)]" />
            </div>
          )}

          {/* Launcher Button (Big Icon Only) */}
          <button
            id="voice-tutor-open"
            onMouseDown={onBtnDragStart}
            title="Loki Voice Assistant (Drag to Move)"
            className="w-16 h-16 bg-[#6366f1] hover:bg-[#5053e1] text-white rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.6)] transition-all duration-300 cursor-grab active:cursor-grabbing flex items-center justify-center border-[3px] border-surface"
          >
            {/* Crown Icon representing Loki */}
            <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 20h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Chat/Voice conversation panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          style={panelStyle}
          className="w-[400px] max-w-[calc(100vw-1rem)] bg-surface border border-outline-variant/60 rounded-3xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden select-none"
        >
          {/* ── Drag handle / Header ── */}
          <div
            id="voice-tutor-drag-handle"
            onMouseDown={onDragStart}
            className="flex items-center justify-between px-5 py-3.5 bg-[#6366f1]/10 border-b border-[#6366f1]/20 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2.5">
              {/* Loki Green/Gold Themed Icon */}
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-xs text-on-surface leading-none">Loki AI Assistant</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dotCls}`} />
                  <span className={`text-[10px] font-semibold ${st.textCls}`}>{st.label}</span>
                </div>
              </div>
            </div>
            {/* Drag hint + close */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-on-surface-variant/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M12 3v18M3 12h18" />
              </svg>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={handleClose}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Conversation ── */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64 min-h-[100px]"
          >
            {conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#6366f1] text-white rounded-br-sm'
                    : 'bg-surface-container-high text-on-surface rounded-bl-sm border border-outline-variant/40'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {/* Thinking animation */}
            {status === 'processing' && (
              <div className="flex justify-start">
                <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live transcript */}
          {transcript && (
            <div className="mx-4 mb-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              🎙️ {transcript}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mx-4 mb-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* ── Input row ── */}
          <div className="px-4 py-3 border-t border-outline-variant/40 flex items-center gap-2" onMouseDown={e => e.stopPropagation()}>
            {/* Text input */}
            <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2 bg-surface-container-high rounded-2xl px-3 py-2 border border-outline-variant/40">
              <input
                ref={textInputRef}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleTextSubmit()}
                placeholder="Type your question…"
                disabled={status === 'processing'}
                className="flex-1 bg-transparent text-xs text-on-surface placeholder-on-surface-variant/60 outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || status === 'processing'}
                className="text-[#6366f1] hover:text-[#5053e1] disabled:opacity-30 transition-colors cursor-pointer shrink-0"
                title="Send"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                </svg>
              </button>
            </form>

            {/* Voice button / Stop speaking */}
            {status === 'idle' && (
              <button
                onClick={startListening}
                title="Speak a question"
                className="w-10 h-10 rounded-2xl bg-[#6366f1] hover:bg-[#5053e1] text-white flex items-center justify-center shadow-md shadow-[#6366f1]/25 transition-all cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
                </svg>
              </button>
            )}

            {status === 'listening' && (
              <button
                onClick={stopListening}
                title="Stop recording"
                className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer animate-pulse shrink-0"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            )}

            {status === 'speaking' && (
              <button
                onClick={stopSpeaking}
                title="Stop speaking"
                className="w-10 h-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            )}

            {status === 'processing' && (
              <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 animate-spin text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
