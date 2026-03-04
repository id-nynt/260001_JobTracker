import axios from 'axios'
import { mockUser } from '../data/mockData'

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
    if (USE_MOCK_DATA) {
      const user = { ...mockUser, email, username }
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', user.token)
      return Promise.resolve({ data: { user, token: user.token } })
    }
    return apiClient.post('/auth/register', {
      email,
      username,
      password,
      confirmPassword
    })
  },

  login: (emailOrUsername, password) => {
    if (USE_MOCK_DATA) {
      // Accept mock credentials for demo
      if ((emailOrUsername === mockUser.email || emailOrUsername === mockUser.username) && password === 'jobtracker@janny') {
        localStorage.setItem('user', JSON.stringify(mockUser))
        localStorage.setItem('token', mockUser.token)
        return Promise.resolve({ data: { user: mockUser, token: mockUser.token } })
      }
      return Promise.reject(new Error('Invalid credentials'))
    }
    return apiClient.post('/auth/login', {
      emailOrUsername,
      password
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
