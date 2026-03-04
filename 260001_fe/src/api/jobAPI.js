import axios from 'axios'
import { mockJobs } from '../data/mockData'

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
const getMockJobsData = () => {
  const stored = localStorage.getItem('mock_jobs')
  return stored ? JSON.parse(stored) : mockJobs
}

export const jobAPI = {
  getJobs: async () => {
    if (USE_MOCK_DATA) {
      return { data: getMockJobsData() }
    }
    try {
      return await apiClient.get('/jobs')
    } catch (error) {
      console.warn('API unavailable, using mock data')
      return { data: getMockJobsData() }
    }
  },
  
  getJob: (id) => {
    if (USE_MOCK_DATA) {
      const job = getMockJobsData().find(j => j.id === id)
      return Promise.resolve({ data: job })
    }
    return apiClient.get(`/jobs/${id}`)
  },
  
  createJob: (data) => {
    if (USE_MOCK_DATA) {
      const jobs = getMockJobsData()
      const newJob = { ...data, id: Math.max(...jobs.map(j => j.id), 0) + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const updated = [...jobs, newJob]
      localStorage.setItem('mock_jobs', JSON.stringify(updated))
      return Promise.resolve({ data: newJob })
    }
    return apiClient.post('/jobs', data)
  },
  
  updateJob: (id, data) => {
    if (USE_MOCK_DATA) {
      const jobs = getMockJobsData()
      const index = jobs.findIndex(j => j.id === id)
      if (index >= 0) {
        jobs[index] = { ...jobs[index], ...data, updatedAt: new Date().toISOString() }
        localStorage.setItem('mock_jobs', JSON.stringify(jobs))
        return Promise.resolve({ data: jobs[index] })
      }
    }
    return apiClient.put(`/jobs/${id}`, data)
  },
  
  deleteJob: (id) => {
    if (USE_MOCK_DATA) {
      const jobs = getMockJobsData()
      const filtered = jobs.filter(j => j.id !== id)
      localStorage.setItem('mock_jobs', JSON.stringify(filtered))
      return Promise.resolve({ data: { id } })
    }
    return apiClient.delete(`/jobs/${id}`)
  },
}

export default apiClient
