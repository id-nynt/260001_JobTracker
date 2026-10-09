// Demo user (no real account behind it)
export const mockUser = {
  id: 0,
  email: 'demo@example.com',
  username: 'Demo user'
}

// Demo groups. Job counts and date ranges are not stored: mockApi calculates them from the jobs,
// the same way the backend does.
export const mockGroups = [
  {
    id: 1,
    name: '2026_Data',
    isDefault: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: '2026_Software',
    isDefault: false,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 3,
    name: 'Default',
    isDefault: true,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z'
  }
]

// Mock job applications - 10 total with all statuses
export const mockJobs = [
  // 2026_Data group (5 jobs)
  {
    id: 1,
    companyName: 'Google',
    jobTitle: 'Data Analyst',
    jobUrl: 'https://google.com/careers/data-analyst',
    dateApplied: '2026-02-01T08:30:00Z',
    status: 'Applied',
    notes: 'Applied through LinkedIn. Waiting for response. Strong match for role.',
    periodId: 1,
    createdAt: '2026-02-01T08:30:00Z',
    updatedAt: '2026-02-01T08:30:00Z'
  },
  {
    id: 2,
    companyName: 'Meta',
    jobTitle: 'Data Engineering Intern',
    jobUrl: 'https://meta.com/careers/data-engineering',
    dateApplied: '2026-01-28T14:15:00Z',
    status: 'Interviewing',
    notes: 'Phone screening completed on 2/3. Passed initial assessment. Waiting for technical round.',
    periodId: 1,
    createdAt: '2026-01-28T14:15:00Z',
    updatedAt: '2026-02-03T09:00:00Z'
  },
  {
    id: 3,
    companyName: 'Amazon',
    jobTitle: 'Analytics Engineer',
    jobUrl: 'https://amazon.com/careers/analytics',
    dateApplied: '2026-02-05T11:00:00Z',
    status: 'Rejected',
    notes: 'Application rejected on 2/7. Feedback: Overqualified position. Will reapply for senior role.',
    periodId: 1,
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-07T16:30:00Z'
  },
  {
    id: 4,
    companyName: 'McKinsey',
    jobTitle: 'Data Scientist',
    jobUrl: 'https://mckinsey.com/careers/data-science',
    dateApplied: '2026-02-02T09:45:00Z',
    status: 'Offered',
    notes: 'Received offer on 2/8. Negotiating salary. Expected response by 2/15.',
    periodId: 1,
    createdAt: '2026-02-02T09:45:00Z',
    updatedAt: '2026-02-08T15:00:00Z'
  },
  {
    id: 5,
    companyName: 'Microsoft',
    jobTitle: 'Business Intelligence Analyst',
    jobUrl: 'https://microsoft.com/careers/bi-analyst',
    dateApplied: '2026-02-06T10:20:00Z',
    status: 'Accepted',
    notes: 'Offer accepted on 2/11. Start date: March 15, 2026. Completed onboarding paperwork.',
    periodId: 1,
    createdAt: '2026-02-06T10:20:00Z',
    updatedAt: '2026-02-11T14:30:00Z'
  },

  // 2026_Software group (5 jobs)
  {
    id: 6,
    companyName: 'Apple',
    jobTitle: 'iOS Developer',
    jobUrl: 'https://apple.com/careers/ios-dev',
    dateApplied: '2026-02-04T13:30:00Z',
    status: 'Applied',
    notes: 'Applied via company career page. Portfolio submitted. Tech stack: Swift, Objective-C.',
    periodId: 2,
    createdAt: '2026-02-04T13:30:00Z',
    updatedAt: '2026-02-04T13:30:00Z'
  },
  {
    id: 7,
    companyName: 'Netflix',
    jobTitle: 'Full Stack Engineer',
    jobUrl: 'https://netflix.com/careers/fullstack',
    dateApplied: '2026-01-30T16:00:00Z',
    status: 'Interviewing',
    notes: 'Round 1 completed (2/8). Behavioral interview went well. Technical round scheduled 2/14.',
    periodId: 2,
    createdAt: '2026-01-30T16:00:00Z',
    updatedAt: '2026-02-08T17:30:00Z'
  },
  {
    id: 8,
    companyName: 'Tesla',
    jobTitle: 'Backend Engineer',
    jobUrl: 'https://tesla.com/careers/backend',
    dateApplied: '2026-02-07T12:00:00Z',
    status: 'Rejected',
    notes: 'Rejected on 2/9. Feedback: Seeking more DevOps experience. Encouraged to reapply in 6 months.',
    periodId: 2,
    createdAt: '2026-02-07T12:00:00Z',
    updatedAt: '2026-02-09T10:15:00Z'
  },
  {
    id: 9,
    companyName: 'Airbnb',
    jobTitle: 'Frontend Engineer',
    jobUrl: 'https://airbnb.com/careers/frontend',
    dateApplied: '2026-02-03T15:45:00Z',
    status: 'Offered',
    notes: 'Offer received 2/9! Salary: $180k base + equity. Signing deadline 2/20.',
    periodId: 2,
    createdAt: '2026-02-03T15:45:00Z',
    updatedAt: '2026-02-09T14:00:00Z'
  },
  {
    id: 10,
    companyName: 'Stripe',
    jobTitle: 'Full Stack Engineer',
    jobUrl: 'https://stripe.com/careers/fullstack',
    dateApplied: '2026-02-08T11:30:00Z',
    status: 'Accepted',
    notes: 'Offer accepted on 2/10! Negotiated $165k + equity. Start date: April 1, 2026.',
    periodId: 2,
    createdAt: '2026-02-08T11:30:00Z',
    updatedAt: '2026-02-10T16:00:00Z'
  }
]

// Mock responses matching API format
export const mockResponses = {
  user: {
    success: true,
    data: mockUser,
    message: 'Mock user loaded for demo'
  },
  groups: {
    success: true,
    data: mockGroups,
    message: 'Mock groups loaded'
  },
  jobs: {
    success: true,
    data: mockJobs,
    message: 'Mock jobs loaded'
  }
}
