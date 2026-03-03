import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
  register: (email, username, password, confirmPassword) => 
    apiClient.post('/auth/register', {
      email,
      username,
      password,
      confirmPassword
    }),

  login: (emailOrUsername, password) => 
    apiClient.post('/auth/login', {
      emailOrUsername,
      password
    }),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
