export async function sendWebhook({ webhookUrl, authToken, payload }) {
  if (!webhookUrl) {
    throw new Error(
      'Webhook URL is not configured. Go to the Settings tab and add your n8n webhook URL.'
    )
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }

  let response
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error(
        'Network error or CORS blocked. In your n8n webhook node, enable "Allow all origins" under the CORS settings.'
      )
    }
    throw err
  }

  if (!response.ok) {
    let detail = ''
    try {
      const text = await response.text()
      detail = text ? ` — ${text.slice(0, 200)}` : ''
    } catch {
      /* ignore */
    }
    throw new Error(`Server responded with ${response.status} ${response.statusText}${detail}`)
  }

  return { success: true }
}
