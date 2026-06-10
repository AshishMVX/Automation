import { useState } from 'react'
import SendInviteForm from './SendInviteForm'
import EmailHistory  from './EmailHistory'
import Settings      from './Settings'

const TABS = [
  { id: 'send',     label: 'Send Invite',   icon: '✉️' },
  { id: 'history',  label: 'Email History', icon: '📋' },
  { id: 'settings', label: 'Settings',      icon: '⚙️' },
]

export default function Dashboard({ onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState('send')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shadow"
                style={{ background: 'linear-gradient(135deg, #534AB7 0%, #7C3AED 100%)' }}
              >
                MT
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm sm:text-base leading-tight">HR Automation Portal</p>
                <p className="text-xs text-gray-400 hidden sm:block">Mervix Technology</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'send'     && <SendInviteForm showToast={showToast} />}
        {activeTab === 'history'  && <EmailHistory   showToast={showToast} />}
        {activeTab === 'settings' && <Settings        showToast={showToast} />}
      </main>
    </div>
  )
}
