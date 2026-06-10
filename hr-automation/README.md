# HR Interview Automation Portal
### Mervix Technology

A complete, password-protected single-page web app that lets your HR team send interview emails via **n8n webhooks** — no backend required.

---

## Quick Start (local dev)

```bash
cd hr-automation
npm install
npm run dev
```

Open `http://localhost:5173` and log in with the default password `mervix2024` (or whatever you set in `.env`).

---

## Deployment (Vercel — recommended)

```bash
npm run build          # outputs to /dist
```

1. Push the repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set **Environment Variables** in the Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_HR_PASSWORD` | Your chosen password, e.g. `HRteam@2025` |
| `VITE_WEBHOOK_URL` | Your n8n webhook URL (optional — can be set in app Settings) |

4. Deploy → share the Vercel URL with your HR team.

### Netlify alternative

```bash
npm run build
# drag-and-drop the /dist folder onto netlify.com/drop
```

Add the same env vars in **Site settings → Environment variables**, then trigger a redeploy.

---

## n8n Webhook Setup

1. Open your n8n instance → **New Workflow**
2. Add a **Webhook** trigger node
   - Method: `POST`
   - Path: anything (e.g. `/hr-invite`)
   - **CORS → Allow Origins: `*`**  ← required or the browser will be blocked
3. Wire up a **Gmail / SMTP / Send Email** node to send the email
   - Use `{{ $json.emailSubject }}` as the subject
   - Use `{{ $json.emailBody }}` as the body
   - Use `{{ $json.candidateEmail }}` as the recipient
4. Activate the workflow and copy the **Test URL** (or **Production URL** after activation)
5. Paste the URL in the HR portal → **Settings** tab → Save

---

## Payload sent to n8n

```json
{
  "candidateName":  "Priya Sharma",
  "candidateEmail": "priya@example.com",
  "candidatePhone": "+91 98765 43210",
  "role":           "Frontend Developer",
  "interviewDate":  "2025-07-15",
  "interviewTime":  "10:30",
  "interviewType":  "Video call - Google Meet",
  "interviewRound": "Round 1 - HR Screening",
  "interviewerName":"Ashish Kumar",
  "meetingLink":    "https://meet.google.com/abc-xyz",
  "duration":       "45 min",
  "emailTemplate":  "invite",
  "emailSubject":   "Interview Invitation – Frontend Developer at Mervix Technology",
  "emailBody":      "Dear Priya, ...",
  "notes":          "",
  "senderName":     "HR Team – Mervix Technology",
  "senderEmail":    "hr@mervixtechnology.com",
  "timestamp":      "2025-07-10T08:00:00.000Z"
}
```

---

## Features

| Feature | Details |
|---|---|
| 🔐 Login | Password-protected, session stored in localStorage |
| ✉️ Send Invite | Full form → 5 email templates → auto-filled placeholders |
| 📋 Email History | All sent emails logged locally, searchable, CSV export |
| ⚙️ Settings | Webhook URL, auth token, sender name/email, test button |
| 📱 Responsive | Works on mobile and desktop |

## File Structure

```
hr-automation/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── SendInviteForm.jsx
    │   ├── EmailHistory.jsx
    │   ├── Settings.jsx
    │   ├── TemplateSelector.jsx
    │   └── Toast.jsx
    └── utils/
        ├── templates.js
        ├── webhook.js
        └── storage.js
```
