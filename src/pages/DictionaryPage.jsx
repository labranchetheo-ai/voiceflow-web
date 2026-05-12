import { useState } from 'react'
import { Plus, Trash2, Search, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import './DictionaryPage.css'

export default function DictionaryPage() {
  const { dictionary, addWord, removeWord } = useStore()
  const [search, setSearch] = useState('')
  const [newWord, setNewWord] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('all')

  const filtered = dictionary.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase()) &&
    (tab === 'all' || (tab === 'ai' && w.ai) || (tab === 'manual' && !w.ai))
  )

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newWord.trim()) return
    addWord(newWord.trim())
    setNewWord('')
    setShowAdd(false)
  }

  return (
    <div className="dictionary-page">
      <div className="dictionary-header">
        <h1 className="page-title">Dictionary</h1>
        <button className="dict-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          Add new
        </button>
      </div>

      {showAdd && (
        <form className="dict-add-form" onSubmit={handleAdd}>
          <input
            autoFocus
            className="dict-add-input"
            placeholder="Enter word or phrase…"
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
          />
          <button type="submit" className="dict-save-btn">Save</button>
          <button type="button" className="dict-cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
        </form>
      )}

      <div className="dict-controls">
        <div className="dict-tabs">
          {['all', 'manual', 'ai'].map(t => (
            <button
              key={t}
              className={`dict-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'all' ? 'All' : t === 'ai' ? 'AI-suggested' : 'Personal'}
              <span className="dict-tab-count">
                {t === 'all' ? dictionary.length : dictionary.filter(w => t === 'ai' ? w.ai : !w.ai).length}
              </span>
            </button>
          ))}
        </div>
        <div className="dict-search">
          <Search size={14} />
          <input
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="dict-list">
        {filtered.length === 0 && (
          <div className="dict-empty">No words found</div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="dict-item">
            <div className="dict-item-word">
              {item.word}
              {item.ai && (
                <span className="dict-ai-badge" title="AI-suggested">
                  <Sparkles size={11} />
                </span>
              )}
            </div>
            <button className="dict-delete-btn" onClick={() => removeWord(item.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
