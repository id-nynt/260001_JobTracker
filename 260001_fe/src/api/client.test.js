import { getErrorMessage } from './client'
import { DEMO_DATA_KEY, getSession, saveSession } from './session'

describe('getErrorMessage', () => {
  it.each([
    [
      'ProblemDetails detail',
      { response: { status: 401, data: { detail: 'Invalid email/username or password' } } },
      'Invalid email/username or password'
    ],
    ['plain-string body', { response: { status: 404, data: 'Job application not found' } }, 'Job application not found'],
    [
      'rate limit (empty body)',
      { response: { status: 429, data: '' } },
      'Too many attempts. Please wait a minute and try again.'
    ],
    ['unhelpful server error', { response: { status: 500, data: {} } }, 'fallback text'],
    ['no response at all', { request: {} }, "Can't reach the server. Please check your connection and try again."],
    ['plain Error from the demo store', new Error('Period not found'), 'Period not found']
  ])('%s', (_name, error, expected) => {
    expect(getErrorMessage(error, 'fallback text')).toBe(expected)
  })
})

describe('session', () => {
  it('discards the demo data when a real account signs in, and keeps it for the demo', () => {
    localStorage.setItem(DEMO_DATA_KEY, '{"jobs":[],"groups":[]}')

    saveSession({ mode: 'demo', token: 'demo', user: {} })
    expect(localStorage.getItem(DEMO_DATA_KEY)).not.toBeNull()

    saveSession({ mode: 'api', token: 'real', user: {} })
    expect(localStorage.getItem(DEMO_DATA_KEY)).toBeNull()
    expect(getSession().mode).toBe('api')
  })
})
