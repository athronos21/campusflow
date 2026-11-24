import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIMARY_NAV_ITEMS,
  MORE_CAMPUS_ITEMS,
  MOBILE_DRAWER_SECTIONS,
  getRolePortalLinks,
} from './navigation.ts';

test('navigation exposes all student routes without orphaned pages', () => {
  const allHrefs = new Set<string>([
    ...PRIMARY_NAV_ITEMS.map((item) => item.href),
    ...MORE_CAMPUS_ITEMS.map((item) => item.href),
    ...MOBILE_DRAWER_SECTIONS.flatMap((section) => section.items.map((item) => item.href)),
  ]);

  const requiredStudentRoutes = [
    '/',
    '/directory',
    '/transport',
    '/housing',
    '/learning',
    '/events',
    '/bookings',
    '/marketplace',
    '/maintenance',
    '/orders',
    '/profile',
    '/merchant/register',
  ];

  for (const route of requiredStudentRoutes) {
    assert.equal(allHrefs.has(route), true, `Missing route in navigation: ${route}`);
  }
});

test('getRolePortalLinks hides merchant and admin portals from students', () => {
  assert.deepEqual(getRolePortalLinks(['student']), []);
  assert.deepEqual(getRolePortalLinks(undefined), []);
});

test('getRolePortalLinks exposes merchant dashboard only for merchant role', () => {
  const links = getRolePortalLinks(['merchant']);
  assert.equal(links.some((l) => l.href === '/merchant/dashboard'), true);
  assert.equal(links.some((l) => l.href === '/admin/verifications'), false);
});

test('getRolePortalLinks exposes both admin and merchant links for campus_admin and campus_moderator', () => {
  const adminLinks = getRolePortalLinks(['campus_admin']);
  assert.equal(adminLinks.some((l) => l.href === '/admin/verifications'), true);
  assert.equal(adminLinks.some((l) => l.href === '/merchant/dashboard'), true);

  const modLinks = getRolePortalLinks(['campus_moderator']);
  assert.equal(modLinks.some((l) => l.href === '/admin/verifications'), true);
});
