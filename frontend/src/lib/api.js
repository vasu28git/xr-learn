const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  auth: {
    async login(email, password) {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
        window.dispatchEvent(new Event('auth-state-change'));
      }
      return data;
    },
    async guest() {
      const data = await fetchAPI('/auth/guest', {
        method: 'POST',
      });
      if (data.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
        window.dispatchEvent(new Event('auth-state-change'));
      }
      return data;
    },
    async signup(email, password, fullName) {
      const data = await fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      });
      if (data.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
        window.dispatchEvent(new Event('auth-state-change'));
      }
      return data;
    },
    async logout() {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-state-change'));
    },
    async getCurrentUser() {
      return fetchAPI('/auth/me');
    }
  },
  progress: {
    async getAll() {
      return fetchAPI('/progress');
    },
    async get(moduleId) {
      return fetchAPI(`/progress/${moduleId}`);
    },
    async update(moduleId, completed, attempts) {
      return fetchAPI(`/progress/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed, attempts }),
      });
    }
  },
  ai: {
    async tutor(contextPacket) {
      return fetchAPI('/ai-tutor', {
        method: 'POST',
        body: JSON.stringify(contextPacket),
      });
    }
  },
  execute: {
    async run(source) {
      return fetchAPI('/execute', {
        method: 'POST',
        body: JSON.stringify({ source }),
      });
    }
  },
  diagnostic: {
    async check() {
      return fetchAPI('/diagnostic');
    },
    async submit(payload) {
      return fetchAPI('/diagnostic', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  },
  voiceTutor: {
    async chat(payload) {
      return fetchAPI('/voice-tutor/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async tts(text) {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/voice-tutor/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ text }),
      });
      // 204 = ElevenLabs not configured, gracefully skip audio
      if (response.status === 204) return null;
      if (!response.ok) throw new Error('TTS request failed');
      return response.blob();
    }
  }
};
