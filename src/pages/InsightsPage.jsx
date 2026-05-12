import { useStore } from '../store'
import HeatmapCalendar from '../components/HeatmapCalendar'
import './InsightsPage.css'

function StatCard({ label, value, sub, empty, children }) {
  return (
    <div className={`stat-card ${empty ? 'stat-card-empty' : ''}`}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {children}
    </div>
  )
}

function calcStreak(history) {
  if (!history.length) return { current: 0, longest: 0 }
  const days = [...new Set(history.map(h => h.date.slice(0, 10)))].sort()
  let longest = 1, cur = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]), next = new Date(days[i])
    const diff = (next - prev) / 86400000
    if (diff === 1) { cur++; longest = Math.max(longest, cur) }
    else cur = 1
  }
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const lastDay = days[days.length - 1]
  const currentStreak = (lastDay === today || lastDay === yesterday)
    ? (() => {
        let s = 1, i = days.length - 2
        while (i >= 0) {
          const d1 = new Date(days[i]), d2 = new Date(days[i + 1])
          if ((d2 - d1) / 86400000 === 1) { s++; i-- } else break
        }
        return s
      })()
    : 0
  return { current: currentStreak, longest }
}

function calcWpm(history) {
  const withDuration = history.filter(h => h.duration > 5)
  if (!withDuration.length) return null
  const totalWords = withDuration.reduce((s, h) => s + h.words, 0)
  const totalMinutes = withDuration.reduce((s, h) => s + h.duration / 60, 0)
  return Math.round(totalWords / totalMinutes)
}

const TEAL_LEVELS = ['#E8F3F2', '#A8D5D2', '#6DB8B3', '#3D9A94', '#2D6A65']
const APP_COLORS = ['#2D6A65', '#4A9490', '#6DB8B3', '#A8D5D2', '#C8E8E6', '#E8F3F2']

export default function InsightsPage() {
  const { history } = useStore()

  const totalWords = history.reduce((s, h) => s + h.words, 0)
  const totalSessions = history.length
  const wpm = calcWpm(history)
  const { current: streak, longest: longestStreak } = calcStreak(history)
  const empty = history.length === 0

  const appCounts = {}
  history.forEach(h => { appCounts[h.app] = (appCounts[h.app] || 0) + h.words })
  const totalAppWords = Object.values(appCounts).reduce((a, b) => a + b, 0)
  const appEntries = Object.entries(appCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const dayCounts = {}
  history.forEach(h => {
    const day = h.date.slice(0, 10)
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })
  const maxDay = Math.max(...Object.values(dayCounts), 1)
  const getLevel = (count) => {
    if (!count) return TEAL_LEVELS[0]
    return TEAL_LEVELS[Math.min(Math.ceil((count / maxDay) * 4), 4)]
  }

  return (
    <div className="insights-page">
      <h1 className="page-title">Insights</h1>

      {empty && (
        <div className="insights-empty">
          <div className="insights-empty-icon">🎙</div>
          <p>Aucun enregistrement pour l'instant.</p>
          <p className="insights-empty-sub">Lance ton premier enregistrement pour voir les stats ici.</p>
        </div>
      )}

      <div className="insights-grid">
        <StatCard label="MOTS PAR MINUTE" value={wpm ?? '—'} empty={!wpm}>
          {wpm ? (
            <div className="wpm-gauge">
              <div className="wpm-bar-track">
                <div className="wpm-bar-fill" style={{ width: `${Math.min(wpm / 250 * 100, 100)}%` }} />
              </div>
              <div className="wpm-rank">Calculé depuis {history.filter(h => h.duration > 5).length} session{history.filter(h => h.duration > 5).length !== 1 ? 's' : ''}</div>
            </div>
          ) : (
            <div className="stat-card-sub">Enregistre pour calculer</div>
          )}
        </StatCard>

        <StatCard
          label="TOTAL MOTS DICTÉS"
          value={totalWords.toLocaleString()}
          empty={!totalWords}
          sub={totalWords ? `sur ${totalSessions} session${totalSessions !== 1 ? 's' : ''}` : 'Aucun enregistrement'}
        />

        <StatCard
          label="SESSIONS"
          value={totalSessions}
          empty={!totalSessions}
          sub={totalSessions ? 'Enregistrements vocaux' : 'Aucune session'}
        />

        <StatCard
          label="STREAK"
          value={streak ? `${streak} jour${streak !== 1 ? 's' : ''}` : '—'}
          empty={!streak}
          sub={longestStreak ? `Record : ${longestStreak} jour${longestStreak !== 1 ? 's' : ''}` : 'Enregistre chaque jour'}
        />
      </div>

      <div className="insights-row">
        <div className="heatmap-card">
          <div className="card-section-label">ACTIVITÉ HEATMAP</div>
          <HeatmapCalendar dayCounts={dayCounts} getColor={getLevel} />
        </div>

        <div className="app-usage-card">
          <div className="card-section-label">APPS UTILISÉES | {Object.keys(appCounts).length}</div>
          {appEntries.length === 0 ? (
            <div className="app-empty">Les apps apparaîtront après le premier enregistrement.</div>
          ) : (
            <div className="app-bars">
              {appEntries.map(([app, count], i) => {
                const pct = totalAppWords > 0 ? Math.round((count / totalAppWords) * 100) : 0
                return (
                  <div key={app} className="app-bar-row">
                    <div className="app-bar-meta">
                      <span className="app-bar-dot" style={{ background: APP_COLORS[i] }} />
                      <span className="app-bar-name">{app}</span>
                      <span className="app-bar-count">{count} mots</span>
                    </div>
                    <div className="app-bar-track">
                      <div className="app-bar-fill" style={{ width: `${pct}%`, background: APP_COLORS[i] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
