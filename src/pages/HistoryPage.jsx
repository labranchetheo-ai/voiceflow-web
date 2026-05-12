import { useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import './HistoryPage.css'

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffH = diffMs / 3600000
  if (diffH < 1) return `${Math.floor(diffMs / 60000)}m ago`
  if (diffH < 24) return `${Math.floor(diffH)}h ago`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function HistoryPage() {
  const { history } = useStore()
  const [search, setSearch] = useState('')

  const filtered = history.filter(h =>
    h.text.toLowerCase().includes(search.toLowerCase())
  )

  const copy = (text) => navigator.clipboard.writeText(text)

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="page-title">History</h1>
        <input
          className="history-search"
          placeholder="Search transcriptions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="history-list">
        {filtered.length === 0 && (
          <div className="history-empty">No recordings yet. Hit Record to get started!</div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="history-item">
            <div className="history-item-meta">
              <span className="history-app">{item.app}</span>
              <span className="history-words">{item.words} words</span>
              <span className="history-date">{formatDate(item.date)}</span>
            </div>
            <p className="history-text">{item.text}</p>
            <div className="history-actions">
              <button className="history-action-btn" onClick={() => copy(item.text)}>
                <Copy size={13} />
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
