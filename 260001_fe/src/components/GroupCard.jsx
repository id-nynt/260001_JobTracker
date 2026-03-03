import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { groupAPI } from '../api/groupAPI'
import JobCard from './JobCard'
import { ChevronRightIcon, DeleteIcon } from './Icons'

function GroupCard({ group, jobs, onDeleteJob, onUpdateJob, onRefresh, groups = [] }) {
  const { isDark } = useTheme()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(group.name)
  const [error, setError] = useState('')

  const formatDate = (date) => {
    if (!date) return '--'
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError('Group name cannot be empty')
      return
    }

    if (newName === group.name) {
      setIsEditingName(false)
      return
    }

    try {
      await groupAPI.updateGroup(group.id, newName)
      setIsEditingName(false)
      setError('')
      onRefresh()
    } catch (err) {
      setError('Failed to update group name')
      console.error('Error updating group:', err)
    }
  }

  const handleDeleteGroup = async () => {
    if (window.confirm(`Delete group "${group.name}"? Jobs will move to Default group.`)) {
      try {
        await groupAPI.deleteGroup(group.id)
        onRefresh()
      } catch (err) {
        setError('Failed to delete group')
        console.error('Error deleting group:', err)
      }
    }
  }

  return (
    <div className={`rounded-lg overflow-hidden border transition ${isDark ? 'bg-gray-700 border-gray-600 hover:border-gray-500' : 'bg-gray-100 border-gray-300 hover:border-gray-400'}`}>
      {/* Group Header */}
      <div
        className={`p-4 cursor-pointer transition flex justify-between ${isDark ? 'hover:bg-gray-650' : 'hover:bg-gray-200'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center flex-1 gap-3">
          <span className={`transition flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRightIcon color={isDark ? "#d1d5db" : "#4b5563"} size={20} />
          </span>
          
          {isEditingName ? (
            <div className="flex gap-2 items-center flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') setIsEditingName(false)
                }}
                autoFocus
                className={`px-2 py-1 border rounded text-sm ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-400 text-black'}`}
              />
            </div>
          ) : (
            <div
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsEditingName(true)
              }}
              className="flex-1 cursor-text hover:opacity-75"
              title="Double-click to rename"
            >
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>{group.name}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                From {formatDate(group.dateStart)} to {formatDate(group.dateEnd)}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-blue-600 text-white' : 'bg-gray-400 text-gray-900'}`}>
            {jobs.length}
          </span>
          
          <button
            onClick={handleDeleteGroup}
            title="Delete group"
            className={`w-8 h-8 flex items-center justify-center rounded transition ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
          >
            <DeleteIcon color={isDark ? "currentColor" : "currentColor"} size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className={`px-4 py-2 text-sm border-t ${isDark ? 'bg-red-900 text-red-200 border-gray-600' : 'bg-red-100 text-red-700 border-gray-300'}`}>
          {error}
        </div>
      )}

      {/* Jobs List */}
      {isExpanded && (
        <div className={`p-4 border-t ${isDark ? 'bg-gray-650 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
          {jobs.length === 0 ? (
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center py-4`}>No applications in this group yet</p>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onDelete={onDeleteJob}
                  onUpdate={onUpdateJob}
                  groups={groups}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GroupCard
