import { useStore } from '../store'
import HeatmapCalendar from '../components/HeatmapCalendar'
import './InsightsPage.css'

function StatCard({ label, value, sub, children }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {children}
    </div>
  )
}

export default function InsightsPage() {
  const { history } = useStore()

  const totalWords = history.reduce((s, h) => s + h.words, 0)
  const totalSessions = history.length
  const wpm = 172
  const streak = 4

  // App usage breakdown
  const appCounts = {}
  history.forEach(h => { appCounts[h.app] = (appCounts[h.app] || 0) + h.words })
  const totalAppWords = Object.values(appCounts).reduce((a, b) => a + b, 0)
  const appEntries = Object.entries(appCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  // Heatmap data: sessions per day
  const dayCounts = {}
  history.forEach(h => {
    const day = h.date.slice(0, 10)
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })

  const TEAL_LEVELS = ['#E8F3F2', '#A8D5D2', '#6DB8B3', '#3D9A94', '#2D6A65']
  const maxDay = Math.max(...Object.values(dayCounts), 1)
  const getLevel = (count) => {
    if (!count) return TEAL_LEVELS[0]
    const idx = Math.ceil((count / maxDay) * 4)
    return TEAL_LEVELS[Math.min(idx, 4)]
  }

  const APP_COLORS = ['#2D6A65', '#4A9490', '#6DB8B3', '#A8D5D2', '#C8E8E6', '#E8F3F2']

  return (
    <div className="insights-page">
      <h1 className="page-title">Insights</h1>

      <div className="insights-grid">
        <StatCard label="WORDS PER MINUTE" value={wpm}>
          <div className="wpm-gauge">
            <div className="wpm-bar-track">
              <div className="wpm-bar-fill" style={{ width: `${Math.min(wpm / 250 * 100, 100)}%` }} />
            </div>
            <div className="wpm-rank">Top 7%</div>
          </div>
        </StatCard>

        <StatCard
          label="TOTAL WORDS DICTATED"
          value={totalWords.toLocaleString()}
          sub={`+${Math.round((history.length / 10) * 12)}% this month`}
        >
          <div className="words-book">
            You&apos;ve written {Math.floor(totalWords / 70000)} book chapter{totalWords >= 140000 ? 's' : ''}!
          </div>
        </StatCard>

        <StatCard label="SESSIONS" value={totalSessions} sub="Voice recordings" />

        <StatCard label="STREAK" value={`${streak} days`} sub={`Longest streak: ${streak} days`} />
      </div>

      <div className="insights-row">
        <div className="app-usage-card">
          <div className="card-section-label">TOTAL APPS USED | {Object.keys(appCounts).length}</div>
          <div className="app-bars">
            {appEntries.map(([app, count], i) => {
              const pct = totalAppWords > 0 ? Math.round((count / totalAppWords) * 100) : 0
              return (
                <div key={app} className="app-bar-row">
                  <div className="app-bar-meta">
                    <span className="app-bar-dot" style={{ background: APP_COLORS[i] }} />
                    <span className="app-bar-name">{app}</span>
                    <span className="app-bar-count">{count} words</span>
                  </div>
                  <div className="app-bar-track">
                    <div
                      className="app-bar-fill"
                      style={{ width: `${pct}%`, background: APP_COLORS[i] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="heatmap-card">
          <div className="card-section-label">ACTIVITY HEATMAP</div>
          <HeatmapCalendar dayCounts={dayCounts} getColor={getLevel} />
        </div>
      </div>
    </div>
  )
}
