// ft-ai app health — the /api/health contract read by ft-tools/ai-audit.mjs.
// Canonical copy: dev-projects/ft-ai/client/. Copy next to ft-ai.mjs.
//
// One tiny real call through the app's own FT_AI path, answered as
// { ok, model, ms, checkedAt }. Always HTTP 200 (5xx bodies don't survive the
// fictiontribe.com zone); `ok` is the verdict. Cached 60 s in the Cache API so a
// public endpoint can't be used to burn the shared Gemini cap.

import { generateContent, jsonOf } from './ft-ai.mjs'

const CACHE_SECONDS = 60

async function check(env, role) {
  const started = Date.now()
  if (!env?.FT_AI && !env?.FT_AI_KEY) return { ok: false, error: 'FT_AI binding not configured' }
  const result = await generateContent(env, role, {
    contents: [{ parts: [{ text: 'Health check. Respond with exactly this JSON: {"ok": true}' }] }],
    generationConfig: { responseMimeType: 'application/json' },
  })
  const ms = Date.now() - started
  if (result.status >= 400) return { ok: false, status: result.status, model: result.model, ms, error: 'gateway call failed' }
  return jsonOf(result.data)?.ok === true
    ? { ok: true, model: result.model, ms }
    : { ok: false, model: result.model, ms, error: 'answer was not the expected JSON' }
}

/**
 * @param {Request} request
 * @param {object} env  must carry FT_AI (binding) or FT_AI_KEY
 * @param {{ waitUntil(p: Promise<unknown>): void } | undefined} ctx
 * @param {string} [role='text']
 */
export async function healthResponse(request, env, ctx, role = 'text') {
  const cache = typeof caches !== 'undefined' ? caches.default : null
  const cacheKey = new Request(new URL('/api/health', request.url).toString())
  if (cache) {
    const cached = await cache.match(cacheKey)
    if (cached) return cached
  }
  let body
  try {
    body = await check(env, role)
  } catch (err) {
    console.error(`Health check failed: ${String(err)}`)
    body = { ok: false, error: 'health check threw' }
  }
  const response = new Response(JSON.stringify({ ...body, checkedAt: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
  })
  if (cache) {
    const put = cache.put(cacheKey, response.clone())
    if (ctx?.waitUntil) ctx.waitUntil(put)
    else await put
  }
  return response
}
