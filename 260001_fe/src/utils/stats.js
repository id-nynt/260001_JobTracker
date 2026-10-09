// Statistics shown on the dashboard. Pure functions, so the demo and the real backend share them.

const DAY_MS = 24 * 60 * 60 * 1000

// A job counts as "answered" once the company has reacted in any way, including a rejection
const ANSWERED = ['Interviewing', 'Offered', 'Accepted', 'Rejected']
const REACHED_INTERVIEW = ['Interviewing', 'Offered', 'Accepted']
const REACHED_OFFER = ['Offered', 'Accepted']

export const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Accepted', 'Rejected']

/** Monday 00:00 (UTC) of the week containing `date`. Dates are stored as UTC, so weeks are UTC too. */
export function startOfWeek(date) {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const daysSinceMonday = (day.getUTCDay() + 6) % 7
  return new Date(day.getTime() - daysSinceMonday * DAY_MS)
}

/**
 * @param {Array<{status: string, dateApplied: string}>} jobs
 * @returns rates are fractions (0..1), or null when there are no applications yet;
 *          `weekly` has one entry per week (oldest first), including weeks with no applications.
 */
export function computeStats(jobs, { now = new Date(), weeks = 8 } = {}) {
  const total = jobs.length
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]))
  jobs.forEach((job) => {
    if (job.status in byStatus) byStatus[job.status] += 1
  })

  const share = (statuses) =>
    total === 0 ? null : statuses.reduce((sum, status) => sum + byStatus[status], 0) / total

  const thisWeek = startOfWeek(now).getTime()
  const weekly = Array.from({ length: weeks }, (_, i) => ({
    weekStart: new Date(thisWeek - (weeks - 1 - i) * 7 * DAY_MS).toISOString(),
    count: 0
  }))

  jobs.forEach((job) => {
    const weeksAgo = Math.round((thisWeek - startOfWeek(new Date(job.dateApplied)).getTime()) / (7 * DAY_MS))
    if (weeksAgo >= 0 && weeksAgo < weeks) weekly[weeks - 1 - weeksAgo].count += 1
  })

  return {
    total,
    byStatus,
    responseRate: share(ANSWERED),
    interviewRate: share(REACHED_INTERVIEW),
    offerRate: share(REACHED_OFFER),
    weekly
  }
}
