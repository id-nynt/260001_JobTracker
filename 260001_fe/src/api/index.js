import { getSession } from './session'
import { httpApi } from './httpApi'
import { mockApi, startDemo } from './mockApi'

export { getErrorMessage, API_CONFIGURED, wakeServer } from './client'

// Data calls go to the demo store or the real backend depending on the current session.
const current = () => (getSession()?.mode === 'demo' ? mockApi : httpApi)

const delegate = (area, methods) =>
  Object.fromEntries(methods.map((method) => [method, (...args) => current()[area][method](...args)]))

export const api = {
  auth: {
    // Signing in always talks to the real backend; the demo needs no account
    login: (...args) => httpApi.auth.login(...args),
    register: (...args) => httpApi.auth.register(...args),
    startDemo
  },
  jobs: delegate('jobs', ['list', 'create', 'update', 'remove']),
  groups: delegate('groups', ['list', 'create', 'rename', 'remove'])
}
