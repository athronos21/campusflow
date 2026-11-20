import * as crypto from 'crypto';

export interface TelebirrPayload {
  appId: string;
  shortCode: string;
  outTradeNo: string;
  subject: string;
  totalAmount: string; // Amount in ETB (e.g. "120.00")
  receiveName?: string;
  notifyUrl: string;
  returnUrl?: string;
  timestamp: string;
  nonce: string;
  [key: string]: any;
}

/**
 * Creates an alphabetically-sorted query string from payload parameters
 * excluding signature and empty/null values.
 */
export function formatSignString(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'sign' && k !== 'signature' && params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();

  return sortedKeys.map((k) => `${k}=${String(params[k])}`).join('&');
}

/**
 * Generates an HMAC-SHA256 signature for Telebirr requests.
 */
export function generateTelebirrSignature(params: Record<string, any>, appKey: string): string {
  const signString = formatSignString(params);
  return crypto.createHmac('sha256', appKey).update(signString, 'utf8').digest('hex').toUpperCase();
}

/**
 * Verifies an incoming Telebirr webhook signature against the payload and app key.
 */
export function verifyTelebirrSignature(params: Record<string, any>, signature: string, appKey: string): boolean {
  if (!signature || !appKey) return false;
  const expected = generateTelebirrSignature(params, appKey);
  try {
    const sigBuffer = Buffer.from(signature.toUpperCase(), 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generates an HMAC-SHA256 signature for CBE Birr webhooks and notifications.
 */
export function generateCbeBirrSignature(rawPayload: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(rawPayload, 'utf8').digest('hex');
}

/**
 * Verifies a CBE Birr webhook signature in constant time.
 */
export function verifyCbeBirrSignature(rawPayload: string, signature: string, secretKey: string): boolean {
  if (!signature || !secretKey) return false;
  const expected = generateCbeBirrSignature(rawPayload, secretKey);
  try {
    const sigBuffer = Buffer.from(signature.toLowerCase(), 'hex');
    const expectedBuffer = Buffer.from(expected.toLowerCase(), 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
