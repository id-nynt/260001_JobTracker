import JobCard from './JobCard'
import { useTheme } from '../context/ThemeContext'

function JobList({ jobs, onDelete, onUpdate, loading }) {
  const { isDark } = useTheme()

  const getStatusColor = (status) => {
    switch(status) {
      case 'Applied': return 'badge-info'
      case 'Interviewing': return 'badge-warning'
      case 'Offered': return 'badge-mint'
      case 'Accepted': return 'badge-success'
      case 'Rejected': return 'badge-danger'
      default: return 'badge-info'
    }
  }

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interviewing: jobs.filter(j => j.status === 'Interviewing').length,
    offered: jobs.filter(j => j.status === 'Offered').length,
    accepted: jobs.filter(j => j.status === 'Accepted').length,
  }

  return (
    <div>
      {/* Stats Section */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card text-center">
            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Total</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{stats.total}</p>
          </div>
          <div className="card text-center">
            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Applied</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.applied}</p>
          </div>
          <div className="card text-center">
            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Interviewing</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.interviewing}</p>
          </div>
          <div className="card text-center">
            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Offered</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{stats.offered}</p>
          </div>
          <div className="card text-center">
            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Accepted</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-green-600' : 'text-green-600'}`}>{stats.accepted}</p>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="card text-center py-8">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg`}>No applications yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="app-list-container">
          <div className="space-y-4">
            {jobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobList
