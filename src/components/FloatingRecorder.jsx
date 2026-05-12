import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader } from 'lucide-react'
import { useStore } from '../store'
import './FloatingRecorder.css'

export default function FloatingRecorder() {
  const { settings, micPermission, addHistory } = useStore()
  const [status, setStatus] = useState('idle') // idle | recording | transcribing
  const [result, setResult] = useState('')
  const [visible, setVisible] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef(null)
  const lastFocusRef = useRef(null)
  const hideTimerRef = useRef(null)

  // Show floating bar whenever not idle
  useEffect(() => {
    if (status !== 'idle') {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
    } else if (result) {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
        setResult('')
      }, 4000)
    } else {
      setVisible(false)
    }
    return () => clearTimeout(hideTimerRef.current)
  }, [status, result])

  const startRecording = async () => {
    if (micPermission !== 'granted' || status !== 'idle') return
    // Remember where cursor is before we grab focus
    const active = document.activeElement
    if (active && active !== document.body) lastFocusRef.current = active
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => transcribe(stream)
      mr.start()
      mediaRecorderRef.current = mr
      setStatus('recording')
      setResult('')
    } catch (err) {
      console.error('Recording error', err)
    }
  }

  const stopRecording = () => {
    if (status !== 'recording') return
    mediaRecorderRef.current?.stop()
    setStatus('transcribing')
  }

  const insertText = (text) => {
    const el = lastFocusRef.current
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      el.focus()
      const start = el.selectionStart ?? el.value.length
      const end = el.selectionEnd ?? el.value.length
      el.value = el.value.slice(0, start) + text + el.value.slice(end)
      el.selectionStart = el.selectionEnd = start + text.length
      el.dispatchEvent(new Event('input', { bubbles: true }))
    } else if (el?.isContentEditable) {
      el.focus()
      document.execCommand('insertText', false, text)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text)
    }
  }

  const transcribe = async (stream) => {
    stream.getTracks().forEach(t => t.stop())
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

    if (!settings.openaiKey) {
      const demo = '(Demo) Ajoutez votre clé OpenAI dans Settings pour activer la transcription.'
      setResult(demo)
      setStatus('idle')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', blob, 'audio.webm')
      formData.append('model', 'whisper-1')
      formData.append('language', settings.language || 'fr')

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${settings.openaiKey}` },
        body: formData,
      })
      const data = await res.json()
      const text = data.text?.trim() || ''
      if (text) {
        insertText(text)
        setResult(text)
        addHistory({
          id: Date.now(),
          text,
          date: new Date().toISOString(),
          words: text.split(' ').length,
          app: 'Browser',
        })
      }
    } catch {
      setResult('Erreur — vérifiez votre clé API.')
    } finally {
      setStatus('idle')
    }
  }

  // Global push-to-talk hotkey
  useEffect(() => {
    if (!settings.hotkeyKey) return
    const MODIFIERS = ['Control', 'Alt', 'Shift', 'Meta']
    const isModOnly = MODIFIERS.includes(settings.hotkeyKey)

    const matches = (e) => {
      if (e.key !== settings.hotkeyKey) return false
      if (!isModOnly) {
        if (!!e.metaKey !== !!settings.hotkeyMeta) return false
        if (!!e.ctrlKey !== !!settings.hotkeyCtrl) return false
        if (!!e.altKey !== !!settings.hotkeyAlt) return false
        if (!!e.shiftKey !== !!settings.hotkeyShift) return false
      }
      return true
    }

    const onKeyDown = (e) => {
      if (e.repeat || !matches(e)) return
      if (status === 'idle' && micPermission === 'granted') {
        e.preventDefault()
        startRecording()
      }
    }
    const onKeyUp = (e) => {
      if (!matches(e)) return
      if (status === 'recording') {
        e.preventDefault()
        stopRecording()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [status, micPermission, settings])

  if (!visible && status === 'idle') return null

  return (
    <div className={`floating-recorder ${status} ${visible ? 'show' : ''}`}>
      {status === 'recording' && (
        <>
          <span className="fr-dot" />
          <span className="fr-label">Enregistrement…</span>
          <button className="fr-stop" onMouseDown={stopRecording}>
            <Square size={12} fill="currentColor" />
          </button>
        </>
      )}
      {status === 'transcribing' && (
        <>
          <Loader size={14} className="fr-spin" />
          <span className="fr-label">Transcription…</span>
        </>
      )}
      {status === 'idle' && result && (
        <>
          <span className="fr-check">✓</span>
          <span className="fr-result">{result}</span>
          <button className="fr-dismiss" onClick={() => { setResult(''); setVisible(false) }}>✕</button>
        </>
      )}
    </div>
  )
}
