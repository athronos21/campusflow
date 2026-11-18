import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full">
        {/* Hero Section */}
        <header className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Pilot · Haramaya University Main Campus
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
            Campus<span className="text-indigo-600">Flow</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            One unified digital platform for discovering verified campus businesses, ordering meals, booking intercity transport, and accessing university services.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              href="/directory"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-sm text-sm"
            >
              Explore Campus Directory →
            </Link>
            <Link
              href="/transport"
              className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition text-sm flex items-center gap-2"
            >
              <span>🚌</span> Book Campus Bus
            </Link>
            <a
              href="http://localhost:4000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition text-sm"
            >
              📑 OpenAPI Specs
            </a>
          </div>
        </header>

        {/* Feature Grids */}
        <section id="explore" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            href="/directory"
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl mb-4">
                ☕
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Student Marketplace & Food</h2>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Browse verified campus cafes, print shops, and stationery stores. Order meals for pickup between lectures with Telebirr pay.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block w-fit">
              ✓ Active in Pilot MVP
            </span>
          </Link>

          <Link
            href="/transport"
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl mb-4">
                🚌
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Transport & Ticketing</h2>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Daily student bus shuttles and minibuses to Dire Dawa and Harar, plus weekend Selam Bus coaches to Addis Ababa with digital QR boarding passes.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md inline-block w-fit">
              ✓ Live in Phase 2
            </span>
          </Link>

          <Link
            href="/merchant/dashboard"
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-2xl mb-4">
                🏪
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Merchant Portal</h2>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Zero-cost dashboard for campus businesses: live audio-alert order queue, catalog management, and Telebirr transaction reconciliation.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md inline-block w-fit">
              Merchant Tools
            </span>
          </Link>
        </section>

        {/* Quick Demo Credentials Card */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-16 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Pilot Sandbox Credentials
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">Ready-to-Test Seeded Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">👨‍🎓 Student Account</span>
              <div className="text-slate-600 font-mono">student@haramaya.edu.et</div>
              <div className="text-slate-400 mt-0.5">Password: password123</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">☕ Merchant Account</span>
              <div className="text-slate-600 font-mono">merchant@haramayacafe.et</div>
              <div className="text-slate-400 mt-0.5">Password: password123</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">🛡️ Admin / Moderator</span>
              <div className="text-slate-600 font-mono">admin@campusflow.et</div>
              <div className="text-slate-400 mt-0.5">Password: password123</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
