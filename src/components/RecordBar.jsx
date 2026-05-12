import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader } from 'lucide-react'
import { useStore } from '../store'
import './RecordBar.css'

export default function RecordBar() {
  const { recording, setRecording, addHistory, settings, micPermission } = useStore()
  const [status, setStatus] = useState('idle') // idle | recording | transcribing
  const [liveText, setLiveText] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    if (micPermission !== 'granted') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => transcribe(stream)
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
      setStatus('recording')
      setLiveText('')
    } catch (err) {
      console.error('Recording error', err)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    setStatus('transcribing')
  }

  const transcribe = async (stream) => {
    stream.getTracks().forEach(t => t.stop())
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

    if (!settings.openaiKey) {
      const demo = 'Transcription demo — add your OpenAI API key in Settings to enable real transcription.'
      setLiveText(demo)
      addHistory({
        id: Date.now(),
        text: demo,
        date: new Date().toISOString(),
        words: demo.split(' ').length,
        app: 'Browser',
      })
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
      const text = data.text || ''
      setLiveText(text)
      if (text) {
        addHistory({
          id: Date.now(),
          text,
          date: new Date().toISOString(),
          words: text.split(' ').length,
          app: 'Browser',
        })
      }
    } catch (err) {
      setLiveText('Transcription error — check your API key.')
    } finally {
      setStatus('idle')
    }
  }

  const handleCopy = () => {
    if (liveText) navigator.clipboard.writeText(liveText)
  }

  // Push-to-talk: hold configured hotkey → record, release → transcribe
  useEffect(() => {
    if (!settings.hotkeyKey) return
    const matches = (e) =>
      e.key === settings.hotkeyKey &&
      !!e.metaKey === !!settings.hotkeyMeta &&
      !!e.ctrlKey === !!settings.hotkeyCtrl &&
      !!e.altKey === !!settings.hotkeyAlt &&
      !!e.shiftKey === !!settings.hotkeyShift

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

  return (
    <div className="record-bar">
      <div className="record-bar-left">
        <button
          className={`record-btn ${status === 'recording' ? 'recording' : ''}`}
          onClick={status === 'recording' ? stopRecording : startRecording}
          disabled={status === 'transcribing' || micPermission !== 'granted'}
          title={micPermission !== 'granted' ? 'Microphone access required' : ''}
        >
          {status === 'transcribing' ? (
            <Loader size={18} className="spin" />
          ) : status === 'recording' ? (
            <Square size={18} fill="white" />
          ) : (
            <Mic size={18} />
          )}
          <span>
            {status === 'transcribing' ? 'Transcribing…' : status === 'recording' ? 'Stop' : 'Record'}
          </span>
        </button>
        {status === 'recording' && (
          <div className="record-pulse">
            <span className="record-dot" />
            <span className="record-label">Recording…</span>
          </div>
        )}
        {status === 'idle' && settings.hotkey && micPermission === 'granted' && (
          <span className="record-hotkey-hint">
            or hold <kbd>{settings.hotkey}</kbd>
          </span>
        )}
      </div>
      {liveText && (
        <div className="record-result">
          <p className="record-text">{liveText}</p>
          <button className="record-copy" onClick={handleCopy}>Copy</button>
        </div>
      )}
    </div>
  )
}
