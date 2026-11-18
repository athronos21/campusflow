import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6">
        <div>
          <Link href="/" className="font-extrabold text-xl tracking-tight block mb-8">
            Campus<span className="text-rose-500">Flow</span> <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded">Admin</span>
          </Link>

          <nav className="space-y-2 text-sm font-medium">
            <Link
              href="/admin/verifications"
              className="block px-3 py-2 rounded-lg bg-rose-600 text-white"
            >
              Merchant Verifications
            </Link>
            <Link
              href="/admin/complaints"
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Complaints & Reports
            </Link>
          </nav>
        </div>

        <div className="text-xs text-slate-400 border-t border-slate-800 pt-4">
          <p className="font-medium text-slate-200">Campus Moderator Panel</p>
          <p>Haramaya University Administration</p>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
