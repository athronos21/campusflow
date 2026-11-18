import React from 'react';

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <header className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Pilot MVP · Haramaya University Main Campus
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Campus<span className="text-indigo-600">Flow</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          One unified digital platform for discovering campus businesses, ordering meals and supplies, and accessing university services.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <a
            href="#explore"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Explore Campus Services
          </a>
          <a
            href="http://localhost:4000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            REST API & Swagger
          </a>
        </div>
      </header>

      {/* Feature Grids */}
      <section id="explore" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mb-4">
            🛒
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Student Marketplace</h2>
          <p className="text-slate-600 text-sm mb-4">
            Browse verified campus cafes, print shops, and stationery stores. Order meals for quick pickup between lectures.
          </p>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            Active in Pilot MVP
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition">
          <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xl mb-4">
            🏪
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Merchant Portal</h2>
          <p className="text-slate-600 text-sm mb-4">
            Manage your campus shop menu, track live order queues, and view daily sales summaries with zero upfront software costs.
          </p>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Merchant Dashboard
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl mb-4">
            🚌
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Future Services</h2>
          <p className="text-slate-600 text-sm mb-4">
            Inter-city student transport ticketing, student housing listings, and club event registrations coming in Phase 2 & 3.
          </p>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
            Phase 2 Roadmap
          </span>
        </div>
      </section>

      {/* Product Charter Summary */}
      <footer className="text-center border-t border-slate-200 pt-8 text-sm text-slate-500">
        <p>Built with ❤️ by the 5-person engineering team for Haramaya University & Ethiopian Higher Education.</p>
        <p className="mt-1">Compliant with Ethiopian Personal Data Protection Proclamation No. 1321/2024.</p>
      </footer>
    </main>
  );
}
