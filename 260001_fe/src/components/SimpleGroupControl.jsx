import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { api, getErrorMessage } from '../api'

function SimpleGroupControl({ onRefresh }) {
  const { isDark } = useTheme()
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) {
      setError('Group name is required')
      return
    }

    setLoading(true)
    try {
      await api.groups.create(newGroupName)
      setNewGroupName('')
      setShowNewGroup(false)
      setError('')
      onRefresh()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create group'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {showNewGroup && (
        <div className={`absolute right-0 top-full mt-2 p-3 rounded-lg border shadow-lg z-10 w-64 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-400'}`}>
          <form onSubmit={handleCreateGroup} className="space-y-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className={`w-full px-3 py-2 border rounded text-sm ${isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-400 text-black placeholder-gray-500'}`}
              autoFocus
              onBlur={() => {
                if (!newGroupName.trim()) {
                  setShowNewGroup(false)
                  setError('')
                }
              }}
            />
            {error && (
              <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-3 py-1 ${isDark ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'} text-white font-medium rounded text-sm transition`}
              >
                {loading ? '...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewGroup(false)
                  setError('')
                  setNewGroupName('')
                }}
                className={`flex-1 px-3 py-1 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500'} text-white font-medium rounded text-sm transition`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showNewGroup && (
        <button
          onClick={() => setShowNewGroup(true)}
          className={`px-4 py-2 ${isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-black hover:bg-gray-800'} text-white font-medium rounded transition`}
        >
          + New Group
        </button>
      )}
    </div>
  )
}

export default SimpleGroupControl
