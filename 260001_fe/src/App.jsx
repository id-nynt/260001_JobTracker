import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import JobForm from './components/JobForm'
import GroupCard from './components/GroupCard'
import SimpleGroupControl from './components/SimpleGroupControl'
import Login from './components/Login'
import Register from './components/Register'
import { api, getErrorMessage } from './api'
import { getSession, saveSession, clearSession } from './api/session'
import { ThemeProvider, useTheme } from './context/ThemeContext'

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function DemoBanner() {
  const { isDark } = useTheme()

  return (
    <div className={`text-center text-sm py-2 px-4 ${isDark ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900'}`}>
      Demo mode: your data is stored only in this browser.{' '}
      <Link to="/register" className="font-medium underline">Create a real account</Link>
    </div>
  )
}

function Dashboard() {
  const { isDark } = useTheme()
  const [groups, setGroups] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // `silent` refreshes keep the page on screen instead of replacing it with "Loading..."
  const loadData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true)
      setError(null)
      const [groupsData, jobsData] = await Promise.all([api.groups.list(), api.jobs.list()])
      setGroups(groupsData)
      setJobs(jobsData)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load data'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refresh = useCallback(() => loadData({ silent: true }), [loadData])

  // Runs a change, then reloads so the lists (and each group's count and dates) match the server.
  // Returns whether it worked, so forms can keep what the user typed when it did not.
  const applyChange = async (change, failureMessage) => {
    try {
      await change()
    } catch (err) {
      alert(getErrorMessage(err, failureMessage))
      return false
    }
    await refresh()
    return true
  }

  const handleAddJob = (newJob) =>
    applyChange(() => api.jobs.create(newJob), 'Failed to create job. Please try again.')

  const handleDeleteJob = (jobId) =>
    applyChange(() => api.jobs.remove(jobId), 'Failed to delete job. Please try again.')

  const handleUpdateJob = (updatedJob) =>
    applyChange(() => api.jobs.update(updatedJob.id, updatedJob), 'Failed to update job. Please try again.')

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
          <JobForm onAddJob={handleAddJob} groups={groups} />
        </div>

        {/* Right Column: Applications Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Applications</h2>
            <SimpleGroupControl onRefresh={refresh} />
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
                    onRefresh={refresh}
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
  const [session, setSession] = useState(getSession)

  const handleAuthenticated = (newSession) => {
    saveSession(newSession)
    setSession(newSession)
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
  }

  const isAuthenticated = Boolean(session)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Routes>
        <Route path="/login" element={<Login onAuthenticated={handleAuthenticated} />} />
        <Route path="/register" element={<Register onAuthenticated={handleAuthenticated} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
                {session?.mode === 'demo' && <DemoBanner />}
                <Header user={session?.user} onLogout={handleLogout} />
                <Dashboard />
                <Footer />
              </>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
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
