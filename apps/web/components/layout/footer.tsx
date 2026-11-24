'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getRolePortalLinks } from '@/lib/navigation';

export function Footer() {
  const { user } = useAuth();
  const portalLinks = getRolePortalLinks(user?.roles);

  return (
    <footer className="border-t border-border bg-card text-xs text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          {/* Brand & Compliance */}
          <div className="space-y-3">
            <Link href="/" className="font-display font-black text-base tracking-tight text-foreground inline-flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-black">
                CF
              </span>
              <span>
                Campus<span className="text-primary">Flow</span>
              </span>
            </Link>
            <p className="leading-relaxed max-w-xs">
              Digital campus super-app piloted at Haramaya University Main Campus (Bate), serving Bate, Harar, and Dire Dawa.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Proclamation No. 1321/2024 Compliant</span>
            </div>
          </div>

          {/* Student & Campus Services */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Campus Services</h4>
              <ul className="space-y-1.5">
                <li><Link href="/directory" className="hover:text-primary transition-colors">Food &amp; Cafeterias</Link></li>
                <li><Link href="/transport" className="hover:text-primary transition-colors">Bus Shuttles &amp; Coach</Link></li>
                <li><Link href="/housing" className="hover:text-primary transition-colors">Student Housing</Link></li>
                <li><Link href="/learning" className="hover:text-primary transition-colors">Past Papers Vault</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Campus Life</h4>
              <ul className="space-y-1.5">
                <li><Link href="/events" className="hover:text-primary transition-colors">Campus Events</Link></li>
                <li><Link href="/bookings" className="hover:text-primary transition-colors">Service Bookings</Link></li>
                <li><Link href="/marketplace" className="hover:text-primary transition-colors">Student Marketplace</Link></li>
                <li><Link href="/maintenance" className="hover:text-primary transition-colors">Dorm Maintenance</Link></li>
              </ul>
            </div>
          </div>

          {/* Partners & Financial Standard */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-foreground">Merchants &amp; Settlement</h4>
            <p className="leading-relaxed">
              Settled via Telebirr and CBE Birr in integer ETB cents with zero floating-point rounding drift.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/merchant/register"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1.5 font-semibold text-foreground hover:bg-accent transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-primary" />
                <span>Register Campus Shop</span>
              </Link>
              {portalLinks.map((portal) => (
                <Link
                  key={portal.href}
                  href={portal.href}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  {portal.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>&copy; {new Date().getFullYear()} CampusFlow &mdash; Haramaya University Pilot.</p>
          <p className="font-mono">Integer ETB Cents &bull; Offline-First Craft</p>
        </div>
      </div>
    </footer>
  );
}
