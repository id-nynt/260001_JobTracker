import apiClient from './client'

// The real backend. Errors are never swallowed: they reach the caller, which shows them.

const unwrap = (response) => response.data

const toAuthResult = ({ data }) => ({ token: data.token, user: data.user })

// Only send what the API understands (the edit form holds the whole job, including ids and timestamps)
const toJobPayload = (job) => ({
  companyName: job.companyName,
  jobTitle: job.jobTitle,
  jobUrl: job.jobUrl,
  status: job.status,
  dateApplied: job.dateApplied,
  notes: job.notes,
  periodId: job.periodId
})

export const httpApi = {
  auth: {
    login: (emailOrUsername, password) =>
      apiClient.post('/auth/login', { emailOrUsername, password }).then(toAuthResult),

    register: (email, username, password, confirmPassword) =>
      apiClient.post('/auth/register', { email, username, password, confirmPassword }).then(toAuthResult)
  },

  jobs: {
    list: () => apiClient.get('/jobs').then(unwrap),
    create: (job) => apiClient.post('/jobs', toJobPayload(job)).then(unwrap),
    update: (id, job) => apiClient.put(`/jobs/${id}`, toJobPayload(job)).then(unwrap),
    remove: (id) => apiClient.delete(`/jobs/${id}`).then(() => undefined)
  },

  groups: {
    list: () => apiClient.get('/periods').then(unwrap),
    create: (name) => apiClient.post('/periods', { name }).then(unwrap),
    rename: (id, name) => apiClient.put(`/periods/${id}`, { name }).then(unwrap),
    remove: (id) => apiClient.delete(`/periods/${id}`).then(() => undefined)
  }
}
