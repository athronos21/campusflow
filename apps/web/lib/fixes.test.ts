import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveLoginRedirect,
  shouldPreferStoredBackendSession,
  shouldFallbackToBetterAuth,
} from './auth-helpers.ts';
import {
  resolveMerchantBusinessId,
  partitionMerchantOrders,
} from './merchant-helpers.ts';
import { parseMaintenanceReport } from './maintenance-helpers.ts';
import { getPaymentVerifyEndpoint } from './payment-helpers.ts';

test('resolveLoginRedirect rejects protocol-relative and external redirects', () => {
  assert.equal(resolveLoginRedirect('//evil.com', ['student']), '/directory');
  assert.equal(resolveLoginRedirect('https://evil.com', ['student']), '/directory');
  assert.equal(resolveLoginRedirect('/orders', ['student']), '/orders');
  assert.equal(resolveLoginRedirect(null, ['campus_admin']), '/admin/verifications');
  assert.equal(resolveLoginRedirect(null, ['merchant']), '/merchant/dashboard');
});

test('shouldPreferStoredBackendSession keeps backend token over stale Better Auth cookie', () => {
  const validUser = JSON.stringify({ id: 'u1', displayName: 'Admin', roles: ['campus_admin'] });
  assert.equal(shouldPreferStoredBackendSession('sample-jwt-access-token', validUser), true);
  assert.equal(shouldPreferStoredBackendSession('better-auth-session', validUser), false);
  assert.equal(shouldPreferStoredBackendSession(null, validUser), false);
  assert.equal(shouldPreferStoredBackendSession('sample-jwt-access-token', 'bad-json'), false);
});

test('shouldFallbackToBetterAuth does not mask 400/401/409 backend errors', () => {
  assert.equal(shouldFallbackToBetterAuth({ status: 400, message: 'Password too short' }), false);
  assert.equal(shouldFallbackToBetterAuth({ status: 409, message: 'Email already registered' }), false);
  assert.equal(shouldFallbackToBetterAuth({ status: 401, message: 'Invalid credentials' }), false);
  assert.equal(shouldFallbackToBetterAuth({ status: 503, message: 'Service unavailable' }), true);
  assert.equal(shouldFallbackToBetterAuth(new TypeError('Failed to fetch')), true);
});

test('resolveMerchantBusinessId matches ownerId first then falls back cleanly', () => {
  const list = [
    { id: 'biz-1', ownerId: 'owner-1' },
    { id: 'biz-2', ownerId: 'owner-2' },
  ];
  assert.equal(resolveMerchantBusinessId(list, 'owner-2'), 'biz-2');
  assert.equal(resolveMerchantBusinessId(list, 'other-user'), 'biz-1');
  assert.equal(resolveMerchantBusinessId([], 'owner-1'), null);
});

test('partitionMerchantOrders includes accepted in active and cancelled in past', () => {
  const orders = [
    { id: '1', status: 'pending' },
    { id: '2', status: 'accepted' },
    { id: '3', status: 'preparing' },
    { id: '4', status: 'ready' },
    { id: '5', status: 'completed' },
    { id: '6', status: 'rejected' },
    { id: '7', status: 'cancelled' },
  ];
  const { activeOrders, pastOrders } = partitionMerchantOrders(orders);
  assert.deepEqual(
    activeOrders.map((o) => o.id),
    ['1', '2', '3', '4'],
  );
  assert.deepEqual(
    pastOrders.map((o) => o.id),
    ['5', '6', '7'],
  );
});

test('parseMaintenanceReport extracts category, block, room, and title', () => {
  const parsed = parseMaintenanceReport({
    id: 'r1',
    reason: '[ELECTRICAL] Flickering light',
    entityId: 'Block 42 (Main Campus) - Room 204',
    details: 'Breaker trips at night',
    status: 'open',
    createdAt: '2026-11-24T00:00:00.000Z',
  });
  assert.equal(parsed.category, 'electrical');
  assert.equal(parsed.title, 'Flickering light');
  assert.equal(parsed.dormBlock, 'Block 42 (Main Campus)');
  assert.equal(parsed.roomNumber, 'Room 204');
  assert.equal(parsed.status, 'in_progress');
});

test('getPaymentVerifyEndpoint targets /payments/verify/:reference', () => {
  assert.equal(getPaymentVerifyEndpoint('TB-12345'), '/payments/verify/TB-12345');
});
