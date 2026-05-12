import { useState, useEffect } from 'react'

const DEFAULT_SETTINGS = {
  openaiKey: '',
  language: 'fr',
  hotkey: 'F4',
}

const DEFAULT_DICTIONARY = [
  { id: 1, word: 'Supabase', ai: true },
  { id: 2, word: 'Theo', ai: false },
  { id: 3, word: 'ChatGPT', ai: true },
  { id: 4, word: 'Wispr Flow', ai: false },
  { id: 5, word: 'labranche.theo@gmail.com', ai: false },
  { id: 6, word: 'Théo Labranche', ai: false },
]

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// Simple global store using module-level state + listeners
let state = {
  micPermission: 'unknown',
  settings: load('vf_settings', DEFAULT_SETTINGS),
  dictionary: load('vf_dictionary', DEFAULT_DICTIONARY),
  history: load('vf_history', generateSampleHistory()),
  recording: false,
  transcript: '',
}

let listeners = []

function notify() {
  listeners.forEach(fn => fn({ ...state }))
}

function setState(updates) {
  state = { ...state, ...updates }
  notify()
}

function generateSampleHistory() {
  const items = []
  const texts = [
    'Envoie un email à l\'équipe pour la réunion de demain matin à 9h.',
    'Rappelle-moi d\'appeler le client Dupont cet après-midi.',
    'Rédige une note sur le projet VoiceFlow et les prochaines étapes.',
    'Cherche les meilleures pratiques pour l\'API OpenAI Whisper.',
    'Prépare un résumé de la réunion d\'hier avec les points clés.',
    'Ajoute une entrée dans le dictionnaire pour Théo Labranche.',
    'Planifie une démonstration de l\'application la semaine prochaine.',
  ]
  const now = Date.now()
  for (let i = 0; i < 20; i++) {
    const date = new Date(now - i * 3600000 * Math.random() * 48)
    items.push({
      id: i + 1,
      text: texts[i % texts.length],
      date: date.toISOString(),
      words: Math.floor(Math.random() * 30) + 5,
      app: ['Chrome', 'VS Code', 'Notion', 'Slack', 'Mail'][i % 5],
    })
  }
  return items
}

export function useStore() {
  const [snap, setSnap] = useState({ ...state })

  useEffect(() => {
    const handler = newState => setSnap(newState)
    listeners.push(handler)
    return () => { listeners = listeners.filter(l => l !== handler) }
  }, [])

  return {
    ...snap,
    setMicPermission: (v) => setState({ micPermission: v }),
    setRecording: (v) => setState({ recording: v }),
    setTranscript: (v) => setState({ transcript: v }),
    addHistory: (item) => {
      const updated = [item, ...state.history]
      save('vf_history', updated)
      setState({ history: updated })
    },
    updateSettings: (updates) => {
      const updated = { ...state.settings, ...updates }
      save('vf_settings', updated)
      setState({ settings: updated })
    },
    addWord: (word) => {
      const item = { id: Date.now(), word, ai: false }
      const updated = [...state.dictionary, item]
      save('vf_dictionary', updated)
      setState({ dictionary: updated })
    },
    removeWord: (id) => {
      const updated = state.dictionary.filter(w => w.id !== id)
      save('vf_dictionary', updated)
      setState({ dictionary: updated })
    },
  }
}
