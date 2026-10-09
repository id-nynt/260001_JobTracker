import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import Login from './Login'
import { api } from '../api'

vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal()),
  api: { auth: { login: vi.fn(), startDemo: vi.fn() } }
}))

const renderLogin = (onAuthenticated = vi.fn()) => {
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login onAuthenticated={onAuthenticated} />} />
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  )
  return onAuthenticated
}

const submitCredentials = async (user) => {
  await user.type(screen.getByLabelText('Email or Username'), 'alice')
  await user.type(screen.getByLabelText('Password'), 'wrong-password')
  await user.click(screen.getByRole('button', { name: 'Login' }))
}

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks())

  it("shows the API's message and stays on the page when the password is wrong", async () => {
    api.auth.login.mockRejectedValue({ response: { status: 401, data: { detail: 'Invalid email/username or password' } } })
    const onAuthenticated = renderLogin()

    await submitCredentials(userEvent.setup())

    expect(await screen.findByText('Invalid email/username or password')).toBeInTheDocument()
    expect(onAuthenticated).not.toHaveBeenCalled()
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
  })

  it('starts a real session and opens the dashboard on success', async () => {
    const user = { id: 1, username: 'alice', email: 'alice@example.com' }
    api.auth.login.mockResolvedValue({ token: 'jwt', user })
    const onAuthenticated = renderLogin()

    await submitCredentials(userEvent.setup())

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    expect(onAuthenticated).toHaveBeenCalledWith({ mode: 'api', token: 'jwt', user })
  })

  it('opens the demo without any credentials', async () => {
    const user = { id: 0, username: 'Demo user', email: 'demo@example.com' }
    api.auth.startDemo.mockReturnValue({ token: 'demo', user })
    const onAuthenticated = renderLogin()

    await userEvent.setup().click(screen.getByRole('button', { name: /try the demo/i }))

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    expect(onAuthenticated).toHaveBeenCalledWith({ mode: 'demo', token: 'demo', user })
    expect(api.auth.login).not.toHaveBeenCalled()
  })
})
