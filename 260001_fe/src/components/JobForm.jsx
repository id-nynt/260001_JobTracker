import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offered', 'Accepted', 'Rejected']

function JobForm({ onAddJob, groups = [] }) {
  const { isDark } = useTheme()
  const defaultGroupId = (groups.find(group => group.isDefault) ?? groups[0])?.id ?? null

  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobUrl: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '',
    periodId: defaultGroupId
  })
  const [submitting, setSubmitting] = useState(false)

  // The chosen group may have been deleted since it was picked
  const periodId = groups.some(group => group.id === formData.periodId) ? formData.periodId : defaultGroupId

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      // <select> values are strings, but the API and group ids are numbers
      [name]: name === 'periodId' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      alert('Please fill in required fields')
      return
    }

    setSubmitting(true)
    try {
      const added = await onAddJob({
        ...formData,
        periodId,
        dateApplied: new Date(formData.dateApplied).toISOString()
      })

      // Keep what was typed if saving failed; after success clear it but stay on the same group
      if (added) {
        setFormData(prev => ({
          ...prev,
          companyName: '',
          jobTitle: '',
          jobUrl: '',
          status: 'Applied',
          dateApplied: new Date().toISOString().split('T')[0],
          notes: ''
        }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card mb-8">
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-6`}>Add New Application</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Google, Microsoft"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>Job Title *</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>Job URL</label>
            <input
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder="https://example.com/job"
              className="input-field"
            />
          </div>
          <div>
            <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>Date Applied</label>
            <input
              type="date"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          {groups.length > 0 && (
            <div>
              <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>Group</label>
              <select
                name="periodId"
                value={periodId ?? ''}
                onChange={handleChange}
                className="input-field"
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes about this application..."
            rows="3"
            className="input-field"
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Application'}
        </button>
      </form>
    </div>
  )
}

export default JobForm
