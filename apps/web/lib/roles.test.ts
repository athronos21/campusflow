import test from 'node:test';
import assert from 'node:assert/strict';
import { hasMerchantAccess, hasAdminAccess, getPrimaryRoleLabel } from './roles.ts';
import { formatETB } from './utils.ts';

test('hasAdminAccess recognizes campus_admin, campus_moderator, and admin', () => {
  assert.equal(hasAdminAccess(['campus_admin']), true);
  assert.equal(hasAdminAccess(['campus_moderator']), true);
  assert.equal(hasAdminAccess(['admin']), true);
  assert.equal(hasAdminAccess(['student', 'campus_admin']), true);
  assert.equal(hasAdminAccess(['merchant']), false);
  assert.equal(hasAdminAccess(['student']), false);
  assert.equal(hasAdminAccess([]), false);
  assert.equal(hasAdminAccess(undefined), false);
  assert.equal(hasAdminAccess(null), false);
});

test('hasMerchantAccess recognizes merchant and admin roles', () => {
  assert.equal(hasMerchantAccess(['merchant']), true);
  assert.equal(hasMerchantAccess(['campus_admin']), true);
  assert.equal(hasMerchantAccess(['campus_moderator']), true);
  assert.equal(hasMerchantAccess(['admin']), true);
  assert.equal(hasMerchantAccess(['student']), false);
  assert.equal(hasMerchantAccess([]), false);
  assert.equal(hasMerchantAccess(undefined), false);
});

test('getPrimaryRoleLabel maps backend roles to clean display labels', () => {
  assert.equal(getPrimaryRoleLabel(['campus_admin']), 'System Admin');
  assert.equal(getPrimaryRoleLabel(['campus_moderator']), 'Moderator');
  assert.equal(getPrimaryRoleLabel(['admin']), 'System Admin');
  assert.equal(getPrimaryRoleLabel(['merchant']), 'Merchant');
  assert.equal(getPrimaryRoleLabel(['student']), 'Student');
  assert.equal(getPrimaryRoleLabel(['student', 'merchant']), 'Merchant');
  assert.equal(getPrimaryRoleLabel([]), 'Student');
  assert.equal(getPrimaryRoleLabel(undefined), 'Student');
});

test('formatETB formats integer minor units accurately', () => {
  assert.match(formatETB(8500), /85\.00/);
  assert.match(formatETB('140000'), /1,400\.00/);
});
