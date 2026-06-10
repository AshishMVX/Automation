const HISTORY_KEY = 'hr_email_history'
const SETTINGS_KEY = 'hr_settings'

export const SENDER_NAME  = 'HR Team – Mervix Technology'
export const SENDER_EMAIL = 'hr@mervixtechnology.com'

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function addToHistory(entry) {
  const history = getHistory()
  history.unshift({ ...entry, id: Date.now() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearHistory() {
  localStorage.setItem(HISTORY_KEY, '[]')
}

export function getSettings() {
  const defaults = {
    webhookUrl: typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_WEBHOOK_URL || '') : '',
    authToken: '',
    googleClientId: '',
  }
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      ...defaults,
      ...saved,
      senderName: SENDER_NAME,
      senderEmail: SENDER_EMAIL,
    }
  } catch {
    return { ...defaults, senderName: SENDER_NAME, senderEmail: SENDER_EMAIL }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
