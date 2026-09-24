/** HTTPS policy helpers shared by middleware and the security header module. */

/** Browsers ignore HSTS delivered over plain HTTP, so this is safe to send from either scheme. */
export const HSTS_VALUE = 'max-age=31536000';

const LOOPBACK_NAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

/** Extracts the host name from a Host/X-Forwarded-Host authority, including bracketed IPv6. */
export function hostName(authority: string | null | undefined): string {
  if (!authority) return '';
  const value = authority.trim().toLowerCase();
  if (value.startsWith('[')) {
    const closing = value.indexOf(']');
    return closing === -1 ? value.slice(1) : value.slice(1, closing);
  }
  const colon = value.indexOf(':');
  return colon === -1 ? value : value.slice(0, colon);
}

/**
 * Loopback and private-address hosts are local previews, not the public site.
 * They keep plain HTTP so `npm run dev`, `npm start` and the launcher keep working.
 */
export function isLocalHost(authority: string | null | undefined): boolean {
  const name = hostName(authority);
  if (!name) return true;
  return (
    LOOPBACK_NAMES.has(name) ||
    name.endsWith('.localhost') ||
    name.startsWith('127.') ||
    name.startsWith('192.168.') ||
    name.startsWith('169.254.') ||
    name.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(name)
  );
}

/** Trusts the proxy's X-Forwarded-Proto when present, otherwise the request URL scheme. */
export function effectiveProtocol(
  forwardedProto: string | null | undefined,
  urlProtocol: string,
): 'http' | 'https' {
  const forwarded = (forwardedProto ?? '').split(',')[0].trim().toLowerCase();
  if (forwarded === 'https' || forwarded === 'http') return forwarded;
  return urlProtocol.toLowerCase() === 'https:' ? 'https' : 'http';
}

/**
 * Returns the HTTPS URL a plain-HTTP public request must be redirected to,
 * or null when the request is already secure or is a local preview.
 */
export function httpsRedirectUrl(
  authority: string | null | undefined,
  pathname: string,
  search: string,
  forwardedProto: string | null | undefined,
  urlProtocol: string,
): string | null {
  if (isLocalHost(authority)) return null;
  if (effectiveProtocol(forwardedProto, urlProtocol) === 'https') return null;
  const host = authority?.trim();
  if (!host) return null;
  return `https://${host}${pathname}${search}`;
}

/** True when the app is running with production assets, where public links must be HTTPS. */
export function isProductionBuild(nodeEnv: string | undefined): boolean {
  return nodeEnv === 'production';
}
