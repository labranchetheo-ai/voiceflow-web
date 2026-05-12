import { useState } from 'react'
import Sidebar from './components/Sidebar'
import RecordBar from './components/RecordBar'
import InsightsPage from './pages/InsightsPage'
import DictionaryPage from './pages/DictionaryPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import FloatingRecorder from './components/FloatingRecorder'
import './App.css'

export default function App() {
  const [page, setPage] = useState('insights')

  return (
    <div className="app-layout">
      <FloatingRecorder />
      <Sidebar page={page} onNavigate={setPage} />
      <div className="app-main">
        <RecordBar />
        <div className="app-content">
          {page === 'insights' && <InsightsPage />}
          {page === 'dictionary' && <DictionaryPage />}
          {page === 'history' && <HistoryPage />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </div>
    </div>
  )
}
