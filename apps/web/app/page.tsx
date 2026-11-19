import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import {
  Bus,
  FileCode,
  Coffee,
  Home,
  Calendar,
  BookOpen,
  CalendarCheck,
  ShoppingCart,
  Store,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

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
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-sm text-sm inline-flex items-center gap-2"
            >
              Explore Campus Directory <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/transport"
              className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition text-sm flex items-center gap-2"
            >
              <Bus className="w-4 h-4 text-amber-600" /> Book Campus Bus
            </Link>
            <a
              href="http://localhost:4000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition text-sm flex items-center gap-2"
            >
              <FileCode className="w-4 h-4 text-slate-600" /> OpenAPI Specs
            </a>
          </div>
        </header>

        {/* Feature Grids - All 10 Services */}
        <section id="explore" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          <Link
            href="/directory"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">
                <Coffee className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Cafeteria & Food Pre-orders</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Order fresh Buna, Ful, and snacks for pickup between lectures. Real-time kitchen queue updates with audio chimes.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-fit">
              ✓ Service 01, 03, 04
            </span>
          </Link>

          <Link
            href="/transport"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                <Bus className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Transport & Bus Ticketing</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Daily shuttles to Dire Dawa & Harar, plus Selam Bus coaches to Addis Ababa with seat selection and QR boarding passes.
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded w-fit">
              ✓ Service 02 Live
            </span>
          </Link>

          <Link
            href="/housing"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-3">
                <Home className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Student Housing & Rooms</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Search verified off-campus rooms in Bate & Main Gate. Filter water, electricity, and WiFi amenities and schedule viewings.
              </p>
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded w-fit">
              ✓ Service 05 Available
            </span>
          </Link>

          <Link
            href="/events"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-violet-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Campus Events & Passes</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Haramaya Hackathon 2026, technology workshops, and guest lectures. Get instant verified digital QR entry passes.
              </p>
            </div>
            <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded w-fit">
              ✓ Service 06 Available
            </span>
          </Link>

          <Link
            href="/learning"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Academic Resource Bank</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Open student repository of past exams, lecture notes, and lab manuals across Agriculture, Computing, and Health Sciences.
              </p>
            </div>
            <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded w-fit">
              ✓ Service 07 Available
            </span>
          </Link>

          <Link
            href="/bookings"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Local Services & Appointments</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Schedule thesis hardcover binding at Afras Stationery, laptop OS diagnostics at Campus Tech, grooming, and laundry.
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded w-fit">
              ✓ Service 09 Available
            </span>
          </Link>

          <Link
            href="/cart"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-3">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Pickup Cart & Telebirr Pay</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Counter pickup vs dorm handoff fulfillment, zero floating-point Birr calculations, and Telebirr USSD quick-dial code generation.
              </p>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded w-fit">
              ✓ Service 08 Active
            </span>
          </Link>

          <Link
            href="/merchant/dashboard"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold mb-3">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">Merchant & Admin Portal</h2>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Live audio kitchen queues, catalog stock toggles, merchant verification approvals, and student dispute moderation.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit">
              ✓ Service 10 Active
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
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Student Account
              </span>
              <div className="text-slate-600 font-mono">student@haramaya.edu.et</div>
              <div className="text-slate-400 mt-0.5">Password: password123</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Store className="w-4 h-4 text-amber-600" /> Merchant Account
              </span>
              <div className="text-slate-600 font-mono">merchant@haramayacafe.et</div>
              <div className="text-slate-400 mt-0.5">Password: password123</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin / Moderator
              </span>
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
