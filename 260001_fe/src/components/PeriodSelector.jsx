import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { periodAPI } from '../api/periodAPI'

function PeriodSelector({ currentPeriodId, onPeriodChange }) {
  const { isDark } = useTheme()
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewPeriod, setShowNewPeriod] = useState(false)
  const [newPeriodName, setNewPeriodName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPeriods()
  }, [])

  const fetchPeriods = async () => {
    try {
      setLoading(true)
      const response = await periodAPI.getPeriods()
      setPeriods(response.data)
      
      // Set default period if none selected
      if (!currentPeriodId && response.data.length > 0) {
        const defaultPeriod = response.data.find(p => p.name === 'Default')
        if (defaultPeriod) {
          onPeriodChange(defaultPeriod.id)
        }
      }
    } catch (err) {
      console.error('Error fetching periods:', err)
      setError('Failed to load periods')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async (e) => {
    e.preventDefault()
    if (!newPeriodName.trim()) {
      setError('Period name is required')
      return
    }

    try {
      await periodAPI.createPeriod(newPeriodName)
      setNewPeriodName('')
      setShowNewPeriod(false)
      setError('')
      await fetchPeriods()
    } catch (err) {
      setError('Failed to create period')
      console.error('Error creating period:', err)
    }
  }

  const formatDate = (date) => {
    if (!date) return '--'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  }

  if (loading) {
    return <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading periods...</div>
  }

  return (
    <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Period</label>
        <button
          onClick={() => setShowNewPeriod(!showNewPeriod)}
          className={`text-xs px-2 py-1 ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded transition`}
        >
          + New Period
        </button>
      </div>

      {error && (
        <div className={`mb-3 p-2 text-sm rounded ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      {showNewPeriod && (
        <form onSubmit={handleCreatePeriod} className={`mb-4 p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <input
            type="text"
            value={newPeriodName}
            onChange={(e) => setNewPeriodName(e.target.value)}
            placeholder="e.g., IT Jobs 2025"
            className={`w-full px-3 py-2 border rounded text-sm mb-2 ${isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-400 text-black placeholder-gray-500'}`}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className={`px-3 py-1 ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white text-sm rounded transition`}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowNewPeriod(false)}
              className={`px-3 py-1 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500'} text-white text-sm rounded transition`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-2">
        {periods.map(period => (
          <button
            key={period.id}
            onClick={() => onPeriodChange(period.id)}
            className={`p-3 rounded text-left transition ${
              currentPeriodId === period.id
                ? `${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{period.name}</span>
              <span className="text-sm">{period.count}</span>
            </div>
            <div className={`text-xs mt-1 opacity-75`}>
              {formatDate(period.dateStart)} → {formatDate(period.dateEnd)}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PeriodSelector
