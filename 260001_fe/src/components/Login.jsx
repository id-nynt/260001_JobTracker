import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/authAPI'
import { useTheme } from '../context/ThemeContext'

function Login({ onLoginSuccess }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!emailOrUsername || !password) {
      setError('Please fill in all fields')
      return
    }

    setError('')
    setLoading(true)

    try {
      console.log('Attempting login with:', emailOrUsername)
      const response = await authAPI.login(emailOrUsername, password)
      console.log('Login response:', response.data)

      if (response.data.success) {
        console.log('Login successful, storing token and user')
        authAPI.setToken(response.data.token)
        authAPI.setUser(response.data.user)
        
        // Notify parent App component
        if (onLoginSuccess) {
          console.log('Calling onLoginSuccess callback')
          onLoginSuccess(response.data.user, response.data.token)
        }
        
        console.log('Token stored, navigating to dashboard...')
        navigate('/dashboard', { replace: true })
      } else {
        const errorMsg = response.data.message || 'Login failed'
        console.log('Login failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('Login error details:', err)
      console.error('Error response:', err.response?.data)
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed. Please try again.'
      console.log('Setting error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center px-4`}>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg shadow-lg p-8 w-full max-w-md`}>
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-6 text-center`}>Login</h2>

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
            disabled={loading}
            className={`w-full px-4 py-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600' : 'bg-black hover:bg-gray-800 disabled:bg-gray-400'} text-white font-medium rounded-lg transition duration-200`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center mt-4`}>
          Don't have an account?{' '}
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
