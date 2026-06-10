import { useState, useEffect } from 'react'
import TemplateSelector from './TemplateSelector'
import { fillTemplate }  from '../utils/templates'
import { sendWebhook }   from '../utils/webhook'
import { getSettings, addToHistory } from '../utils/storage'
import { createCalendarEventWithMeet } from '../utils/googleCalendar'

const INTERVIEW_TYPES = [
  'Video call - Google Meet', 'Video call - Zoom', 'Phone call', 'In-person',
]
const ROUNDS = [
  'Round 1 - HR Screening', 'Round 2 - Technical', 'Round 3 - Final/Managerial',
]
const DURATIONS = ['30 min', '45 min', '1 hour']

const BLANK = {
  candidateName:  '',
  candidateEmail: '',
  candidatePhone: '',
  role:           '',
  interviewDate:  '',
  interviewTime:  '',
  interviewType:  '',
  interviewRound: '',
  interviewerName: '',
  meetingLink:    '',
  duration:       '',
  emailTemplate:  'invite',
  emailSubject:   '',
  emailBody:      '',
  notes:          '',
  ccEmails:       '',
}

function calcStep(f) {
  if (f.candidateName && f.candidateEmail && f.role && f.interviewDate && f.interviewTime) return 2
  if (f.candidateName && f.candidateEmail && f.role) return 1
  return 0
}

export default function SendInviteForm({ showToast }) {
  const [form, setForm]           = useState(BLANK)
  const [errors, setErrors]       = useState({})
  const [sending, setSending]     = useState(false)
  const [success, setSuccess]     = useState(null)
  const [files, setFiles]         = useState([])
  const [dragOver, setDragOver]   = useState(false)
  const [manualEdit, setManualEdit] = useState(false)
  const [calendarCreating, setCalendarCreating] = useState(false)
  const [calendarEvent, setCalendarEvent] = useState(null)

  // Auto-populate subject & body whenever template / form data changes
  // (unless the user has manually edited the body)
  useEffect(() => {
    if (manualEdit) return
    const { subject, body } = fillTemplate(form.emailTemplate, {
      candidateName: form.candidateName,
      role:          form.role,
      date:          form.interviewDate,
      time:          form.interviewTime,
      interviewType: form.interviewType,
      round:         form.interviewRound,
      interviewer:   form.interviewerName,
      meetingLink:   form.meetingLink,
      duration:      form.duration,
    })
    setForm(prev => ({ ...prev, emailSubject: subject, emailBody: body }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.emailTemplate, form.candidateName, form.role,
    form.interviewDate, form.interviewTime, form.interviewType,
    form.interviewRound, form.interviewerName, form.meetingLink,
    form.duration, manualEdit,
  ])

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const resetManualEdit = (template) => {
    setManualEdit(false)
    set('emailTemplate', template)
  }

  const validate = () => {
    const e = {}
    if (!form.candidateName.trim())  e.candidateName  = 'Full name is required'
    if (!form.candidateEmail.trim()) e.candidateEmail = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.candidateEmail)) e.candidateEmail = 'Invalid email address'
    if (!form.role)          e.role          = 'Position is required'
    if (!form.interviewDate) e.interviewDate = 'Interview date is required'
    if (!form.interviewTime) e.interviewTime = 'Interview time is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) { showToast('Please fill all required fields.', 'error'); return }

    setSending(true)
    setSuccess(null)
    const settings = getSettings()

    const finalBody = form.notes
      ? `${form.emailBody}\n\n---\nAdditional Notes: ${form.notes}`
      : form.emailBody

    const payload = {
      candidateName:  form.candidateName,
      candidateEmail: form.candidateEmail,
      candidatePhone: form.candidatePhone,
      role:           form.role,
      interviewDate:  form.interviewDate,
      interviewTime:  form.interviewTime,
      interviewType:  form.interviewType,
      interviewRound: form.interviewRound,
      interviewerName: form.interviewerName,
      meetingLink:    form.meetingLink,
      duration:       form.duration,
      emailTemplate:  form.emailTemplate,
      emailSubject:   form.emailSubject,
      emailBody:      finalBody,
      notes:          form.notes,
      ccEmails:       form.ccEmails,
      senderName:     settings.senderName,
      senderEmail:    settings.senderEmail,
      timestamp:      new Date().toISOString(),
    }

    try {
      await sendWebhook({ webhookUrl: settings.webhookUrl, authToken: settings.authToken, payload })
      addToHistory({ ...payload, status: 'sent' })
      setSuccess({ name: form.candidateName, email: form.candidateEmail })
      showToast(`Email sent to ${form.candidateName}! 🎉`, 'success')
      setForm(BLANK)
      setFiles([])
      setManualEdit(false)
      setCalendarEvent(null)
    } catch (err) {
      addToHistory({ ...payload, status: 'failed' })
      showToast(`Send failed: ${err.message}`, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleCreateCalendarEvent = async () => {
    const settings = getSettings()
    if (!settings.googleClientId) {
      showToast('Add your Google Client ID in the Settings tab first.', 'error')
      return
    }
    if (!form.interviewDate || !form.interviewTime) {
      showToast('Fill in interview date and time before creating the event.', 'error')
      return
    }
    setCalendarCreating(true)
    try {
      const result = await createCalendarEventWithMeet({
        clientId: settings.googleClientId,
        candidateName: form.candidateName || 'Candidate',
        candidateEmail: form.candidateEmail,
        role: form.role || 'Position',
        interviewDate: form.interviewDate,
        interviewTime: form.interviewTime,
        interviewType: form.interviewType,
        interviewRound: form.interviewRound,
        interviewerName: form.interviewerName,
        duration: form.duration,
        ccEmails: form.ccEmails,
      })
      if (result.meetLink) set('meetingLink', result.meetLink)
      setCalendarEvent(result)
      showToast('Google Calendar event created! Meet link auto-filled.', 'success')
    } catch (err) {
      showToast(`Calendar: ${err.message}`, 'error')
    } finally {
      setCalendarCreating(false)
    }
  }

  const addFiles = (newFiles) => setFiles(prev => [...prev, ...newFiles])

  const ic = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`
  const sc = (field) => ic(field) + ' bg-white'

  const step = calcStep(form)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">

      {/* ── Progress ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4">
        <div className="flex items-center">
          {['Fill Info', 'Add Details', 'Ready to Send'].map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                i < step  ? 'bg-green-500 text-white' :
                i === step ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}
              style={i === step ? { background: 'linear-gradient(135deg,#534AB7,#7C3AED)' } : {}}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i <= step ? 'text-gray-700' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < 2 && (
                <div className={`flex-1 mx-3 h-1 rounded-full transition-all ${i < step ? 'bg-green-400' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Success Banner ── */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <span className="text-2xl">🎉</span>
          <div className="flex-1">
            <p className="font-semibold text-green-800">Email sent successfully!</p>
            <p className="text-sm text-green-700">{success.name} · {success.email}</p>
          </div>
          <button type="button" onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700 text-xl leading-none">×</button>
        </div>
      )}

      {/* ── Section 1: Candidate Info ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader n={1} title="Candidate Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

          <Field label="Full Name" required error={errors.candidateName}>
            <input type="text" value={form.candidateName}
              onChange={e => set('candidateName', e.target.value)}
              placeholder="e.g. Priya Sharma" className={ic('candidateName')} />
          </Field>

          <Field label="Email Address" required error={errors.candidateEmail}>
            <input type="email" value={form.candidateEmail}
              onChange={e => set('candidateEmail', e.target.value)}
              placeholder="priya@example.com" className={ic('candidateEmail')} />
          </Field>

          <Field label="Phone Number">
            <input type="tel" value={form.candidatePhone}
              onChange={e => set('candidatePhone', e.target.value)}
              placeholder="+91 98765 43210" className={ic('candidatePhone')} />
          </Field>

          <Field label="Position Applied For" required error={errors.role}>
            <input type="text" value={form.role}
              onChange={e => set('role', e.target.value)}
              placeholder="e.g. Frontend Developer" className={ic('role')} />
          </Field>
        </div>
      </div>

      {/* ── Section 2: Interview Details ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader n={2} title="Interview Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

          <Field label="Interview Date" required error={errors.interviewDate}>
            <input type="date" value={form.interviewDate}
              onChange={e => set('interviewDate', e.target.value)} className={ic('interviewDate')} />
          </Field>

          <Field label="Interview Time" required error={errors.interviewTime}>
            <input type="time" value={form.interviewTime}
              onChange={e => set('interviewTime', e.target.value)} className={ic('interviewTime')} />
          </Field>

          <Field label="Duration">
            <select value={form.duration} onChange={e => set('duration', e.target.value)} className={sc('duration')}>
              <option value="">Select duration…</option>
              {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="Interview Type">
            <select value={form.interviewType} onChange={e => set('interviewType', e.target.value)} className={sc('interviewType')}>
              <option value="">Select type…</option>
              {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Interview Round">
            <select value={form.interviewRound} onChange={e => set('interviewRound', e.target.value)} className={sc('interviewRound')}>
              <option value="">Select round…</option>
              {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Interviewer Name">
            <input type="text" value={form.interviewerName}
              onChange={e => set('interviewerName', e.target.value)}
              placeholder="e.g. Ashish Kumar" className={ic('interviewerName')} />
          </Field>

          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Meeting Link / Office Location">
              <input type="text" value={form.meetingLink}
                onChange={e => set('meetingLink', e.target.value)}
                placeholder="https://meet.google.com/… or 5th Floor, Mervix HQ, Bengaluru"
                className={ic('meetingLink')} />
            </Field>

            <button
              type="button"
              onClick={handleCreateCalendarEvent}
              disabled={calendarCreating || !form.interviewDate || !form.interviewTime}
              className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                calendarEvent
                  ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                  : 'border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}
            >
              {calendarCreating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Google Calendar event…
                </>
              ) : calendarEvent ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Event Created · Meet link auto-filled
                  <span className="text-gray-400 mx-1">·</span>
                  <a
                    href={calendarEvent.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 font-semibold"
                    onClick={e => e.stopPropagation()}
                  >
                    Open in Calendar
                  </a>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add to Google Calendar &amp; Generate Meet Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 3: Email Template ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader n={3} title="Email Template" />
        <div className="space-y-4 mt-4">

          <TemplateSelector value={form.emailTemplate} onChange={resetManualEdit} />

          {manualEdit && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              ✏️ You've manually edited the body. Switch templates above to reset.
            </p>
          )}

          <Field label="Subject">
            <input type="text" value={form.emailSubject}
              onChange={e => set('emailSubject', e.target.value)} className={ic('emailSubject')} />
          </Field>

          <Field label="CC" hint="optional — comma-separated email addresses">
            <input
              type="text"
              value={form.ccEmails}
              onChange={e => set('ccEmails', e.target.value)}
              placeholder="manager@company.com, team@company.com"
              className={ic('ccEmails')}
            />
          </Field>

          <Field label="Email Body">
            <textarea
              value={form.emailBody}
              onChange={e => { set('emailBody', e.target.value); setManualEdit(true) }}
              rows={14}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono leading-relaxed transition-all resize-y scrollbar-thin"
            />
          </Field>

          <Field label="Additional Notes" hint="Appended at the bottom of the email">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Any extra context for this candidate…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all resize-y"
            />
          </Field>
        </div>
      </div>

      {/* ── Section 4: Attachments ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader n={4} title="Attachments" badge="optional" />
        <div className="mt-4">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault(); setDragOver(false)
              addFiles(Array.from(e.dataTransfer.files))
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              multiple
              id="file-upload"
              className="hidden"
              onChange={e => addFiles(Array.from(e.target.files))}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-3xl mb-2">📎</div>
              <p className="text-sm text-gray-600">
                Drag &amp; drop files here, or{' '}
                <span className="text-indigo-600 font-medium underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Any file type · included in payload as metadata</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-gray-700 truncate">📄 {file.name} <span className="text-gray-400 text-xs">({(file.size / 1024).toFixed(1)} KB)</span></span>
                  <button type="button" onClick={() => setFiles(p => p.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 ml-3 text-xl leading-none flex-shrink-0">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Send Button ── */}
      <div className="flex justify-end pb-4">
        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-3 px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-lg transition-all hover:shadow-xl hover:opacity-95 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #534AB7 0%, #7C3AED 100%)' }}
        >
          {sending ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending Email…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Interview Email
            </>
          )}
        </button>
      </div>
    </form>
  )
}

/* ── small helpers ── */
function SectionHeader({ n, title, badge }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#534AB7,#7C3AED)' }}
      >
        {n}
      </span>
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      {badge && (
        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">{badge}</span>
      )}
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 font-normal text-xs ml-1">· {hint}</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
