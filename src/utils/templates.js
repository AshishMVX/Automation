const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  } catch {
    return timeStr
  }
}

export const TEMPLATES = {
  invite: {
    label: 'Interview Invite',
    color: 'indigo',
    subject: 'Interview Invitation – {{role}} at Mervix Technology',
    body: `Dear {{candidateName}},

We are pleased to invite you for an interview for the {{role}} position at Mervix Technology.

📅 Date: {{date}}
🕐 Time: {{time}}
🎯 Type: {{interviewType}}
🔄 Round: {{round}}
👤 Interviewer: {{interviewer}}
🔗 Link / Location: {{meetingLink}}
⏱ Duration: {{duration}}

Please confirm your availability by replying to this email.

We look forward to speaking with you!

Best regards,
HR Team – Mervix Technology`,
  },

  reschedule: {
    label: 'Reschedule Notice',
    color: 'yellow',
    subject: 'Interview Rescheduled – {{role}} | Mervix Technology',
    body: `Dear {{candidateName}},

We hope this message finds you well. We are reaching out regarding your upcoming interview for the {{role}} position at Mervix Technology.

Due to an unforeseen scheduling conflict, we need to reschedule your interview. We sincerely apologise for any inconvenience this may cause.

Your updated interview details are as follows:

📅 New Date: {{date}}
🕐 New Time: {{time}}
🎯 Type: {{interviewType}}
🔄 Round: {{round}}
👤 Interviewer: {{interviewer}}
🔗 Link / Location: {{meetingLink}}
⏱ Duration: {{duration}}

Please confirm your availability for the new slot by replying to this email. If this timing does not work for you, please let us know and we will find a mutually convenient time.

We appreciate your understanding and patience.

Best regards,
HR Team – Mervix Technology`,
  },

  reminder: {
    label: 'Reminder (1 day before)',
    color: 'blue',
    subject: 'Reminder: Your Interview Tomorrow – {{role}} | Mervix Technology',
    body: `Dear {{candidateName}},

This is a friendly reminder that your interview for the {{role}} position at Mervix Technology is scheduled for tomorrow.

Here are your interview details:

📅 Date: {{date}}
🕐 Time: {{time}}
🎯 Type: {{interviewType}}
🔄 Round: {{round}}
👤 Interviewer: {{interviewer}}
🔗 Link / Location: {{meetingLink}}
⏱ Duration: {{duration}}

A few tips for tomorrow:
• Please join / arrive 5 minutes early
• Keep this email handy for the link / address
• Ensure your device and internet connection are ready (for video calls)

If you have any questions or need to reschedule, please contact us immediately.

Best of luck — we look forward to meeting you!

Best regards,
HR Team – Mervix Technology`,
  },

  rejected: {
    label: 'Not Selected',
    color: 'red',
    subject: 'Update on Your Application – {{role}} | Mervix Technology',
    body: `Dear {{candidateName}},

Thank you for your interest in the {{role}} position at Mervix Technology and for investing your time in our interview process.

After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. This was a difficult decision given the strong calibre of candidates we reviewed.

We genuinely appreciate the enthusiasm and effort you brought to our conversations. We encourage you to continue pursuing your career goals and wish you every success in your job search.

We will keep your details on file and may reach out should a suitable opportunity arise in the future.

Thank you again for considering Mervix Technology.

Best regards,
HR Team – Mervix Technology`,
  },

  shortlisted: {
    label: 'Shortlisted / Offer Stage',
    color: 'green',
    subject: "Congratulations! You've Been Shortlisted – {{role}} | Mervix Technology",
    body: `Dear {{candidateName}},

Congratulations! 🎉

We are delighted to inform you that you have been shortlisted for the {{role}} position at Mervix Technology following your recent interview.

Your skills, experience, and enthusiasm made a strong impression on our team, and we are very excited about the possibility of you joining us.

Our HR team will be in touch shortly with the next steps, which may include:
• Final documentation requirements
• Offer letter details
• Onboarding schedule and start date

In the meantime, please feel free to reach out if you have any questions.

We look forward to welcoming you to the Mervix Technology family!

Best regards,
HR Team – Mervix Technology`,
  },
}

export function fillTemplate(templateKey, data) {
  const template = TEMPLATES[templateKey]
  if (!template) return { subject: '', body: '' }

  const replace = (text) =>
    text
      .replace(/\{\{candidateName\}\}/g, data.candidateName || '')
      .replace(/\{\{role\}\}/g, data.role || '')
      .replace(/\{\{date\}\}/g, data.date ? formatDate(data.date) : '')
      .replace(/\{\{time\}\}/g, data.time ? formatTime(data.time) : '')
      .replace(/\{\{interviewType\}\}/g, data.interviewType || '')
      .replace(/\{\{round\}\}/g, data.round || '')
      .replace(/\{\{interviewer\}\}/g, data.interviewer || '')
      .replace(/\{\{meetingLink\}\}/g, data.meetingLink || '')
      .replace(/\{\{duration\}\}/g, data.duration || '')

  return {
    subject: replace(template.subject),
    body: replace(template.body),
  }
}
