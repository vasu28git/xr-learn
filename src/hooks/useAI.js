import { useState, useEffect, useCallback } from 'react'
import { getAIResponse } from '../services/ai'
import { module1 } from '../config/modules/module1'
import { module2 } from '../config/modules/module2'
import { module3 } from '../config/modules/module3'
import { module4 } from '../config/modules/module4'
import { module5 } from '../config/modules/module5'
import { module6 } from '../config/modules/module6'

const modules = { 1: module1, 2: module2, 3: module3, 4: module4, 5: module5, 6: module6 }

export function useAI(moduleId, sceneState, targetState, currentCode, lastError) {
  const id = Number(moduleId)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to Module ${id}: ${modules[id]?.title || ''}! I'm your XR tutor. Read the task above, then try to complete it in the editor. Click "Need Help?" if you get stuck.`,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showHintPrompt, setShowHintPrompt] = useState(false)

  useEffect(() => {
    if (failedAttempts >= 3 && !showHintPrompt) {
      setShowHintPrompt(true)
    }
  }, [failedAttempts, showHintPrompt])

  const sendMessage = useCallback(
    async (userMessage, isHintRequest = false) => {
      const recentHistory = messages.slice(-10)

      const contextPacket = {
        moduleId: id,
        task: modules[id]?.handsOn?.task || '',
        currentCode: currentCode || '',
        sceneState: JSON.stringify(sceneState),
        targetState: JSON.stringify(targetState),
        lastError: lastError || null,
        history: recentHistory,
        message: userMessage,
        isHintRequest,
        hintsAlreadyGiven: messages.filter(m => m.role === 'assistant').length - 1,
      }

      setMessages(prev => [...prev, { role: 'user', content: userMessage }])
      setIsLoading(true)

      try {
        const response = await getAIResponse(contextPacket)
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      } catch {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm having trouble connecting right now. Try again in a moment.",
          },
        ])
      }

      setIsLoading(false)
    },
    [messages, id, sceneState, targetState, currentCode, lastError]
  )

  return {
    messages,
    sendMessage,
    isLoading,
    showHintPrompt,
    setShowHintPrompt,
    failedAttempts,
    setFailedAttempts,
  }
}
