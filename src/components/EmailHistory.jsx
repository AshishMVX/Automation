import { useState, useEffect } from 'react'
import { getHistory, clearHistory } from '../utils/storage'

const TEMPLATE_LABELS = {
  invite:      'Invite',
  reschedule:  'Reschedule',
  reminder:    'Reminder',
  rejected:    'Not Selected',
  shortlisted: 'Shortlisted',
}

export default function EmailHistory({ showToast }) {
  const [history, setHistory]         = useState([])
  const [search, setSearch]           = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const filtered = history.filter(e =>
    !search ||
    e.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
    e.candidateEmail?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  )

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    clearHistory()
    setHistory([])
    setConfirmClear(false)
    showToast('Email history cleared.', 'success')
  }

  const handleExportCSV = () => {
    if (!history.length) { showToast('No history to export.', 'error'); return }
    const cols = ['#', 'Candidate Name', 'Email', 'Role', 'Template', 'Date Sent', 'Status']
    const rows = history.map((e, i) => [
      i + 1,
      e.candidateName    || '',
      e.candidateEmail   || '',
      e.role             || '',
      TEMPLATE_LABELS[e.emailTemplate] || e.emailTemplate || '',
      e.timestamp ? new Date(e.timestamp).toLocaleString() : '',
      e.status           || '',
    ])
    const csv = [cols, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `mervix-hr-history-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported!', 'success')
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <svg className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400 pointer-events-none" style={{width:18,height:18}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all whitespace-nowrap"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleClear}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                confirmClear
                  ? 'bg-red-600 text-white'
                  : 'text-red-600 bg-red-50 hover:bg-red-100'
              }`}
            >
              {confirmClear ? '⚠️ Confirm' : '🗑️ Clear'}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm font-medium">
              {history.length === 0 ? 'No emails sent yet' : 'No results match your search'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    {['#', 'Candidate', 'Email', 'Role', 'Template', 'Sent', 'Status'].map(h => (
                      <th key={h} className="py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, idx) => (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-800 truncate max-w-[140px]">{entry.candidateName}</p>
                      </td>
                      <td className="py-3 px-2 text-gray-500 truncate max-w-[160px]">{entry.candidateEmail}</td>
                      <td className="py-3 px-2 text-gray-600 truncate max-w-[130px]">{entry.role}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs whitespace-nowrap">
                          {TEMPLATE_LABELS[entry.emailTemplate] || entry.emailTemplate}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-xs whitespace-nowrap">
                        {entry.timestamp
                          ? new Date(entry.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="py-3 px-2">
                        {entry.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing {filtered.length} of {history.length} record{history.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
