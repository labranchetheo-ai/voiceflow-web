import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader } from 'lucide-react'
import { useStore } from '../store'
import './FloatingRecorder.css'

export default function FloatingRecorder() {
  const { settings, addHistory, setMicPermission } = useStore()
  const [status, setStatus] = useState('idle') // idle | recording | transcribing
  const [result, setResult] = useState('')
  const [visible, setVisible] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const startTimeRef = useRef(null)
  const hideTimerRef = useRef(null)

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
      }, 5000)
    } else {
      setVisible(false)
    }
    return () => clearTimeout(hideTimerRef.current)
  }, [status, result])

  const startRecording = async () => {
    if (status !== 'idle') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission('granted')
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => transcribe(stream)
      mr.start()
      mediaRecorderRef.current = mr
      startTimeRef.current = Date.now()
      setStatus('recording')
      setResult('')
    } catch {
      setMicPermission('denied')
    }
  }

  const stopRecording = () => {
    if (status !== 'recording') return
    mediaRecorderRef.current?.stop()
    setStatus('transcribing')
  }

  // Stop recording when window loses focus → user switched to another app
  useEffect(() => {
    const onBlur = () => { if (status === 'recording') stopRecording() }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [status])

  const transcribe = async (stream) => {
    stream.getTracks().forEach(t => t.stop())
    const duration = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

    if (!settings.openaiKey) {
      const demo = 'Ajoutez votre clé OpenAI dans Settings pour activer la transcription réelle.'
      navigator.clipboard.writeText(demo).catch(() => {})
      setResult('⚠ Clé API manquante — Settings')
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
        // Auto-copy to clipboard so user can ⌘V anywhere
        navigator.clipboard.writeText(text).catch(() => {})
        setResult(text)
        addHistory({
          id: Date.now(),
          text,
          date: new Date().toISOString(),
          words: text.split(/\s+/).filter(Boolean).length,
          duration,
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
      e.preventDefault()
      startRecording()
    }
    const onKeyUp = (e) => {
      if (!matches(e)) return
      e.preventDefault()
      stopRecording()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [status, settings])

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
          <span className="fr-paste-hint">⌘V pour coller</span>
          <button className="fr-dismiss" onClick={() => { setResult(''); setVisible(false) }}>✕</button>
        </>
      )}
    </div>
  )
}
