import React from 'react';
import Link from 'next/link';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Merchant Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6">
        <div>
          <Link href="/" className="font-extrabold text-xl tracking-tight block mb-8">
            Campus<span className="text-indigo-400">Flow</span> <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Merchant</span>
          </Link>

          <nav className="space-y-2 text-sm font-medium">
            <Link
              href="/merchant/dashboard"
              className="block px-3 py-2 rounded-lg bg-indigo-600 text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/merchant/orders"
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Live Order Queue
            </Link>
            <Link
              href="/merchant/menu"
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Menu & Catalog
            </Link>
          </nav>
        </div>

        <div className="text-xs text-slate-400 border-t border-slate-800 pt-4">
          <p className="font-medium text-slate-200">Haramaya Campus Cafe</p>
          <p>Verified Merchant Partner</p>
        </div>
      </aside>

      {/* Main Merchant Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
