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
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  return (
    <div className="ai-panel">
      {/* Messages */}
      <div className="ai-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`ai-message ai-message--${msg.role}`}>
            <div className="ai-message-role">
              {msg.role === 'assistant' ? '🤖 XR Tutor' : '👤 You'}
            </div>
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div className="ai-message ai-message--assistant">
            <div className="ai-message-role">🤖 XR Tutor</div>
            <span style={{ animation: 'pulse 1.5s infinite' }}>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Hint Prompt */}
      {showHintPrompt && (
        <div className="ai-hint-prompt">
          <p>💡 You seem stuck. Want a hint?</p>
          <div className="ai-hint-prompt-actions">
            <button className="btn btn-primary btn-sm" onClick={handleHintRequest}>
              Get Hint
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onDismissHint}>
              Keep Trying
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="ai-input-area">
        <button
          className="btn btn-secondary btn-sm ai-need-help"
          onClick={handleHintRequest}
          disabled={isLoading}
        >
          💡 Need Help?
        </button>

        <div className="ai-input-row">
          <input
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the tutor..."
            disabled={isLoading}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
