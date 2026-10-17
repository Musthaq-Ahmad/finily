export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
  return atob(padded);
}

/**
 * Reads the claims out of a Google ID token WITHOUT verifying its signature.
 * Fine for this frontend-only milestone (there's no backend to verify
 * against yet), but production must send the raw token to the server and
 * verify it there (see the production spec's Auth gap) before trusting any
 * claim read here — a client can hand this function any JWT-shaped string.
 */
export function decodeGoogleIdToken(idToken: string): GoogleProfile {
  const payloadSegment = idToken.split('.')[1];
  if (!payloadSegment) throw new Error('Malformed Google credential.');
  const claims: Record<string, unknown> = JSON.parse(base64UrlDecode(payloadSegment));
  if (typeof claims.sub !== 'string' || typeof claims.email !== 'string') {
    throw new Error('Google credential is missing required claims.');
  }
  return {
    sub: claims.sub,
    email: claims.email,
    emailVerified: claims.email_verified === true,
    name: typeof claims.name === 'string' ? claims.name : null,
    picture: typeof claims.picture === 'string' ? claims.picture : null,
  };
}

const SESSION_KEY = 'finly_session';

export interface Session {
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
}

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}
