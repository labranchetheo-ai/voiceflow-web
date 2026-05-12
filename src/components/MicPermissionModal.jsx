import { Mic } from 'lucide-react'
import './MicPermissionModal.css'

export default function MicPermissionModal({ onGrant }) {
  return (
    <div className="mic-overlay">
      <div className="mic-modal">
        <div className="mic-modal-icon">
          <Mic size={32} />
        </div>
        <h2>Enable Microphone</h2>
        <p>
          VoiceFlow needs access to your microphone to transcribe your voice.
          Your audio is processed securely and never stored.
        </p>
        <button className="mic-btn-primary" onClick={onGrant}>
          Allow Microphone Access
        </button>
        <p className="mic-modal-hint">
          You can revoke this permission anytime in your browser settings.
        </p>
      </div>
    </div>
  )
}
