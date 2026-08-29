import { useState, useRef, useEffect } from 'react'

export default function AIPanel({
  messages,
  onSendMessage,
  isLoading,
  showHintPrompt,
  onDismissHint,
  moduleId,
}) {
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (expanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, expanded])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleHintRequest = () => {
    onSendMessage('Can you give me a hint for this task?', true)
    onDismissHint()
  }

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="w-12 h-12 rounded-full bg-surface-container-highest border border-tertiary-container/30 flex items-center justify-center cursor-pointer shadow-lg ai-orb hover:bg-surface-bright transition-all hover:scale-105"
      >
        <span className="material-symbols-outlined text-tertiary text-[24px]">smart_toy</span>
      </button>
    )
  }

  return (
    <div className="w-80 glass-panel rounded-lg shadow-xl border-tertiary-container/20 flex flex-col overflow-hidden max-h-[360px] bg-surface/90">
      <div className="bg-tertiary-container/10 border-b border-outline-variant/50 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-[16px]">auto_awesome</span>
          <span className="font-label-caps text-[10px] text-tertiary uppercase font-bold tracking-wider">AI Assistant</span>
        </div>
        <button className="text-on-surface-variant hover:text-on-surface cursor-pointer" onClick={() => setExpanded(false)}>
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      {/* Message List */}
      <div className="p-3 overflow-y-auto font-body-sm text-xs text-on-surface-variant space-y-2 flex-1 max-h-[220px]">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-2 rounded-lg text-xs leading-relaxed max-w-[85%] ${
              msg.role === 'assistant' 
                ? 'bg-surface-container-highest text-on-surface rounded-tl-none border border-outline-variant/30' 
                : 'bg-primary/10 text-primary border border-primary/25 rounded-tr-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-highest text-on-surface rounded-lg rounded-tl-none border border-outline-variant/30 p-2 text-xs">
              <span className="animate-pulse">Analyzing scene...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Hint Prompt */}
      {showHintPrompt && (
        <div className="bg-primary-container/10 border-t border-primary/20 p-2 text-center text-xs">
          <p className="text-[11px] text-on-surface-variant mb-1.5">💡 Need a progressive hint?</p>
          <div className="flex gap-2 justify-center">
            <button className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded font-semibold hover:bg-primary-fixed" onClick={handleHintRequest}>
              Get Hint
            </button>
            <button className="border border-outline-variant text-[10px] px-2 py-0.5 rounded hover:bg-surface-container-highest" onClick={onDismissHint}>
              Keep Trying
            </button>
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="p-2 border-t border-outline-variant/50 flex gap-2 bg-surface-container-lowest">
        <input 
          className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-xs text-on-surface focus:border-tertiary outline-none" 
          placeholder="Ask tutor..." 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button 
          className="bg-surface-container-highest text-tertiary rounded px-2 flex items-center justify-center hover:bg-surface-bright transition-colors cursor-pointer"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </div>
    </div>
  )
}
