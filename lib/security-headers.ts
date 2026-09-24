import { HSTS_VALUE } from './https-policy';

/**
 * @param development true when serving an unbundled development build
 * @param secure true when the request itself arrived over HTTPS
 */
export function securityHeaders(development:boolean,secure=false){
 const directives=[
  "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
  `script-src 'self' blob: 'unsafe-inline' 'wasm-unsafe-eval'${development?" 'unsafe-eval'":''}`,
  "style-src 'self' 'unsafe-inline'", "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.openstreetmap.org https://*.googleapis.com${development?' ws://localhost:* ws://127.0.0.1:*':''}`,
  "frame-src https://www.youtube-nocookie.com", "media-src 'self' blob: https://*.supabase.co",
  "worker-src 'self' blob:", "form-action 'self'",
 ];
 // Only a documented HTTPS response may upgrade its subresources: upgrading them on a
 // plain-HTTP local preview would break every image and script.
 if(secure)directives.push('upgrade-insecure-requests');
 const headers:Record<string,string>={
  'Content-Security-Policy':directives.join('; '),
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy':'same-origin',
 };
 if(secure)headers['Strict-Transport-Security']=HSTS_VALUE;
 return headers;
}
export function blockedPath(path:string){
 try{path=decodeURIComponent(path)}catch{return true}
 return /(^|\/)\.(?:env(?:[./]|$)|git(?:\/|$))/.test(path)||/^\/(?:api\/)?admin(?:\/|$)/.test(path);
}
