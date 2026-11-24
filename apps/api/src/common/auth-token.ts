import * as crypto from 'crypto';

export interface AccessTokenClaims {
  sub: string;
  email?: string | null;
  roles: string[];
  iat: number;
  exp: number;
}

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function getJwtSecret(): string {
  return (
    process.env.JWT_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    'campusflow-dev-jwt-secret'
  );
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice((input.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

/**
 * Signs an HS256 JWT containing the authenticated user's ID and campus roles.
 */
export function signAccessToken(payload: {
  sub: string;
  email?: string | null;
  roles: string[];
}): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(
    JSON.stringify({
      sub: payload.sub,
      email: payload.email ?? null,
      roles: payload.roles,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    } satisfies AccessTokenClaims),
  );
  const signingInput = `${header}.${body}`;
  const sig = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signingInput)
    .digest();
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

/**
 * Verifies an HS256 JWT signed by signAccessToken and returns its claims, or null if invalid/expired.
 */
export function verifyAccessToken(token: string): AccessTokenClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const signingInput = `${header}.${body}`;
    const expectedSig = base64UrlEncode(
      crypto.createHmac('sha256', getJwtSecret()).update(signingInput).digest(),
    );
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const claims = JSON.parse(base64UrlDecode(body)) as AccessTokenClaims;
    if (!claims?.sub || typeof claims.exp !== 'number') return null;
    if (claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}
