/**
 * Imagology Worker — serves the Next.js static export (assets binding) and the
 * Gemini generation endpoint. The endpoint logic lives in ./generate.ts,
 * unchanged from its Pages Functions days; this file only routes to it.
 */
import { onRequestPost } from './generate'
import { healthResponse } from './ft-ai-health.mjs'
import type { FtAiEnv } from './ft-ai.mjs'

interface Env extends FtAiEnv {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // AI health for ft-tools/ai-audit.mjs: one tiny real call through FT_AI, cached 60 s.
    if (url.pathname === '/api/health') return healthResponse(request, env, ctx)

    if (url.pathname === '/api/generate') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }
      return onRequestPost({ request, env })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
