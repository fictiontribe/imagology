import { generateContent, textOf, finishReasonOf, type FtAiEnv } from './ft-ai.mjs'

interface Env {
  FT_AI?: FtAiEnv['FT_AI']
  FT_AI_KEY?: string
  FT_AI_URL?: string
}

interface PagesContext {
  request: Request
  env: Env
}

interface SceneRequest {
  mode: 'scene'
  presetName?: string | null
  specString?: string | null
  moodCues?: string[]
}

interface ComposeRequest {
  mode: 'compose'
  decisions?: string[]
  scene?: Record<string, string>
  capMode?: boolean
}

type GenerateRequest = SceneRequest | ComposeRequest


const SCENE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    subject: { type: 'STRING' },
    environment: { type: 'STRING' },
    action: { type: 'STRING' },
    lightAtmosphere: { type: 'STRING' },
  },
  required: ['subject', 'environment', 'action', 'lightAtmosphere'],
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Deliberately HTTP 200 with an error payload rather than 5xx.
//
// This Function is served through the fictiontribe.com zone, and Cloudflare
// replaces the body of any 5xx origin response with its own "error code: 502"
// page. That silently destroyed our JSON, leaving the browser (and curl) with
// no way to see why generation failed. 4xx passes through untouched; 5xx does
// not. Returning 200 keeps the reason readable end to end.
//
// The real status is still recorded in the deployment logs via console.error.
function errorResponse(error: string): Response {
  return jsonResponse({ error }, 200)
}

// Turn an upstream status into something a person can act on. Deliberately
// avoids echoing raw Gemini text to end users; the detail goes to the logs.
function upstreamMessage(status: number): string {
  if (status === 429) return 'The idea engine is rate-limited right now — try again in a moment.'
  if (status === 404) return 'The idea engine model is unavailable — it may have been retired.'
  if (status === 400) return 'The idea engine rejected this request — its configuration needs updating.'
  if (status === 401 || status === 403) return 'The idea engine key was rejected.'
  if (status >= 500) return 'The idea engine is temporarily unavailable — try again shortly.'
  return 'The idea engine could not generate anything just now.'
}

// Gemini goes through the shared ft-ai gateway (FT_AI service binding). The
// gateway owns the model choice for the `text` role, retries transient failures,
// and falls back if a model is retired — so nothing here names a model.
async function callGemini(
  env: FtAiEnv,
  prompt: string,
  generationConfig: Record<string, unknown>,
): Promise<{ text: string | null; status: number }> {
  const result = await generateContent(env, 'text', { contents: [{ parts: [{ text: prompt }] }], generationConfig })
  if (result.status >= 400) {
    const attempts = result.attempts.map((a) => `${a.model}=${a.status}`).join(',')
    console.error(`ft-ai ${result.status} [${attempts}]: ${JSON.stringify(result.data).slice(0, 500)}`)
    return { text: null, status: result.status }
  }
  if (finishReasonOf(result.data) === 'MAX_TOKENS') {
    console.error(`Answer truncated at maxOutputTokens (model ${result.model})`)
  }
  // Thinking models can emit several parts; the answer is the last non-thought text part.
  return { text: textOf(result.data), status: result.status }
}

function scenePrompt(body: SceneRequest): string {
  const look = body.presetName
    ? `"${body.presetName}"${body.specString ? ` (${body.specString})` : ''}`
    : 'a custom manual setup'
  const cues = body.moodCues && body.moodCues.length > 0 ? body.moodCues.join(', ') : 'none set yet'
  return [
    'You are a film director inventing one still-photograph scene for an analog-photography image prompt.',
    `The look the photographer has dialed in: ${look}. Mood cues from their other selections: ${cues}.`,
    'Invent ONE fresh, specific, filmable scene: a real kind of place, one clear subject, a moment caught mid-motion.',
    'Be surprising and concrete — a night ferry deckhand, a laundromat at closing, a beekeeper in a city lot — never a generic person standing somewhere.',
    'Do not mention cameras, lenses, film stocks, or eras; those are chosen elsewhere.',
    'Return JSON with exactly these fields:',
    'subject — who or what the frame is about, 18 words max.',
    'environment — where this is happening, 18 words max.',
    'action — what is happening mid-motion, 15 words max.',
    'lightAtmosphere — the mood the light is carrying, 15 words max.',
  ].join('\n')
}

function composePrompt(body: ComposeRequest): string {
  const decisions = body.decisions && body.decisions.length > 0 ? body.decisions.join('\n') : 'none'
  const scene = body.scene ?? {}
  const sceneLines = Object.entries(scene)
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([field, value]) => `${field}: ${value.trim()}`)
    .join('\n')
  const lengthRule = body.capMode
    ? 'Length: one paragraph, and the whole thing MUST stay under 1000 characters.'
    : 'Length: one cohesive paragraph of roughly 170-230 words.'
  return [
    'You are a director of photography writing the final prompt for a film-photography image-generation model.',
    'Using ONLY the creative decisions listed below, write one narratively rich paragraph.',
    'Requirements:',
    '- Open with the framing and camera position.',
    '- Ground the subject in a lived-in moment with concrete, sensory visual detail — texture, color, small imperfections.',
    '- Weave the light through the scene: its direction, hardness, and what it does to the subject and background.',
    '- Name the camera body, film stock, grain, and scan character exactly as given; never invent gear that is not listed.',
    '- If an era is given, make it visible through wardrobe, signage, vehicles, and street life rather than naming a date twice.',
    '- Close on the emotional note the subject is holding.',
    '- Write it as the prompt itself: no preamble, no headings, no mention of prompts or models.',
    lengthRule,
    '',
    'Creative decisions:',
    decisions,
    sceneLines ? `\nScene notes:\n${sceneLines}` : '',
  ].join('\n')
}

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  if (!context.env.FT_AI && !context.env.FT_AI_KEY) {
    console.error('FT_AI service binding is not configured for this deployment')
    return errorResponse('The idea engine is not configured for this deployment.')
  }

  let body: GenerateRequest
  try {
    body = (await context.request.json()) as GenerateRequest
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  try {
    if (body.mode === 'scene') {
      const { text, status } = await callGemini(context.env, scenePrompt(body), {
        temperature: 1.2,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: SCENE_SCHEMA,
        // Headroom for the thinking model's reasoning tokens plus the JSON fields.
        maxOutputTokens: 4096,
      })
      if (!text) return errorResponse(upstreamMessage(status))
      const parsed = JSON.parse(text) as Record<string, unknown>
      const fields = ['subject', 'environment', 'action', 'lightAtmosphere'] as const
      if (!fields.every((field) => typeof parsed[field] === 'string')) {
        console.error(`Malformed scene output: ${text.slice(0, 300)}`)
        return errorResponse('The idea engine returned something unusable — try again.')
      }
      return jsonResponse({
        subject: parsed.subject,
        environment: parsed.environment,
        action: parsed.action,
        lightAtmosphere: parsed.lightAtmosphere,
      })
    }

    if (body.mode === 'compose') {
      const { text, status } = await callGemini(context.env, composePrompt(body), {
        temperature: 0.9,
        // gemini-flash-latest is a thinking model: composing a 170-230 word
        // paragraph burns ~3400 reasoning tokens BEFORE the prose. 2048 truncated
        // the final prompt mid-sentence in production. 8192 leaves ample headroom
        // (it's a ceiling, not usage, so the margin is free).
        maxOutputTokens: 8192,
      })
      if (!text) return errorResponse(upstreamMessage(status))
      return jsonResponse({ prompt: text.trim() })
    }
  } catch (err) {
    console.error(`Unhandled generation failure: ${String(err)}`)
    return errorResponse('The idea engine could not generate anything just now.')
  }

  return jsonResponse({ error: 'Unknown mode' }, 400)
}
