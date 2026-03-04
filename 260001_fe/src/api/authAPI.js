import axios from 'axios'
import { mockUser, mockJobs, mockGroups } from '../data/mockData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (email, username, password, confirmPassword) => {
    // If USE_MOCK_DATA is explicitly true, use mock
    if (USE_MOCK_DATA) {
      const user = { ...mockUser, email, username }
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', user.token)
      localStorage.setItem('mock_jobs', JSON.stringify(mockJobs))
      localStorage.setItem('mock_groups', JSON.stringify(mockGroups))
      return Promise.resolve({ data: { success: true, user, token: user.token } })
    }
    
    // Otherwise, try backend and fallback to mock if it fails
    return apiClient.post('/auth/register', {
      email,
      username,
      password,
      confirmPassword
    }).catch(() => {
      // Backend failed, use mock data instead
      const user = { ...mockUser, email, username }
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', user.token)
      localStorage.setItem('mock_jobs', JSON.stringify(mockJobs))
      localStorage.setItem('mock_groups', JSON.stringify(mockGroups))
      return Promise.resolve({ data: { success: true, user, token: user.token } })
    })
  },

  login: (emailOrUsername, password) => {
    // If USE_MOCK_DATA is explicitly true, use mock only
    if (USE_MOCK_DATA) {
      if (emailOrUsername && password) {
        const user = { ...mockUser, email: emailOrUsername, username: emailOrUsername }
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', user.token)
        localStorage.setItem('mock_jobs', JSON.stringify(mockJobs))
        localStorage.setItem('mock_groups', JSON.stringify(mockGroups))
        return Promise.resolve({ data: { success: true, user, token: user.token } })
      }
      return Promise.reject(new Error('Please provide email and password'))
    }
    
    // Otherwise, try backend and fallback to mock if it fails
    return apiClient.post('/auth/login', {
      emailOrUsername,
      password
    }).catch(() => {
      // Backend failed, fallback to mock data
      if (emailOrUsername && password) {
        const user = { ...mockUser, email: emailOrUsername, username: emailOrUsername }
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', user.token)
        localStorage.setItem('mock_jobs', JSON.stringify(mockJobs))
        localStorage.setItem('mock_groups', JSON.stringify(mockGroups))
        return Promise.resolve({ data: { success: true, user, token: user.token } })
      }
      return Promise.reject(new Error('Login failed'))
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('mock_groups')
    localStorage.removeItem('mock_jobs')
  },

  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setToken: (token) => localStorage.setItem('token', token),
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  isAuthenticated: () => !!localStorage.getItem('token')
}

export default apiClient
