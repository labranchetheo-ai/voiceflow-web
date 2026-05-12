import { BarChart2, BookOpen, Clock, Settings, Mic } from 'lucide-react'
import './Sidebar.css'

const NAV = [
  { id: 'insights', icon: BarChart2, label: 'Insights' },
  { id: 'dictionary', icon: BookOpen, label: 'Dictionary' },
  { id: 'history', icon: Clock, label: 'History' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Mic size={22} className="sidebar-logo-icon" />
        <span>VoiceFlow</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`sidebar-item ${page === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">TL</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Théo Labranche</div>
            <div className="sidebar-user-email">labranche.theo@gmail.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
