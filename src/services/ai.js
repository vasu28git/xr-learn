import { supabase } from '../lib/supabase'

export async function getAIResponse(contextPacket) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-tutor', {
      body: contextPacket
    })
    if (error) {
      console.error('AI function error:', error)
      return "I'm having trouble connecting right now. Try again in a moment."
    }
    return data.message
  } catch (err) {
    console.error('AI service error:', err)
    return "I'm having trouble connecting right now. Try again in a moment."
  }
}
