import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { DeleteIcon, EditIcon } from './Icons'

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offered', 'Accepted', 'Rejected']

function JobCard({ job, onDelete, onUpdate, groups = [] }) {
  const { isDark } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(job)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleEdit = () => {
    // Start from the latest saved values, not from whatever was loaded when the card first rendered
    setEditData(job)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData(job)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      // <select> values are strings, but group ids are numbers
      [name]: name === 'periodId' ? Number(value) : value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const saved = await onUpdate(editData)
      if (saved) setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      setDeleting(true)
      try {
        await onDelete(job.id)
      } finally {
        setDeleting(false)
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  if (isEditing) {
    return (
      <div className="card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={editData.companyName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className={`block font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={editData.jobTitle}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Status</label>
              <select
                name="status"
                value={editData.status}
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
                <label className={`block font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Group</label>
                <select
                  name="periodId"
                  value={editData.periodId ?? ''}
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
            <label className={`block font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Notes</label>
            <textarea
              name="notes"
              value={editData.notes ?? ''}
              onChange={handleChange}
              rows="3"
              className="input-field"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancel} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{job.companyName}</h3>
            <span className={getStatusColor(job.status)}>
              {job.status}
            </span>
          </div>
          <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{job.jobTitle}</p>
          
          <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {job.jobUrl && (
              <p>
                <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                  View Job Post
                </a>
              </p>
            )}
            <p>Applied: {formatDate(job.dateApplied)}</p>
            {job.notes && (
              <p className={`mt-3 border-l-2 pl-3 ${isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-400'}`}>
                {job.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleEdit}
            className={`w-8 h-8 flex items-center justify-center rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
            disabled={deleting}
            title="Edit"
            aria-label="Edit application"
          >
            <EditIcon color={isDark ? "currentColor" : "currentColor"} size={18} />
          </button>
          <button 
            onClick={handleDelete}
            className={`w-8 h-8 flex items-center justify-center rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
            disabled={deleting}
            title="Delete"
            aria-label="Delete application"
          >
            <DeleteIcon color={isDark ? "currentColor" : "currentColor"} size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobCard
