// The signed-in session lives in localStorage so a refresh keeps the user logged in.
//   mode 'api'  -> real account, data lives on the backend
//   mode 'demo' -> no account, data lives only in this browser (see mockApi.js)
const SESSION_KEY = 'session'

export const DEMO_DATA_KEY = 'demo_data'

export function getSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))

  // Leaving the demo for a real account: the sample data is no longer needed
  if (session.mode !== 'demo') {
    localStorage.removeItem(DEMO_DATA_KEY)
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(DEMO_DATA_KEY)
}
