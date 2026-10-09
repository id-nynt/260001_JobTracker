import { computeStats } from './stats'

const job = (status, dateApplied = '2026-03-04T00:00:00Z') => ({ status, dateApplied })

describe('computeStats', () => {
  it('derives the rates from the mix of statuses', () => {
    const jobs = [
      ...Array(4).fill(null).map(() => job('Applied')),
      ...Array(2).fill(null).map(() => job('Interviewing')),
      job('Offered'),
      job('Accepted'),
      ...Array(2).fill(null).map(() => job('Rejected'))
    ]

    const stats = computeStats(jobs)

    expect(stats.total).toBe(10)
    expect(stats.byStatus).toEqual({ Applied: 4, Interviewing: 2, Offered: 1, Accepted: 1, Rejected: 2 })
    expect(stats.responseRate).toBeCloseTo(0.6) // everything except "Applied"; a rejection is still an answer
    expect(stats.interviewRate).toBeCloseTo(0.4) // Interviewing + Offered + Accepted
    expect(stats.offerRate).toBeCloseTo(0.2) // Offered + Accepted
  })

  it('reports no rates (not 0% or NaN) when there are no applications yet', () => {
    const stats = computeStats([])

    expect(stats.total).toBe(0)
    expect(stats.responseRate).toBeNull()
    expect(stats.interviewRate).toBeNull()
    expect(stats.offerRate).toBeNull()
  })

  it('counts applications per Monday-to-Sunday week, fills empty weeks and ignores dates outside the window', () => {
    const now = new Date('2026-03-11T12:00:00Z') // a Wednesday; its week starts Monday 9 March
    const jobs = [
      job('Applied', '2026-03-15T00:00:00Z'), // Sunday of the current week
      job('Applied', '2026-03-09T00:00:00Z'), // Monday of the current week
      job('Applied', '2026-03-08T23:59:59Z'), // Sunday: belongs to the previous week
      job('Applied', '2026-02-23T00:00:00Z'), // Monday, two weeks back
      job('Applied', '2026-02-22T00:00:00Z'), // Sunday before the window
      job('Applied', '2026-03-30T00:00:00Z') // after the current week
    ]

    const { weekly } = computeStats(jobs, { now, weeks: 3 })

    expect(weekly.map((week) => week.weekStart.slice(0, 10))).toEqual(['2026-02-23', '2026-03-02', '2026-03-09'])
    expect(weekly.map((week) => week.count)).toEqual([1, 1, 2])
  })
})
