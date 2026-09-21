export function securityHeaders(development:boolean){
 return {
  'Content-Security-Policy':[
   "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
   `script-src 'self' blob: 'unsafe-inline' 'wasm-unsafe-eval'${development?" 'unsafe-eval'":''}`,
   "style-src 'self' 'unsafe-inline'", "font-src 'self' data:",
   "img-src 'self' data: blob: https:",
   `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.openstreetmap.org https://*.googleapis.com${development?' ws://localhost:* ws://127.0.0.1:*':''}`,
   "frame-src https://www.youtube-nocookie.com", "media-src 'self' blob: https://*.supabase.co",
   "worker-src 'self' blob:", "form-action 'self'",
  ].join('; '),
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy':'same-origin',
 };
}
export function blockedPath(path:string){
 try{path=decodeURIComponent(path)}catch{return true}
 return /(^|\/)\.(?:env(?:[./]|$)|git(?:\/|$))/.test(path)||/^\/(?:api\/)?admin(?:\/|$)/.test(path);
}
