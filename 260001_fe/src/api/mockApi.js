import { mockUser, mockJobs, mockGroups } from '../data/mockData'
import { DEMO_DATA_KEY } from './session'

// The demo "backend": same methods as httpApi, data kept in localStorage.
// It follows the same rules as the real API (default group, unique names, counts and dates
// calculated from the jobs, deleting a group moves its jobs to Default) so the demo behaves like the real app.

const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Accepted', 'Rejected']

const seed = () => ({
  jobs: structuredClone(mockJobs),
  groups: structuredClone(mockGroups)
})

const load = () => {
  try {
    const stored = localStorage.getItem(DEMO_DATA_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // fall through and start from the sample data
  }
  return seed()
}

const save = (data) => localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data))

const fail = (message) => new Error(message)

const nextId = (items) => Math.max(0, ...items.map((item) => item.id)) + 1

const blankToNull = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null)

// Adds the calculated fields the backend returns for a group
const withSummary = (group, jobs) => {
  const times = jobs
    .filter((job) => job.periodId === group.id)
    .map((job) => Date.parse(job.dateApplied))

  return {
    ...group,
    count: times.length,
    dateStart: times.length ? new Date(Math.min(...times)).toISOString() : null,
    dateEnd: times.length ? new Date(Math.max(...times)).toISOString() : null
  }
}

const validateJob = (job) => {
  if (job.companyName !== undefined && !job.companyName?.trim()) {
    throw fail('Company name cannot be empty or whitespace.')
  }
  if (job.jobTitle !== undefined && !job.jobTitle?.trim()) {
    throw fail('Job title cannot be empty or whitespace.')
  }
  if (job.status && !STATUSES.includes(job.status)) {
    throw fail("Invalid value for 'status'")
  }
  if (job.dateApplied && Date.parse(job.dateApplied) > Date.now() + 24 * 60 * 60 * 1000) {
    throw fail('Date applied cannot be in the future.')
  }
}

const requireGroup = (data, id) => {
  const group = data.groups.find((g) => g.id === Number(id))
  if (!group) throw fail('Period not found')
  return group
}

const requireUniqueName = (data, name, ignoreId) => {
  if (data.groups.some((g) => g.name === name && g.id !== ignoreId)) {
    throw fail('A period with this name already exists')
  }
}

export function startDemo() {
  save(seed())
  return { token: 'demo', user: mockUser }
}

export const mockApi = {
  jobs: {
    list: async () => {
      const { jobs } = load()
      return [...jobs].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    },

    create: async (input) => {
      const data = load()
      validateJob({ ...input, companyName: input.companyName ?? '', jobTitle: input.jobTitle ?? '' })

      const defaultGroup = data.groups.find((g) => g.isDefault)
      const periodId = input.periodId ? requireGroup(data, input.periodId).id : defaultGroup.id
      const now = new Date().toISOString()

      const job = {
        id: nextId(data.jobs),
        companyName: input.companyName.trim(),
        jobTitle: input.jobTitle.trim(),
        jobUrl: blankToNull(input.jobUrl),
        status: input.status || 'Applied',
        dateApplied: new Date(input.dateApplied).toISOString(),
        notes: blankToNull(input.notes),
        periodId,
        createdAt: now,
        updatedAt: now
      }

      save({ ...data, jobs: [...data.jobs, job] })
      return job
    },

    // Same rules as the API: a missing (null/undefined) field is left alone, an empty string clears url/notes
    update: async (id, input) => {
      const data = load()
      const job = data.jobs.find((j) => j.id === Number(id))
      if (!job) throw fail('Job application not found')

      validateJob({
        companyName: input.companyName ?? undefined,
        jobTitle: input.jobTitle ?? undefined,
        status: input.status ?? undefined,
        dateApplied: input.dateApplied ?? undefined
      })

      const updated = { ...job, updatedAt: new Date().toISOString() }
      if (input.companyName != null) updated.companyName = input.companyName.trim()
      if (input.jobTitle != null) updated.jobTitle = input.jobTitle.trim()
      if (input.jobUrl != null) updated.jobUrl = blankToNull(input.jobUrl)
      if (input.status != null) updated.status = input.status
      if (input.dateApplied != null) updated.dateApplied = new Date(input.dateApplied).toISOString()
      if (input.notes != null) updated.notes = blankToNull(input.notes)
      if (input.periodId) updated.periodId = requireGroup(data, input.periodId).id

      save({ ...data, jobs: data.jobs.map((j) => (j.id === updated.id ? updated : j)) })
      return updated
    },

    remove: async (id) => {
      const data = load()
      if (!data.jobs.some((j) => j.id === Number(id))) throw fail('Job application not found')

      save({ ...data, jobs: data.jobs.filter((j) => j.id !== Number(id)) })
    }
  },

  groups: {
    list: async () => {
      const { groups, jobs } = load()
      return groups
        .map((group) => withSummary(group, jobs))
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    },

    create: async (name) => {
      const data = load()
      const trimmed = name?.trim()
      if (!trimmed) throw fail('Period name is required')
      requireUniqueName(data, trimmed)

      const now = new Date().toISOString()
      const group = { id: nextId(data.groups), name: trimmed, isDefault: false, createdAt: now, updatedAt: now }

      save({ ...data, groups: [...data.groups, group] })
      return withSummary(group, data.jobs)
    },

    rename: async (id, name) => {
      const data = load()
      const group = requireGroup(data, id)
      const trimmed = name?.trim()
      if (!trimmed) throw fail('Period name is required')
      if (group.isDefault && trimmed !== group.name) throw fail('The default period cannot be renamed')
      requireUniqueName(data, trimmed, group.id)

      const renamed = { ...group, name: trimmed, updatedAt: new Date().toISOString() }
      save({ ...data, groups: data.groups.map((g) => (g.id === group.id ? renamed : g)) })
      return withSummary(renamed, data.jobs)
    },

    remove: async (id) => {
      const data = load()
      const group = requireGroup(data, id)
      if (group.isDefault) throw fail('Cannot delete the default period')

      const defaultGroup = data.groups.find((g) => g.isDefault)
      save({
        groups: data.groups.filter((g) => g.id !== group.id),
        jobs: data.jobs.map((job) => (job.periodId === group.id ? { ...job, periodId: defaultGroup.id } : job))
      })
    }
  }
}
