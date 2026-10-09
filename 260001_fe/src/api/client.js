import axios from 'axios'
import { getSession, clearSession } from './session'

const configuredUrl = import.meta.env.VITE_API_URL

// In development the Vite proxy forwards /api to the local backend.
// A production build only talks to a backend when VITE_API_URL is set.
export const API_CONFIGURED = Boolean(configuredUrl) || import.meta.env.DEV

const apiClient = axios.create({
  baseURL: configuredUrl || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.mode === 'api' && session.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.startsWith('/auth/')

    // An expired or rejected token: drop the session and send the user back to the login page.
    // (A 401 from /auth/* just means "wrong password" and is shown by the form.)
    if (error.response?.status === 401 && !isAuthRequest && getSession()?.mode === 'api') {
      clearSession()
      window.location.assign('/login')
    }

    return Promise.reject(error)
  }
)

/**
 * Free hosting puts the backend to sleep when idle and the first request can take ~30 seconds.
 * Calling this when the login page opens starts the wake-up while the user is still typing.
 */
export function wakeServer() {
  if (!configuredUrl) return

  try {
    const { origin } = new URL(configuredUrl, window.location.origin)
    fetch(`${origin}/health`, { mode: 'no-cors' }).catch(() => {})
  } catch {
    // a failed wake-up ping must never get in the user's way
  }
}

/** Turns any error from the API layer into a message that can be shown to the user. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response) {
    const { status, data } = error.response

    if (status === 429) return 'Too many attempts. Please wait a minute and try again.'

    // Controllers return either ProblemDetails ({ detail }) or a plain string
    if (typeof data === 'string' && data) return data
    return data?.detail || data?.title || fallback
  }

  if (error?.request) {
    return "Can't reach the server. Please check your connection and try again."
  }

  return error?.message || fallback
}

export default apiClient
