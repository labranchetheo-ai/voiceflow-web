import { useState, useEffect } from 'react'

const DEFAULT_SETTINGS = {
  openaiKey: '',
  language: 'fr',
  hotkey: '',
  hotkeyKey: '',
  hotkeyMeta: false,
  hotkeyCtrl: false,
  hotkeyAlt: false,
  hotkeyShift: false,
}

const DEFAULT_DICTIONARY = [
  { id: 1, word: 'Supabase', ai: true },
  { id: 2, word: 'Wispr Flow', ai: false },
  { id: 3, word: 'labranche.theo@gmail.com', ai: false },
  { id: 4, word: 'Théo Labranche', ai: false },
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

// v2 keys to avoid loading old sample data
let state = {
  micPermission: 'unknown',
  settings: load('vf_settings_v2', DEFAULT_SETTINGS),
  dictionary: load('vf_dictionary', DEFAULT_DICTIONARY),
  history: load('vf_history_v2', []),
}

let listeners = []

function notify() {
  listeners.forEach(fn => fn({ ...state }))
}

function setState(updates) {
  state = { ...state, ...updates }
  notify()
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
    addHistory: (item) => {
      const updated = [item, ...state.history]
      save('vf_history_v2', updated)
      setState({ history: updated })
    },
    updateSettings: (updates) => {
      const updated = { ...state.settings, ...updates }
      save('vf_settings_v2', updated)
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
