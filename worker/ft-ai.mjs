// ft-ai client — copy this file (and ft-ai.d.mts for TypeScript) into any app that needs Gemini.
// Canonical copy: dev-projects/ft-ai/client/. Never call generativelanguage.googleapis.com directly.
//
// How it reaches the gateway, in order:
//   1. env.FT_AI service binding (Cloudflare apps) — RPC, no key, never leaves Cloudflare.
//      wrangler.jsonc: "services": [{ "binding": "FT_AI", "service": "ft-ai" }]
//   2. HTTP to env.FT_AI_URL with env.FT_AI_KEY (Node apps, local dev without the binding).
//
// Ask for a ROLE, not a model: 'text' | 'text-lite' | 'image' | 'image-lite'.
// `body` is a normal Gemini generateContent request body; `data` is Gemini's normal response.

export const DEFAULT_FT_AI_URL = 'https://ft-ai.james-0cc.workers.dev'

/**
 * @param {{ FT_AI?: any, FT_AI_URL?: string, FT_AI_KEY?: string }} env
 * @param {'text'|'text-lite'|'image'|'image-lite'} role
 * @param {object} body Gemini generateContent request body
 * @returns {Promise<{ status: number, model: string|null, attempts: {model: string, status: number}[], data: any }>}
 */
export async function generateContent(env, role, body) {
  if (env?.FT_AI && typeof env.FT_AI.generateContent === 'function') {
    return env.FT_AI.generateContent(role, body)
  }
  const key = env?.FT_AI_KEY
  if (!key) {
    return {
      status: 500,
      model: null,
      attempts: [],
      data: { error: { code: 500, message: 'No FT_AI binding and no FT_AI_KEY configured', status: 'MISCONFIGURED' } },
    }
  }
  const res = await fetch(`${env.FT_AI_URL || DEFAULT_FT_AI_URL}/v1/roles/${role}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  })
  let data
  try {
    data = await res.json()
  } catch {
    data = { error: { code: res.status, message: 'ft-ai returned a non-JSON response', status: 'GATEWAY_NON_JSON' } }
  }
  const attempts = (res.headers.get('x-ft-ai-attempts') || '')
    .split(',')
    .filter(Boolean)
    .map((pair) => {
      const [model, status] = pair.split('=')
      return { model, status: Number(status) }
    })
  const model = res.headers.get('x-ft-ai-model')
  return { status: res.status, model: model && model !== 'none' ? model : null, attempts, data }
}

/** The answer text: the last non-thought text part (thinking models can emit several parts). */
export function textOf(data) {
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  return parts.filter((p) => p.text && !p.thought).at(-1)?.text ?? null
}

/** Parse a JSON answer, tolerating ```json fences. Returns null when it isn't valid JSON. */
export function jsonOf(data) {
  const text = textOf(data)
  if (!text) return null
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end <= start) return null
    try {
      return JSON.parse(cleaned.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

/** First generated image as { mimeType, data (base64) }, or null. */
export function imageOf(data) {
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  const part = parts.find((p) => p.inlineData?.data)
  return part ? { mimeType: part.inlineData.mimeType || 'image/png', data: part.inlineData.data } : null
}

/** Why the answer stopped — 'MAX_TOKENS' means maxOutputTokens starved the thinking model. */
export function finishReasonOf(data) {
  return data?.candidates?.[0]?.finishReason ?? null
}

/** A short, user-safe message for a failed call. Raw upstream detail belongs in logs, not the UI. */
export function failureMessage(status, noun = 'The AI engine') {
  if (status === 429) return `${noun} is rate-limited right now — try again in a moment.`
  if (status === 401 || status === 403) return `${noun} could not authenticate.`
  if (status === 400) return `${noun} rejected this request — its configuration needs updating.`
  if (status >= 500) return `${noun} is temporarily unavailable — try again shortly.`
  return `${noun} could not generate anything just now.`
}
