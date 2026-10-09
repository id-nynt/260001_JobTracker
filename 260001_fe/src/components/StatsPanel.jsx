import { useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { computeStats } from '../utils/stats'

const formatPercent = (rate) => (rate === null ? '–' : `${Math.round(rate * 100)}%`)

const formatWeek = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

function Tile({ label, value, hint }) {
  const { isDark } = useTheme()

  return (
    <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} title={hint}>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
      <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
    </div>
  )
}

function StatsPanel({ jobs, groups }) {
  const { isDark } = useTheme()
  const [groupId, setGroupId] = useState('')

  const scopedJobs = useMemo(
    () => (groupId === '' ? jobs : jobs.filter((job) => job.periodId === Number(groupId))),
    [jobs, groupId]
  )
  const stats = useMemo(() => computeStats(scopedJobs), [scopedJobs])
  const maxWeekly = Math.max(1, ...stats.weekly.map((week) => week.count))

  return (
    <section aria-labelledby="stats-heading" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 id="stats-heading" className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Overview</h2>
        <select
          aria-label="Show statistics for"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All groups</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Tile label="Applications" value={stats.total} />
        <Tile
          label="Response rate"
          value={formatPercent(stats.responseRate)}
          hint="Share of applications that got any reply: interview, offer, acceptance or rejection"
        />
        <Tile
          label="Interview rate"
          value={formatPercent(stats.interviewRate)}
          hint="Share of applications that reached an interview, or went further"
        />
        <Tile
          label="Offer rate"
          value={formatPercent(stats.offerRate)}
          hint="Share of applications that led to an offer"
        />
      </div>

      <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Applications per week (last {stats.weekly.length} weeks)
        </p>
        <ul className="flex items-end gap-2 h-28" aria-label="Applications per week">
          {stats.weekly.map((week) => (
            <li key={week.weekStart} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className={`text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{week.count}</span>
              <div
                className={`w-full rounded-t ${isDark ? 'bg-blue-500' : 'bg-gray-700'}`}
                style={{ height: `${week.count === 0 ? 2 : Math.max(6, (week.count / maxWeekly) * 72)}px` }}
                aria-hidden="true"
              />
              <span className={`text-[10px] mt-1 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="sr-only">Week of </span>{formatWeek(week.weekStart)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default StatsPanel
