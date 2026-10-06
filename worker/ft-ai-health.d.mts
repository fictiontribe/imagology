export declare function healthResponse(
  request: Request,
  env: object,
  ctx?: { waitUntil(promise: Promise<unknown>): void },
  role?: 'text' | 'text-lite' | 'image' | 'image-lite',
): Promise<Response>
