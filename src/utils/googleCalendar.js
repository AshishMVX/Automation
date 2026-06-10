const SCOPES = 'https://www.googleapis.com/auth/calendar.events'
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

let _gisLoaded = false

function loadGIS() {
  if (_gisLoaded || window.google?.accounts?.oauth2) {
    _gisLoaded = true
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => { _gisLoaded = true; resolve() }
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(s)
  })
}

function durationToMinutes(duration) {
  if (!duration) return 60
  if (duration.includes('30')) return 30
  if (duration.includes('45')) return 45
  return 60
}

function addMinutes(dateStr, timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const endH = Math.floor(total / 60) % 24
  const endM = total % 60
  return `${dateStr}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`
}

export async function createCalendarEventWithMeet({
  clientId,
  candidateName,
  candidateEmail,
  role,
  interviewDate,
  interviewTime,
  interviewType,
  interviewRound,
  interviewerName,
  duration,
  ccEmails,
}) {
  await loadGIS()

  const accessToken = await new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error_description || resp.error))
        else resolve(resp.access_token)
      },
      error_callback: (err) => reject(new Error(err.message || 'Google auth failed')),
    })
    client.requestAccessToken({ prompt: '' })
  })

  const startDT = `${interviewDate}T${interviewTime}:00`
  const endDT = addMinutes(interviewDate, interviewTime, durationToMinutes(duration))

  const ccList = ccEmails
    ? ccEmails.split(',').map(e => e.trim()).filter(Boolean)
    : []

  const attendees = [
    candidateEmail ? { email: candidateEmail } : null,
    ...ccList.map(e => ({ email: e })),
  ].filter(Boolean)

  const description = [
    `Interview for: ${role}`,
    interviewRound ? `Round: ${interviewRound}` : '',
    interviewType ? `Type: ${interviewType}` : '',
    interviewerName ? `Interviewer: ${interviewerName}` : '',
    duration ? `Duration: ${duration}` : '',
  ].filter(Boolean).join('\n')

  const event = {
    summary: `Interview – ${candidateName} | ${role} @ Mervix Technology`,
    description,
    start: { dateTime: `${startDT}+05:30`, timeZone: 'Asia/Kolkata' },
    end: { dateTime: `${endDT}+05:30`, timeZone: 'Asia/Kolkata' },
    attendees,
    conferenceData: {
      createRequest: {
        requestId: `mervix-${interviewDate}-${interviewTime}`.replace(/:/g, ''),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 1440 },
        { method: 'popup', minutes: 30 },
      ],
    },
  }

  const res = await fetch(
    `${CALENDAR_API}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Calendar API error ${res.status}`)
  }

  const data = await res.json()
  const meetLink =
    data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri || ''

  return { meetLink, eventLink: data.htmlLink }
}
