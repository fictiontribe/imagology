export type FtAiRole = 'text' | 'text-lite' | 'image' | 'image-lite'

export interface FtAiResult {
  status: number
  model: string | null
  attempts: { model: string; status: number }[]
  data: any
}

export interface FtAiEnv {
  /** Service binding to the ft-ai Worker (preferred on Cloudflare). */
  FT_AI?: { generateContent(role: string, body: unknown): Promise<FtAiResult> }
  FT_AI_URL?: string
  FT_AI_KEY?: string
}

export declare const DEFAULT_FT_AI_URL: string
export declare function generateContent(env: FtAiEnv, role: FtAiRole, body: object): Promise<FtAiResult>
export declare function textOf(data: any): string | null
export declare function jsonOf<T = any>(data: any): T | null
export declare function imageOf(data: any): { mimeType: string; data: string } | null
export declare function finishReasonOf(data: any): string | null
export declare function failureMessage(status: number, noun?: string): string
