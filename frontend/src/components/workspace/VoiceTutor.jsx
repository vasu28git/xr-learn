import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../../lib/api'

const GREETING = "Hi! I'm your AI tutor for this lesson. How can I help you?"

/**
 * Converts theory sections array to readable plaintext for context injection.
 */
function sectionsToText(sections = []) {
  return sections
    .map(s => {
      if (s.type === 'heading') return `\n## ${s.content}`
      if (s.type === 'list') return (s.items || []).map(i => `- ${i}`).join('\n')
      return s.content || ''
    })
    .join('\n')
}

export default function VoiceTutor({ moduleConfig, currentCode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle | listening | processing | speaking
  const [transcript, setTranscript] = useState('')
  const [conversation, setConversation] = useState([])
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const chatBodyRef = useRef(null)
  const hasGreeted = useRef(false)

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

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const speakText = useCallback(async (text) => {
    setStatus('speaking')
    try {
      const audioBlob = await api.voiceTutor.tts(text)
      if (!audioBlob) {
        // ElevenLabs not configured — just show text
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
      console.warn('TTS failed, falling back to text only:', err)
      setStatus('idle')
    }
  }, [])

  const sendQuestion = useCallback(async (question) => {
    if (!question.trim()) return

    setStatus('processing')
    setError(null)

    const lessonContent = sectionsToText(moduleConfig?.theory?.sections)
    const updatedHistory = [...conversation, { role: 'user', content: question }]
    setConversation(updatedHistory)

    try {
      const { message } = await api.voiceTutor.chat({
        lessonContent,
        code: currentCode || '',
        history: conversation,
        question
      })

      const newHistory = [...updatedHistory, { role: 'assistant', content: message }]
      setConversation(newHistory)
      await speakText(message)
    } catch (err) {
      const errMsg = 'Sorry, I had trouble responding. Please try again.'
      setError(errMsg)
      setStatus('idle')
    }
  }, [conversation, moduleConfig, currentCode, speakText])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition
    setTranscript('')
    setStatus('listening')
    setError(null)

    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(text)
    }

    recognition.onend = () => {
      const finalTranscript = recognitionRef.current?._finalTranscript
      if (finalTranscript) {
        sendQuestion(finalTranscript)
        setTranscript('')
      } else {
        setStatus('idle')
      }
    }

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') {
        setError('No speech detected. Try again.')
      } else if (e.error !== 'aborted') {
        setError(`Microphone error: ${e.error}`)
      }
      setStatus('idle')
    }

    // Capture final transcript before onend fires
    recognition.onresult = (e) => {
      let interim = ''
      let final = ''
      for (const result of e.results) {
        if (result.isFinal) final += result[0].transcript
        else interim += result[0].transcript
      }
      setTranscript(final || interim)
      recognition._finalTranscript = final || interim
    }

    recognition.start()
  }, [sendQuestion])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
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
    setStatus('idle')
    setError(null)
    hasGreeted.current = false
  }

  const statusConfig = {
    idle: { label: 'Ready', color: 'text-on-surface-variant', dot: 'bg-on-surface-variant/40' },
    listening: { label: 'Listening...', color: 'text-emerald-500', dot: 'bg-emerald-500 animate-pulse' },
    processing: { label: 'Thinking...', color: 'text-[#6366f1]', dot: 'bg-[#6366f1] animate-ping' },
    speaking: { label: 'Speaking...', color: 'text-amber-500', dot: 'bg-amber-500 animate-pulse' },
  }
  const currentStatus = statusConfig[status]

  return (
    <>
      {/* Hidden audio element for ElevenLabs playback */}
      <audio ref={audioRef} hidden />

      {/* Floating 🎙️ toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="AI Voice Tutor"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#6366f1] hover:bg-[#5053e1] text-white font-bold text-xs py-2.5 px-5 rounded-2xl shadow-lg shadow-[#6366f1]/30 hover:shadow-xl hover:shadow-[#6366f1]/40 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
          </svg>
          AI Voice Tutor
        </button>
      )}

      {/* Voice Tutor Panel */}
      {isOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-surface border border-outline-variant/60 rounded-3xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#6366f1]/10 border-b border-[#6366f1]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-xs text-on-surface">AI Voice Tutor</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                  <span className={`text-[10px] font-semibold ${currentStatus.color}`}>{currentStatus.label}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
              title="End conversation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Conversation */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 max-h-60 min-h-[120px]"
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
            {status === 'processing' && (
              <div className="flex justify-start">
                <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Live transcript */}
          {transcript && (
            <div className="mx-4 mb-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              🎙️ {transcript}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mx-4 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="px-4 py-4 border-t border-outline-variant/40 flex items-center gap-3">
            {status === 'idle' && (
              <button
                onClick={startListening}
                className="flex-1 bg-[#6366f1] hover:bg-[#5053e1] text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#6366f1]/25 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
                </svg>
                Speak
              </button>
            )}

            {status === 'listening' && (
              <button
                onClick={stopListening}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer animate-pulse"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop Recording
              </button>
            )}

            {status === 'speaking' && (
              <button
                onClick={stopSpeaking}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop Speaking
              </button>
            )}

            {status === 'processing' && (
              <div className="flex-1 bg-surface-container-high border border-outline-variant/40 font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 text-on-surface-variant">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Thinking...
              </div>
            )}

            <button
              onClick={handleClose}
              title="End conversation"
              className="p-3 rounded-2xl border border-outline-variant/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
