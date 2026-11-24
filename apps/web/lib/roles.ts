const ADMIN_ROLES = new Set(['campus_admin', 'campus_moderator', 'admin']);
const MERCHANT_ROLES = new Set(['merchant', 'campus_admin', 'campus_moderator', 'admin']);

/**
 * Checks whether a role list grants access to the Campus Admin / Moderator portal.
 */
export function hasAdminAccess(roles?: string[] | null): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => ADMIN_ROLES.has(role.toLowerCase()));
}

/**
 * Checks whether a role list grants access to the Merchant operations portal.
 */
export function hasMerchantAccess(roles?: string[] | null): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => MERCHANT_ROLES.has(role.toLowerCase()));
}

/**
 * Resolves a human-readable primary badge label from a user's assigned campus roles.
 */
export function getPrimaryRoleLabel(roles?: string[] | null): string {
  if (!roles || roles.length === 0) return 'Student';
  const normalized = roles.map((r) => r.toLowerCase());
  if (normalized.includes('campus_admin') || normalized.includes('admin')) {
    return 'System Admin';
  }
  if (normalized.includes('campus_moderator')) {
    return 'Moderator';
  }
  if (normalized.includes('merchant')) {
    return 'Merchant';
  }
  return 'Student';
}
