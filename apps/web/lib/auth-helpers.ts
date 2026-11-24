import { hasAdminAccess, hasMerchantAccess } from './roles.ts';

export function resolveLoginRedirect(nextParam: string | null, roles?: string[] | null): string {
  if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    return nextParam;
  }
  if (hasAdminAccess(roles)) return '/admin/verifications';
  if (hasMerchantAccess(roles)) return '/merchant/dashboard';
  return '/directory';
}

export function shouldPreferStoredBackendSession(
  storedToken: string | null,
  storedUserJson: string | null,
): boolean {
  if (!storedToken || storedToken === 'better-auth-session' || !storedUserJson) {
    return false;
  }
  try {
    const parsed = JSON.parse(storedUserJson);
    return Boolean(parsed && typeof parsed === 'object' && parsed.id);
  } catch {
    return false;
  }
}

export function shouldFallbackToBetterAuth(err: unknown): boolean {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = Number((err as { status?: unknown }).status);
    if (status >= 400 && status < 500) {
      return false;
    }
  }
  return true;
}
