import axios from 'axios'
import { mockGroups } from '../data/mockData'

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

// Helper to get mock data with fallback
const getMockGroupsData = () => {
  const stored = localStorage.getItem('mock_groups')
  return stored ? JSON.parse(stored) : mockGroups
}

export const groupAPI = {
  getGroups: async () => {
    if (USE_MOCK_DATA) {
      return { data: getMockGroupsData() }
    }
    try {
      return await apiClient.get('/periods')
    } catch (error) {
      console.warn('API unavailable, using mock data')
      return { data: getMockGroupsData() }
    }
  },
  
  getGroup: (id) => {
    if (USE_MOCK_DATA) {
      const group = getMockGroupsData().find(g => g.id === id)
      return Promise.resolve({ data: group })
    }
    return apiClient.get(`/periods/${id}`)
  },
  
  createGroup: (name) => {
    if (USE_MOCK_DATA) {
      const groups = getMockGroupsData()
      const newGroup = { id: Math.max(...groups.map(g => g.id), 0) + 1, name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const updated = [...groups, newGroup]
      localStorage.setItem('mock_groups', JSON.stringify(updated))
      return Promise.resolve({ data: newGroup })
    }
    return apiClient.post('/periods', { name })
  },
  
  updateGroup: (id, name) => {
    if (USE_MOCK_DATA) {
      const groups = getMockGroupsData()
      const index = groups.findIndex(g => g.id === id)
      if (index >= 0) {
        groups[index] = { ...groups[index], name, updatedAt: new Date().toISOString() }
        localStorage.setItem('mock_groups', JSON.stringify(groups))
        return Promise.resolve({ data: groups[index] })
      }
    }
    return apiClient.put(`/periods/${id}`, { name })
  },
  
  deleteGroup: (id) => {
    if (USE_MOCK_DATA) {
      const groups = getMockGroupsData()
      const filtered = groups.filter(g => g.id !== id)
      localStorage.setItem('mock_groups', JSON.stringify(filtered))
      return Promise.resolve({ data: { id } })
    }
    return apiClient.delete(`/periods/${id}`)
  },
}

export default apiClient
