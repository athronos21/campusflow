'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
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
          <Link href="/admin/verifications" className="hover:text-indigo-600 transition">
            Admin
          </Link>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                👤 {user.displayName}
              </span>
              <button
                onClick={logout}
                className="text-xs text-rose-600 font-medium hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
