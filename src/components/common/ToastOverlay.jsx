// src/components/common/ToastOverlay.jsx
import '../../styles/ToastOverlay.css'

export default function ToastOverlay({ open, message }) {
  if (!open) return null

  return (
    <div className="toast">
      <div className="toast__card" role="status" aria-live="polite">
        <div className="toast__msg">{message}</div>
      </div>
    </div>
  )
}