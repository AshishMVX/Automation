import { useEffect } from 'react'

const CONFIGS = {
  success: { bg: 'bg-green-500', icon: '✅' },
  error:   { bg: 'bg-red-500',   icon: '❌' },
  info:    { bg: 'bg-blue-500',  icon: 'ℹ️' },
}

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 5000)
    return () => clearTimeout(id)
  }, [onClose])

  const { bg, icon } = CONFIGS[type] || CONFIGS.info

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white ${bg} max-w-sm animate-slide-in`}
      role="alert"
    >
      <span className="mt-0.5 text-base flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium leading-snug flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 text-white/70 hover:text-white transition-colors text-xl leading-none flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
