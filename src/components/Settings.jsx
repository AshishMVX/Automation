import { useState } from 'react'
import { getSettings, saveSettings } from '../utils/storage'
import { sendWebhook } from '../utils/webhook'

export default function Settings({ showToast }) {
  const [form, setForm]     = useState(getSettings)
  const [testing, setTesting] = useState(false)
  const [dirty, setDirty]   = useState(false)

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  const handleSave = () => {
    saveSettings(form)
    setDirty(false)
    showToast('Settings saved!', 'success')
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      await sendWebhook({
        webhookUrl: form.webhookUrl,
        authToken:  form.authToken,
        payload: {
          test:       true,
          message:    'Test payload from HR Automation Portal – Mervix Technology',
          timestamp:  new Date().toISOString(),
          senderName: form.senderName,
          senderEmail: form.senderEmail,
        },
      })
      showToast('Webhook test successful! n8n received the payload.', 'success')
    } catch (err) {
      showToast(`Test failed: ${err.message}`, 'error')
    } finally {
      setTesting(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all'

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">Configuration</h2>

        {/* Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            n8n Webhook URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={form.webhookUrl}
            onChange={e => set('webhookUrl', e.target.value)}
            placeholder="https://your-n8n.com/webhook/your-path"
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">The POST endpoint from your n8n Webhook trigger node.</p>
        </div>

        {/* Auth Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auth Token / API Key <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <input
            type="password"
            value={form.authToken}
            onChange={e => set('authToken', e.target.value)}
            placeholder="Bearer token if your webhook requires auth"
            className={inputCls}
            autoComplete="new-password"
          />
        </div>

        {/* Sender info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
            <input
              type="text"
              value={form.senderName}
              onChange={e => set('senderName', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
            <input
              type="email"
              value={form.senderEmail}
              onChange={e => set('senderEmail', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* CORS hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠️ n8n CORS Setup Required</p>
          <p>
            In your n8n Webhook node, open <strong>Settings → CORS</strong> and set{' '}
            <strong>Allow all origins</strong> to <code className="bg-amber-100 px-1 rounded">*</code>.
            Without this, browser requests will be blocked.
          </p>
        </div>

        {/* Google Calendar */}
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            📅 Google Calendar Integration
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google OAuth Client ID{' '}
              <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.googleClientId || ''}
              onChange={e => set('googleClientId', e.target.value)}
              placeholder="xxxxxxxx.apps.googleusercontent.com"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">
              Enables the "Create Google Meet" button on the Send Invite form.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">📋 One-time Setup</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
              <li>Open <strong>Google Cloud Console</strong> → create or select a project</li>
              <li>Enable the <strong>Google Calendar API</strong></li>
              <li>Go to <strong>Credentials → Create OAuth 2.0 Client ID</strong> (Web application)</li>
              <li>Add your app URL to <strong>Authorized JavaScript Origins</strong></li>
              <li>Copy the Client ID, paste above, and save settings</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !form.webhookUrl}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testing…
              </>
            ) : '🧪 Test Webhook'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 shadow-md"
            style={{ background: 'linear-gradient(135deg, #534AB7 0%, #7C3AED 100%)' }}
          >
            {dirty ? '💾 Save Settings' : '✅ Settings Saved'}
          </button>
        </div>
      </div>
    </div>
  )
}
