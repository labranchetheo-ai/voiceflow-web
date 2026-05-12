import { useState } from 'react'
import { Eye, EyeOff, Check, Keyboard } from 'lucide-react'
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

function formatKey(e) {
  const parts = []
  if (e.metaKey) parts.push('⌘')
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('⌥')
  if (e.shiftKey) parts.push('⇧')
  if (!['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
    parts.push(e.key === ' ' ? 'Space' : e.key)
  }
  return parts
}

export default function SettingsPage() {
  const { settings, updateSettings } = useStore()
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [localKey, setLocalKey] = useState(settings.openaiKey)
  const [capturing, setCapturing] = useState(false)

  const save = () => {
    updateSettings({ openaiKey: localKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleKeyCapture = (e) => {
    if (!capturing) return
    e.preventDefault()
    e.stopPropagation()
    if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) return
    const parts = formatKey(e)
    if (parts.length === 0) return
    updateSettings({
      hotkey: parts.join('+'),
      hotkeyKey: e.key,
      hotkeyMeta: e.metaKey,
      hotkeyCtrl: e.ctrlKey,
      hotkeyAlt: e.altKey,
      hotkeyShift: e.shiftKey,
    })
    setCapturing(false)
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
            <label className="settings-label">Push-to-talk Shortcut</label>
            <p className="settings-hint">
              Hold this key to record, release to transcribe. Click the field below and press any key or combination (e.g. Fn+F4, ⌘+Space).
              <br />Note: the Fn key alone is not detectable by browsers — use Fn+F1…F12 instead.
            </p>
            <div className="settings-capture-row">
              <div
                className={`settings-key-capture ${capturing ? 'capturing' : ''}`}
                tabIndex={0}
                onClick={() => setCapturing(true)}
                onKeyDown={handleKeyCapture}
                onBlur={() => setCapturing(false)}
              >
                <Keyboard size={15} />
                {capturing ? 'Press a key…' : (settings.hotkey || 'Click to set shortcut')}
              </div>
              {settings.hotkey && !capturing && (
                <button
                  className="settings-capture-clear"
                  onClick={() => updateSettings({ hotkey: '', hotkeyKey: '' })}
                >
                  Clear
                </button>
              )}
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
