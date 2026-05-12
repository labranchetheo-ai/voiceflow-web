import { useState } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useStore } from '../store'
import './SettingsPage.css'

const LANGUAGES = [
  { code: 'fr', label: 'French' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
]

const HOTKEYS = ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12']

export default function SettingsPage() {
  const { settings, updateSettings } = useStore()
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [localKey, setLocalKey] = useState(settings.openaiKey)

  const save = () => {
    updateSettings({ openaiKey: localKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      <div className="settings-section">
        <h2 className="settings-section-title">API Configuration</h2>
        <div className="settings-card">
          <div className="settings-field">
            <label className="settings-label">OpenAI API Key</label>
            <p className="settings-hint">
              Used to transcribe your voice with Whisper. Your key is stored locally only.
            </p>
            <div className="settings-key-row">
              <input
                className="settings-input"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-…"
                value={localKey}
                onChange={e => setLocalKey(e.target.value)}
              />
              <button className="settings-eye-btn" onClick={() => setShowKey(v => !v)}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="settings-save-btn" onClick={save}>
            {saved ? <><Check size={15} /> Saved</> : 'Save API Key'}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Preferences</h2>
        <div className="settings-card">
          <div className="settings-field">
            <label className="settings-label">Transcription Language</label>
            <p className="settings-hint">Language of your voice recordings</p>
            <select
              className="settings-select"
              value={settings.language}
              onChange={e => updateSettings({ language: e.target.value })}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <label className="settings-label">Hotkey</label>
            <p className="settings-hint">Keyboard shortcut to start/stop recording (visual reference only — use the Record button)</p>
            <div className="settings-hotkeys">
              {HOTKEYS.map(k => (
                <button
                  key={k}
                  className={`settings-hotkey ${settings.hotkey === k ? 'active' : ''}`}
                  onClick={() => updateSettings({ hotkey: k })}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">About</h2>
        <div className="settings-card settings-about">
          <div className="settings-about-row">
            <span>VoiceFlow</span>
            <span className="settings-about-val">v1.0.0</span>
          </div>
          <div className="settings-about-row">
            <span>Powered by</span>
            <span className="settings-about-val">OpenAI Whisper</span>
          </div>
          <div className="settings-about-row">
            <span>Inspired by</span>
            <span className="settings-about-val">Wispr Flow</span>
          </div>
        </div>
      </div>
    </div>
  )
}
