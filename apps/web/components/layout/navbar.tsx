import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight text-slate-900">
          Campus<span className="text-indigo-600">Flow</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/directory" className="hover:text-indigo-600 transition">
            Directory
          </Link>
          <Link href="/orders" className="hover:text-indigo-600 transition">
            My Orders
          </Link>
          <Link href="/merchant/dashboard" className="hover:text-indigo-600 transition">
            Merchant Portal
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
