import './HeatmapCalendar.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getWeeksInYear() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 364)
  start.setDate(start.getDate() - start.getDay()) // align to Sunday

  const weeks = []
  let cur = new Date(start)
  while (cur <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export default function HeatmapCalendar({ dayCounts, getColor }) {
  const weeks = getWeeksInYear()
  const today = new Date()

  const monthLabels = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const m = week[0].getMonth()
    if (m !== lastMonth) {
      monthLabels.push({ wi, label: MONTHS[m] })
      lastMonth = m
    }
  })

  return (
    <div className="heatmap">
      <div className="heatmap-months">
        {monthLabels.map(({ wi, label }) => (
          <span key={label + wi} style={{ gridColumn: wi + 1 }}>{label}</span>
        ))}
      </div>
      <div className="heatmap-body">
        <div className="heatmap-days">
          {DAYS.map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}>
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const key = day.toISOString().slice(0, 10)
              const count = dayCounts[key] || 0
              const isFuture = day > today
              return (
                <div
                  key={key}
                  className="heatmap-cell"
                  style={{ background: isFuture ? 'transparent' : getColor(count), gridRow: di + 1 }}
                  title={isFuture ? '' : `${key}: ${count} session${count !== 1 ? 's' : ''}`}
                />
              )
            })
          )}
        </div>
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        {['#E8F3F2', '#A8D5D2', '#6DB8B3', '#3D9A94', '#2D6A65'].map(c => (
          <div key={c} className="heatmap-cell" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
