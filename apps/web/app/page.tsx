'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import {
  Bus,
  Coffee,
  Home,
  BookOpen,
  Store,
  GraduationCap,
  ShieldCheck,
  Search,
  PhoneCall,
  Clock,
  QrCode,
  CreditCard,
  Download,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'transport' | 'housing' | 'academic'>('all');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const copyCreds = (email: string) => {
    navigator.clipboard.writeText(`${email}\npassword123`);
    setCopiedAccount(email);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">

        {/* Top Operational Bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-800">Haramaya University</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-600">Main Campus (Bate) &bull; Academic Year 2026/27</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> 14:45 EAT
            </span>
            <span className="text-slate-300">|</span>
            <a
              href="tel:0255530112"
              className="text-rose-700 font-semibold hover:text-rose-800 flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Clinic Emergency: 025-553-0112
            </a>
          </div>
        </div>

        {/* Command & Quick Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, shuttle lines, study rooms, course exam papers, or professors..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
            />
            <Link
              href={`/directory?q=${encodeURIComponent(searchQuery)}`}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition"
            >
              Search
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Quick Views:</span>
            {[
              { id: 'all', label: 'All Campus Services' },
              { id: 'food', label: 'Food & Cafeterias' },
              { id: 'transport', label: 'Shuttles & Buses' },
              { id: 'housing', label: 'Dorm & Rooms' },
              { id: 'academic', label: 'Exam Papers Vault' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeCategory === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Stage (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Section 1: Live Shuttle Departures */}
            {(activeCategory === 'all' || activeCategory === 'transport') && (
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Bus className="w-4 h-4 text-amber-600" /> Live Shuttle Departures
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time gate departures with reserved seating and QR boarding passes</p>
                  </div>
                  <Link href="/transport" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    View All Routes <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Route 1 */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          Leaves in 12 min
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Toyota Coaster (Plate 3-48210)</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        Main Gate 1 &rarr; Harar Health Science Campus
                      </div>
                      <div className="text-xs text-slate-500">
                        6 seats open &bull; Est. travel time: 25 mins &bull; Drop-off at Jugol Gate
                      </div>
                    </div>
                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2">
                      <div className="text-sm font-bold text-slate-900">15.00 ETB</div>
                      <Link
                        href="/transport"
                        className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition"
                      >
                        Reserve Seat
                      </Link>
                    </div>
                  </div>

                  {/* Route 2 */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          Departs 16:00
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Minibus Express (Plate 3-19402)</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        Main Campus &rarr; Dire Dawa (Meskel Square)
                      </div>
                      <div className="text-xs text-slate-500">
                        11 seats open &bull; Direct expressway route &bull; Air conditioned
                      </div>
                    </div>
                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2">
                      <div className="text-sm font-bold text-slate-900">45.00 ETB</div>
                      <Link
                        href="/transport"
                        className="px-3.5 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
                      >
                        Reserve Seat
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Fast Food & Buna Pre-orders */}
            {(activeCategory === 'all' || activeCategory === 'food') && (
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-indigo-600" /> Cafeterias & Pre-Orders
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Skip counter lines with live preparation updates and pickup chime alerts</p>
                  </div>
                  <Link href="/directory" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    All Menus <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Dish 1 */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                          10 min prep
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900">85.00 ETB</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-2">Injera with Shiro & Salad</div>
                      <div className="text-xs text-slate-500 mt-0.5">Haramaya Central Cafeteria</div>
                    </div>
                    <Link
                      href="/directory"
                      className="w-full text-center py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition"
                    >
                      Order Meal
                    </Link>
                  </div>

                  {/* Dish 2 */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          8 min prep
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900">65.00 ETB</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-2">Special Ful with Egg & Oil</div>
                      <div className="text-xs text-slate-500 mt-0.5">Bate Green Cafe &bull; Fresh bread</div>
                    </div>
                    <Link
                      href="/directory"
                      className="w-full text-center py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition"
                    >
                      Order Meal
                    </Link>
                  </div>

                  {/* Dish 3 */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Ready Now
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900">35.00 ETB</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-2">Harar Buna & Sambusa (2x)</div>
                      <div className="text-xs text-slate-500 mt-0.5">Student Lounge &bull; Traditional brew</div>
                    </div>
                    <Link
                      href="/directory"
                      className="w-full text-center py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition"
                    >
                      Order Meal
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Section 3: Verified Student Housing */}
            {(activeCategory === 'all' || activeCategory === 'housing') && (
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Home className="w-4 h-4 text-teal-600" /> Verified Student Housing
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Audited off-campus rooms in Bate with verified water, power backup, and zero broker fees</p>
                  </div>
                  <Link href="/housing" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    All Listings <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Listing 1 */}
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded">
                        450m from Gate 2
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">1,400 ETB / mo</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Single Dorm Room (Concrete Floor)</div>
                      <div className="text-xs text-slate-600 mt-1">
                        Water Tank Reserve &bull; Backup Generator &bull; Private Key & Padlock
                      </div>
                    </div>
                    <Link
                      href="/housing"
                      className="block text-center py-1.5 bg-teal-600 text-white text-xs font-bold rounded hover:bg-teal-700 transition"
                    >
                      View Details & Landlord Contact
                    </Link>
                  </div>

                  {/* Listing 2 */}
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                        Bate Town Center
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">950 ETB / student</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Shared 2-Bed Room (Near Market)</div>
                      <div className="text-xs text-slate-600 mt-1">
                        High-speed WiFi included &bull; Shared Kitchen & Bathroom &bull; Gated compound
                      </div>
                    </div>
                    <Link
                      href="/housing"
                      className="block text-center py-1.5 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-900 transition"
                    >
                      View Details & Landlord Contact
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Section 4: Academic Vault (Past Papers & Notes) */}
            {(activeCategory === 'all' || activeCategory === 'academic') && (
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-700" /> Academic Resource Vault
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Open peer repository of past exam papers, lecture notes, and lab manuals</p>
                  </div>
                  <Link href="/learning" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Explore Repository <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <span className="font-mono font-bold text-slate-800">SEng 3122: Software Architecture</span>
                      <div className="text-slate-500 text-[11px] mt-0.5">Final Exam with Answer Key (2025/26) &bull; PDF (2.4 MB)</div>
                    </div>
                    <Link
                      href="/learning"
                      className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Link>
                  </div>

                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <span className="font-mono font-bold text-slate-800">Agri 2041: Soil Fertility & Crop Nutrition</span>
                      <div className="text-slate-500 text-[11px] mt-0.5">Midterm Review & Lab Exercise Sheets &bull; PDF (4.1 MB)</div>
                    </div>
                    <Link
                      href="/learning"
                      className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Link>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Utility Rail (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Card 1: Official Digital Student ID Pass */}
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-xs">
                    HU
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-none">Haramaya University</div>
                    <div className="text-[10px] text-slate-400">Digital Student Pass</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
                  VERIFIED
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-white text-sm">Abebe Bekele</div>
                  <div className="font-mono text-indigo-300 text-[11px]">UGR/24910/16</div>
                  <div className="text-slate-400 text-[11px]">Software Engineering &bull; Yr 3</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg flex items-center justify-between">
                <div className="w-12 h-12 flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <div className="font-bold text-slate-900">Dynamic Gate QR</div>
                  <div className="text-[10px] text-slate-500">Refreshes every 30s</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Offline Validated</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Validity: 30 Jul 2027</span>
                <span className="font-mono">Gate 1 &bull; Library Access</span>
              </div>
            </div>

            {/* Card 2: Campus Digital Wallet */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" /> Campus Wallet Balance
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  Telebirr Synced
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 font-mono">1,420.50 ETB</div>
                <div className="text-xs text-slate-500 mt-0.5">Zero student transaction fee</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <Link
                  href="/orders"
                  className="py-1.5 text-center font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  + Top Up
                </Link>
                <Link
                  href="/orders"
                  className="py-1.5 text-center font-semibold bg-slate-100 text-slate-800 rounded hover:bg-slate-200 transition"
                >
                  Statement
                </Link>
              </div>
            </div>

            {/* Card 3: Emergency & Campus Hotlines */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-3 text-xs">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-rose-600" /> Emergency Hotlines
              </div>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Campus Clinic (24/7):</span>
                  <a href="tel:0255530112" className="font-mono font-bold text-rose-700 hover:underline">
                    025-553-0112
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Patrol Dispatch:</span>
                  <a href="tel:0255530333" className="font-mono font-bold text-rose-700 hover:underline">
                    025-553-0333
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bate Police Sub-Station:</span>
                  <a href="tel:0255530991" className="font-mono font-bold text-slate-900 hover:underline">
                    025-553-0991
                  </a>
                </div>
              </div>
            </div>

            {/* Card 4: Pre-Seeded Pilot Credentials Switcher */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-600" /> Pilot Sandbox Credentials
                </div>
                <span className="text-[10px] text-slate-400">Click to Copy</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Student */}
                <button
                  onClick={() => copyCreds('student@haramaya.edu.et')}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Student
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">student@haramaya.edu.et</div>
                  </div>
                  {copiedAccount === 'student@haramaya.edu.et' ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">pass: password123</span>
                  )}
                </button>

                {/* Merchant */}
                <button
                  onClick={() => copyCreds('merchant@haramayacafe.et')}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-slate-50 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-amber-600" /> Merchant
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">merchant@haramayacafe.et</div>
                  </div>
                  {copiedAccount === 'merchant@haramayacafe.et' ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">pass: password123</span>
                  )}
                </button>

                {/* Admin */}
                <button
                  onClick={() => copyCreds('admin@campusflow.et')}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Admin / Moderator
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">admin@campusflow.et</div>
                  </div>
                  {copiedAccount === 'admin@campusflow.et' ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">pass: password123</span>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
