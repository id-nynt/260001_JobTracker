import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/authAPI'
import { useTheme } from '../context/ThemeContext'

function Register({ onLoginSuccess }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      console.log('Attempting registration:', { email, username })
      const response = await authAPI.register(email, username, password, confirmPassword)
      console.log('Registration response:', response.data)

      if (response.data.success) {
        console.log('Registration successful, storing token and user')
        authAPI.setToken(response.data.token)
        authAPI.setUser(response.data.user)
        
        // Notify parent App component
        if (onLoginSuccess) {
          console.log('Calling onLoginSuccess callback')
          onLoginSuccess(response.data.user, response.data.token)
        }
        
        navigate('/dashboard', { replace: true })
      } else {
        const errorMsg = response.data.message || 'Registration failed'
        console.log('Registration failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('Registration error details:', err)
      console.error('Error response:', err.response?.data)
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      console.log('Setting error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center px-4`}>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg shadow-lg p-8 w-full max-w-md`}>
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-6 text-center`}>Register</h2>

        {error && (
          <div className={`mb-4 p-3 ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} rounded-lg text-sm`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-200 border-gray-400 text-black placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-blue-500`}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-200 border-gray-400 text-black placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-blue-500`}
              placeholder="Choose a username"
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
              placeholder="Enter a password (min 6 characters)"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-200 border-gray-400 text-black placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-blue-500`}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 ${isDark ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600' : 'bg-black hover:bg-gray-800 disabled:bg-gray-400'} text-white font-medium rounded-lg transition duration-200`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center mt-4`}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
