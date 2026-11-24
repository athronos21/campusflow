import { hasAdminAccess, hasMerchantAccess } from './roles.ts';

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

export interface DrawerSection {
  title: string;
  items: NavItem[];
}

export interface PortalLink {
  href: string;
  label: string;
  badge: string;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Pulse' },
  { href: '/directory', label: 'Directory' },
  { href: '/transport', label: 'Transport' },
  { href: '/housing', label: 'Housing' },
  { href: '/learning', label: 'Academic' },
];

export const MORE_CAMPUS_ITEMS: NavItem[] = [
  { href: '/events', label: 'Campus Events', description: 'RSVPs and QR event passes' },
  { href: '/bookings', label: 'Service Bookings', description: 'Print, repair & laundry slots' },
  { href: '/marketplace', label: 'Student Market', description: 'Textbooks, gear & dorm items' },
  { href: '/maintenance', label: 'Dorm Maintenance', description: 'Work orders and campus fixes' },
];

export const MOBILE_DRAWER_SECTIONS: DrawerSection[] = [
  {
    title: 'Daily Campus',
    items: [
      { href: '/', label: 'Campus Pulse' },
      { href: '/directory', label: 'Cafeterias & Shops' },
      { href: '/orders', label: 'My Orders' },
      { href: '/cart', label: 'Pickup Cart' },
    ],
  },
  {
    title: 'Transit & Living',
    items: [
      { href: '/transport', label: 'Shuttles & Buses' },
      { href: '/housing', label: 'Verified Housing' },
      { href: '/bookings', label: 'Service Bookings' },
      { href: '/maintenance', label: 'Dorm Maintenance' },
    ],
  },
  {
    title: 'Academic & Community',
    items: [
      { href: '/learning', label: 'Past Papers Vault' },
      { href: '/events', label: 'Campus Events' },
      { href: '/marketplace', label: 'Student Marketplace' },
    ],
  },
  {
    title: 'Identity & Partner',
    items: [
      { href: '/profile', label: 'Profile & Digital ID' },
      { href: '/merchant/register', label: 'Open a Campus Shop' },
    ],
  },
];

/**
 * Returns portal links permitted for the authenticated user's roles.
 */
export function getRolePortalLinks(roles?: string[] | null): PortalLink[] {
  const links: PortalLink[] = [];
  if (hasMerchantAccess(roles)) {
    links.push({
      href: '/merchant/dashboard',
      label: 'Merchant Portal',
      badge: 'MERCHANT',
    });
  }
  if (hasAdminAccess(roles)) {
    links.push({
      href: '/admin/verifications',
      label: 'Admin Panel',
      badge: 'ADMIN',
    });
  }
  return links;
}
