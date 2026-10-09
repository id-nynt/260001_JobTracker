import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getErrorMessage, API_CONFIGURED, wakeServer } from '../api'
import { useSlowNotice } from '../hooks/useSlowNotice'
import { useTheme } from '../context/ThemeContext'

function Login({ onAuthenticated }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const slow = useSlowNotice(loading)

  // Start waking a sleeping free-tier backend while the user is still typing
  useEffect(() => {
    wakeServer()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!emailOrUsername || !password) {
      setError('Please fill in all fields')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { token, user } = await api.auth.login(emailOrUsername, password)
      onAuthenticated({ mode: 'api', token, user })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = () => {
    onAuthenticated({ mode: 'demo', ...api.auth.startDemo() })
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center px-4`}>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg shadow-lg p-8 w-full max-w-md`}>
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-6 text-center`}>Login</h2>

        {!API_CONFIGURED && (
          <div className={`mb-4 p-3 ${isDark ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900'} rounded-lg text-sm`}>
            Accounts are not available on this site yet. Try the demo instead.
          </div>
        )}

        {error && (
          <div className={`mb-4 p-3 ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} rounded-lg text-sm`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="emailOrUsername" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Email or Username
            </label>
            <input
              type="text"
              id="emailOrUsername"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-200 border-gray-400 text-black placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-blue-500`}
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-200 border-gray-400 text-black placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-blue-500`}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !API_CONFIGURED}
            className={`w-full px-4 py-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600' : 'bg-black hover:bg-gray-800 disabled:bg-gray-400'} text-white font-medium rounded-lg transition duration-200`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {slow && (
            <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              The server runs on free hosting and may need up to a minute to wake up. Thanks for waiting.
            </p>
          )}
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleDemo}
            className={`w-full px-4 py-2 border ${isDark ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-400 text-gray-800 hover:bg-gray-200'} font-medium rounded-lg transition duration-200`}
          >
            Try the demo (no sign-up)
          </button>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs text-center mt-2`}>
            Sample data, saved only in this browser.
          </p>
        </div>

        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center mt-4`}>
          Don&apos;t have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
