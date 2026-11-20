'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, ArrowLeft, Store, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/merchant/orders', label: 'Live Order Queue', icon: ShoppingBag },
    { href: '/merchant/menu', label: 'Menu & Catalog', icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Merchant Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="font-black text-xl tracking-tight flex items-center gap-2">
              <span>Campus<span className="text-indigo-400">Flow</span></span>
            </Link>
            <Badge variant="secondary" className="bg-slate-800 text-indigo-300 text-[10px] font-bold">
              MERCHANT
            </Badge>
          </div>

          <nav className="space-y-1.5 text-sm font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campus Store</span>
            </Link>
          </div>
        </div>

        <div className="text-xs text-slate-400 border-t border-slate-800 pt-4 bg-slate-900/40">
          <div className="flex items-center gap-2 text-slate-200 font-bold mb-0.5">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <span>Haramaya Campus Cafe</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified Merchant Partner</span>
          </div>
        </div>
      </aside>

      {/* Main Merchant Content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl">{children}</main>
    </div>
  );
}
