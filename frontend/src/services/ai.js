import { api } from '../lib/api'

export async function getAIResponse(contextPacket) {
  try {
    const data = await api.ai.tutor(contextPacket)
    return data.message
  } catch (err) {
    console.error('AI service error:', err)
    return "I'm having trouble connecting right now. Try again in a moment."
  }
}
