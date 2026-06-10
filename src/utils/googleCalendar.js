export async function createCalendarEventWithMeet({
  calendarWebhookUrl,
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
  if (!calendarWebhookUrl) {
    throw new Error('Calendar Webhook URL not configured. Add it in the Settings tab.')
  }

  let res
  try {
    res = await fetch(calendarWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    })
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error('Network error or CORS blocked. Enable "Allow all origins" in the n8n calendar webhook node.')
    }
    throw err
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Calendar webhook error ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json().catch(() => ({}))
  return {
    meetLink: data.meetLink || '',
    eventLink: data.eventLink || '',
  }
}
