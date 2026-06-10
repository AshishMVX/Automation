import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Toast from './components/Toast'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (localStorage.getItem('hr_session') === 'authenticated') {
      setIsLoggedIn(true)
    }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type, key: Date.now() })
  }

  const handleLogin = () => {
    localStorage.setItem('hr_session', 'authenticated')
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('hr_session')
    setIsLoggedIn(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} showToast={showToast} />
      ) : (
        <Login onLogin={handleLogin} showToast={showToast} />
      )}
    </div>
  )
}
