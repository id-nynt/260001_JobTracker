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

export const groupAPI = {
  getGroups: () => apiClient.get('/periods'),
  getGroup: (id) => apiClient.get(`/periods/${id}`),
  createGroup: (name) => apiClient.post('/periods', { name }),
  updateGroup: (id, name) => apiClient.put(`/periods/${id}`, { name }),
  deleteGroup: (id) => apiClient.delete(`/periods/${id}`),
}

export default apiClient
