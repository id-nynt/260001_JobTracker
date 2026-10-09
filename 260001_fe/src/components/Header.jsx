import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { MoonIcon, SunIcon } from './Icons'

function Header({ user, onLogout }) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border-b py-6`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Job Application Tracker</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Track your job applications and progress</p>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className={`text-right`}>
              <p className={`${isDark ? 'text-white' : 'text-black'} font-medium`}>{user.username}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{user.email}</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`px-3 py-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500'} rounded-lg transition duration-200 inline-flex items-center justify-center`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <MoonIcon color="white" size={20} />
              ) : (
                <SunIcon color="white" size={20} />
              )}
            </button>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500'} text-white font-medium rounded-lg transition duration-200`}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
