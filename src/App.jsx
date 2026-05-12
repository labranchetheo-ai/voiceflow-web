import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import RecordBar from './components/RecordBar'
import InsightsPage from './pages/InsightsPage'
import DictionaryPage from './pages/DictionaryPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import MicPermissionModal from './components/MicPermissionModal'
import FloatingRecorder from './components/FloatingRecorder'
import { useStore } from './store'
import './App.css'

export default function App() {
  const [page, setPage] = useState('insights')
  const { micPermission, setMicPermission } = useStore()

  useEffect(() => {
    navigator.permissions?.query({ name: 'microphone' }).then(result => {
      if (result.state === 'granted') setMicPermission('granted')
      else if (result.state === 'denied') setMicPermission('denied')
    }).catch(() => {})
  }, [])

  const handleGrantMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicPermission('granted')
    } catch {
      setMicPermission('denied')
    }
  }

  return (
    <div className="app-layout">
      {micPermission === 'unknown' && (
        <MicPermissionModal onGrant={handleGrantMic} />
      )}
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
