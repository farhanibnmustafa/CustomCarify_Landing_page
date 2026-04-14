const DEFAULT_RECIPIENT_EMAIL = 'hello@customcarify.com'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const trimField = (value) => value?.toString().trim() || ''

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const sendJson = (response, statusCode, payload) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

const validatePayload = (payload) => {
  const errors = []

  if (!payload.fullName) {
    errors.push('Full name is required.')
  }

  if (!payload.businessName) {
    errors.push('Business name is required.')
  }

  if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
    errors.push('A valid work email is required.')
  }

  if (!payload.phone) {
    errors.push('Phone or WhatsApp is required.')
  }

  if (!payload.volume) {
    errors.push('Monthly order volume is required.')
  }

  if (!payload.challenge) {
    errors.push('Your biggest workflow bottleneck is required.')
  }

  return errors
}

const buildSubmissionText = (payload) =>
  [
    'New workflow audit request',
    '',
    `Full name: ${payload.fullName}`,
    `Business name: ${payload.businessName}`,
    `Work email: ${payload.email}`,
    `Phone / WhatsApp: ${payload.phone}`,
    `Monthly order volume: ${payload.volume}`,
    '',
    'Biggest workflow bottleneck:',
    payload.challenge
  ].join('\n')

const buildSubmissionHtml = (payload) => {
  const challengeHtml = escapeHtml(payload.challenge).replaceAll('\n', '<br />')

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #153423; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">New workflow audit request</h2>
      <p style="margin: 0 0 16px;">A new CustomCarify landing page lead came in.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 700;">Full name</td>
          <td style="padding: 8px 0;">${escapeHtml(payload.fullName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 700;">Business name</td>
          <td style="padding: 8px 0;">${escapeHtml(payload.businessName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 700;">Work email</td>
          <td style="padding: 8px 0;">${escapeHtml(payload.email)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 700;">Phone / WhatsApp</td>
          <td style="padding: 8px 0;">${escapeHtml(payload.phone)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 700;">Monthly order volume</td>
          <td style="padding: 8px 0;">${escapeHtml(payload.volume)}</td>
        </tr>
      </table>
      <div style="margin-top: 20px;">
        <p style="margin: 0 0 8px; font-weight: 700;">Biggest workflow bottleneck</p>
        <p style="margin: 0;">${challengeHtml}</p>
      </div>
    </div>
  `.trim()
}

const normalizeRequestBody = (body) => {
  if (!body) {
    return null
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }

  if (typeof body === 'object') {
    return body
  }

  return null
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  const requestBody = normalizeRequestBody(request.body)

  if (!requestBody) {
    return sendJson(response, 400, { error: 'Invalid request payload.' })
  }

  const payload = {
    fullName: trimField(requestBody.fullName),
    businessName: trimField(requestBody.businessName),
    email: trimField(requestBody.email),
    phone: trimField(requestBody.phone),
    volume: trimField(requestBody.volume),
    challenge: trimField(requestBody.challenge),
    website: trimField(requestBody.website)
  }

  if (payload.website) {
    return sendJson(response, 200, {
      ok: true,
      message: 'Thanks. Your request is in and our team will review it shortly.'
    })
  }

  const validationErrors = validatePayload(payload)

  if (validationErrors.length > 0) {
    return sendJson(response, 400, { error: validationErrors[0] })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const resendFrom =
    process.env.RESEND_AUDIT_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.AUDIT_SENDER_EMAIL
  const resendTo =
    process.env.RESEND_AUDIT_TO ||
    process.env.AUDIT_RECIPIENT_EMAIL ||
    DEFAULT_RECIPIENT_EMAIL

  if (!resendApiKey || !resendFrom) {
    return sendJson(response, 503, {
      error:
        'Form submissions are not configured on this deployment yet. Email hello@customcarify.com directly.'
    })
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: resendFrom,
      to: resendTo,
      reply_to: payload.email,
      subject: `Workflow audit request from ${payload.businessName}`,
      text: buildSubmissionText(payload),
      html: buildSubmissionHtml(payload)
    })
  })

  if (!resendResponse.ok) {
    return sendJson(response, 502, {
      error: 'The email provider could not accept this request. Please try again shortly.'
    })
  }

  return sendJson(response, 200, {
    ok: true,
    message: 'Thanks. Your audit request is in and our team will reach out soon.'
  })
}
