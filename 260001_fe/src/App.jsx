import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import JobForm from './components/JobForm'
import GroupCard from './components/GroupCard'
import SimpleGroupControl from './components/SimpleGroupControl'
import Login from './components/Login'
import Register from './components/Register'
import { jobAPI } from './api/jobAPI'
import { authAPI } from './api/authAPI'
import { groupAPI } from './api/groupAPI'
import { ThemeProvider, useTheme } from './context/ThemeContext'

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function Dashboard() {
  const { isDark } = useTheme()
  const [groups, setGroups] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  // Fetch groups and jobs on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [groupsRes, jobsRes] = await Promise.all([
        groupAPI.getGroups(),
        jobAPI.getJobs()
      ])
      setGroups(groupsRes.data)
      setJobs(jobsRes.data)
      // Set default selected group
      if (groupsRes.data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groupsRes.data[0].id)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddJob = async (newJob) => {
    try {
      const response = await jobAPI.createJob(newJob)
      setJobs([response.data, ...jobs])
      // Refresh groups to update counts and dates
      await fetchData()
    } catch (err) {
      alert('Failed to create job. Please try again.')
      console.error('Error creating job:', err)
    }
  }

  const handleDeleteJob = async (jobId) => {
    try {
      await jobAPI.deleteJob(jobId)
      setJobs(jobs.filter(job => job.id !== jobId))
      // Refresh groups to update counts and dates
      await fetchData()
    } catch (err) {
      alert('Failed to delete job. Please try again.')
      console.error('Error deleting job:', err)
    }
  }

  const handleUpdateJob = async (updatedJob) => {
    try {
      const response = await jobAPI.updateJob(updatedJob.id, updatedJob)
      setJobs(jobs.map(job => job.id === updatedJob.id ? response.data : job))
      // Refresh groups if period changed
      await fetchData()
    } catch (err) {
      alert('Failed to update job. Please try again.')
      console.error('Error updating job:', err)
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className={isDark ? 'text-white' : 'text-black'}>Loading...</p>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className={`mb-6 p-4 ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} rounded-lg`}>
          {error}
        </div>
      )}

      {/* Two Column Layout: Form on Left, Applications on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Application Form Section */}
        <div>
          <JobForm onAddJob={handleAddJob} groups={groups} selectedGroupId={selectedGroupId} />
        </div>

        {/* Right Column: Applications Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Applications</h2>
            <SimpleGroupControl onRefresh={fetchData} />
          </div>
          {groups.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No groups found</p>
          ) : (
            <div className="space-y-3">
              {groups.map(group => {
                const groupJobs = jobs.filter(job => job.periodId === group.id)
                return (
                  <GroupCard
                    key={group.id}
                    group={group}
                    jobs={groupJobs}
                    onDeleteJob={handleDeleteJob}
                    onUpdateJob={handleUpdateJob}
                    onRefresh={fetchData}
                    groups={groups}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function AppContent() {
  const { isDark } = useTheme()
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app load
  useEffect(() => {
    const storedUser = authAPI.getUser()
    const token = authAPI.getToken()

    if (storedUser && token) {
      setUser(storedUser)
      setIsAuthenticated(true)
    }

    setLoading(false)
  }, [])

  const handleLoginSuccess = (user, token) => {
    console.log('App: handleLoginSuccess called with user:', user)
    setUser(user)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    console.log('App: handleLogout called')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <p className={isDark ? 'text-white text-xl' : 'text-black text-xl'}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
                <Header user={user} onLogout={handleLogout} />
                <Dashboard />
                <Footer />
              </>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
