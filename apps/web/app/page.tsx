'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import {
  Bus,
  Coffee,
  Home,
  Calendar,
  BookOpen,
  CalendarCheck,
  Store,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Search,
  PhoneCall,
  Clock,
  QrCode,
  Sparkles,
  CreditCard,
  Building2,
  FileCode,
} from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dining' | 'transport' | 'housing' | 'emergency'>('dining');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-12">
        
        {/* Top Campus Alert & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-900 text-white px-4 py-2.5 rounded-xl text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-wide">LIVE PILOT:</span>
            <span className="text-indigo-200">Haramaya University · Main Campus (Bate) · 2026/27 Academic Term</span>
          </div>
          <div className="flex items-center gap-4 text-indigo-200">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> 14:45 EAT
            </span>
            <Link href="/emergency" className="text-amber-300 font-semibold hover:text-white flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Emergency Hotline: 025-553-0112
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative text-center space-y-6 pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Unified Digital Campus Ecosystem for Ethiopian Higher Education
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Every Campus Service.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
              One Unified Super-App.
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Order fresh meals between lectures, reserve campus shuttle seats, search verified dorms in Bate, access past exams, and pay securely via Telebirr.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-xl mx-auto relative mt-4">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "Special Foul", "Harar Shuttle", "Dorm in Bate", "SEng 3122"...'
                className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-white border border-slate-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <Link
                href={`/directory?q=${encodeURIComponent(searchQuery)}`}
                className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
              >
                Search
              </Link>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-600">
              <span className="text-slate-400 font-semibold">Popular:</span>
              <Link href="/directory" className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 transition font-medium">
                Buna & Foul
              </Link>
              <Link href="/transport" className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 transition font-medium text-amber-800 bg-amber-50/50">
                Harar Shuttle (15 ETB)
              </Link>
              <Link href="/housing" className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-400 transition font-medium text-teal-800 bg-teal-50/50">
                Gate 2 Rooms
              </Link>
              <Link href="/learning" className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 transition font-medium">
                Past Exams PDF
              </Link>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/directory"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-sm text-sm inline-flex items-center gap-2"
            >
              Explore Campus Directory <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/transport"
              className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition text-sm flex items-center gap-2 shadow-xs"
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

        {/* Live Operational Metrics Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
            <div className="text-2xl font-black text-indigo-600">12</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">Verified Cafeterias</div>
            <div className="text-[11px] text-slate-500">Live kitchen audio queues</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
            <div className="text-2xl font-black text-amber-600">18</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">Daily Shuttles</div>
            <div className="text-[11px] text-slate-500">Main Campus &bull; Harar &bull; Dire Dawa</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
            <div className="text-2xl font-black text-teal-600">100%</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">Verified Landlords</div>
            <div className="text-[11px] text-slate-500">Water, power & WiFi audited</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
            <div className="text-2xl font-black text-emerald-600">0 ETB</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">Student Transfer Fee</div>
            <div className="text-[11px] text-slate-500">Instant Telebirr & CBE settlement</div>
          </div>
        </section>

        {/* Live Interactive "Today at Haramaya" Tabbed Preview */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 className="text-lg font-bold text-slate-900">Today on Campus</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Live schedules, kitchen availability, and departures</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dining')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'dining' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Food Specials
              </button>
              <button
                onClick={() => setActiveTab('transport')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'transport' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Next Shuttles
              </button>
              <button
                onClick={() => setActiveTab('housing')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'housing' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Available Rooms
              </button>
              <button
                onClick={() => setActiveTab('emergency')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'emergency' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Safety & Clinic
              </button>
            </div>
          </div>

          {/* Tab 1: Food Specials */}
          {activeTab === 'dining' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-800">Injera with Shiro & Salad</div>
                  <div className="text-[11px] text-slate-500">Haramaya Central Cafe &bull; 10 min prep</div>
                  <div className="text-xs font-black text-indigo-600 mt-1">85.00 ETB</div>
                </div>
                <Link href="/directory" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition">
                  Order
                </Link>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-800">Special Ful with Egg & Oil</div>
                  <div className="text-[11px] text-slate-500">Bate Green Cafe &bull; 8 min prep</div>
                  <div className="text-xs font-black text-indigo-600 mt-1">65.00 ETB</div>
                </div>
                <Link href="/directory" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition">
                  Order
                </Link>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-800">Harar Buna & Sambusa (2x)</div>
                  <div className="text-[11px] text-slate-500">Student Lounge &bull; Ready now</div>
                  <div className="text-xs font-black text-indigo-600 mt-1">35.00 ETB</div>
                </div>
                <Link href="/directory" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition">
                  Order
                </Link>
              </div>
            </div>
          )}

          {/* Tab 2: Next Shuttles */}
          {activeTab === 'transport' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Leaves in 12 mins
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1">Main Gate 1 &rarr; Harar Health Campus</div>
                  <div className="text-xs text-slate-600">Toyota Coaster &bull; 6 seats remaining</div>
                  <div className="text-xs font-black text-amber-700 mt-1">15.00 ETB / seat</div>
                </div>
                <Link href="/transport" className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition">
                  Pick Seat
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    Departs 16:00
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1">Main Campus &rarr; Dire Dawa (Meskel Sq)</div>
                  <div className="text-xs text-slate-600">Minibus &bull; 11 seats remaining</div>
                  <div className="text-xs font-black text-slate-800 mt-1">45.00 ETB / seat</div>
                </div>
                <Link href="/transport" className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition">
                  Pick Seat
                </Link>
              </div>
            </div>
          )}

          {/* Tab 3: Available Rooms */}
          {activeTab === 'housing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-teal-200 text-teal-900 px-2 py-0.5 rounded">
                    450m from Gate 2
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1">Single Dorm Room with Concrete Floor</div>
                  <div className="text-xs text-slate-600">Water Tank Reserve &bull; Backup Generator &bull; Private Key</div>
                  <div className="text-xs font-black text-teal-800 mt-1">1,400 ETB / month</div>
                </div>
                <Link href="/housing" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition">
                  View Room
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    Bate Town Center
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1">Shared 2-Person Room (Near Market)</div>
                  <div className="text-xs text-slate-600">High-speed WiFi included &bull; Shared Kitchen</div>
                  <div className="text-xs font-black text-slate-800 mt-1">950 ETB / student / mo</div>
                </div>
                <Link href="/housing" className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition">
                  View Room
                </Link>
              </div>
            </div>
          )}

          {/* Tab 4: Emergency & Safety */}
          {activeTab === 'emergency' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50">
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-rose-600" /> University Clinic
                </div>
                <div className="text-sm font-black text-rose-700 mt-1 font-mono">025-553-0112</div>
                <div className="text-[11px] text-slate-600 mt-0.5">24/7 Outpatient & Ambulance</div>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50">
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" /> Campus Security Dispatch
                </div>
                <div className="text-sm font-black text-rose-700 mt-1 font-mono">025-553-0333</div>
                <div className="text-[11px] text-slate-600 mt-0.5">Main Gate & Dorm Block Patrol</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-600" /> Bate Police Sub-Station
                </div>
                <div className="text-sm font-black text-slate-900 mt-1 font-mono">025-553-0991</div>
                <div className="text-[11px] text-slate-600 mt-0.5">Off-Campus Student Security</div>
              </div>
            </div>
          )}
        </section>

        {/* Feature Grids - All 8 Core Services with Rich Badges */}
        <section id="explore">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Campus Services Directory</h2>
            <p className="text-xs text-slate-500">Direct access to verified services tailored for university students & faculty</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Dining */}
            <Link
              href="/directory"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <Coffee className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Cafeteria & Food Orders</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Skip the long line. Order fresh Buna, Ful, and lunch dishes with audio pickup alerts.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  15-min pickup guarantee
                </span>
                <span className="text-slate-400 font-bold group-hover:text-indigo-600">&rarr;</span>
              </div>
            </Link>

            {/* 2. Transport */}
            <Link
              href="/transport"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <Bus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Campus Shuttle & Tickets</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Daily shuttles to Harar & Dire Dawa with live seat picker and offline QR boarding pass.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Live Seat Map &bull; 15 ETB
                </span>
                <span className="text-slate-400 font-bold group-hover:text-amber-700">&rarr;</span>
              </div>
            </Link>

            {/* 3. Housing */}
            <Link
              href="/housing"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <Home className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Student Housing & Dorms</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Verified off-campus rooms in Bate & Gate 1. Audited water tanks, backup generators, and WiFi.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  Verified Landlords &bull; No Broker Fees
                </span>
                <span className="text-slate-400 font-bold group-hover:text-teal-700">&rarr;</span>
              </div>
            </Link>

            {/* 4. Events */}
            <Link
              href="/events"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-violet-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Campus Events & Passes</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Haramaya Hackathon 2026, tech conferences, guest lectures, and student society meetups.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-violet-800 bg-violet-50 px-2 py-0.5 rounded">
                  Digital QR Ticket &bull; Free RSVP
                </span>
                <span className="text-slate-400 font-bold group-hover:text-violet-700">&rarr;</span>
              </div>
            </Link>

            {/* 5. Academic */}
            <Link
              href="/learning"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Academic Vault</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Community-curated repository of past exam papers, lecture summaries, and lab guides.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                  1,280+ PDFs &bull; Free Downloads
                </span>
                <span className="text-slate-400 font-bold group-hover:text-cyan-700">&rarr;</span>
              </div>
            </Link>

            {/* 6. Appointments */}
            <Link
              href="/bookings"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Campus Tech & Binding</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Book hardcover thesis binding at Afras Stationery, laptop OS diagnostics, and study cubicles.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                  Afras Stationery &bull; Same-Day
                </span>
                <span className="text-slate-400 font-bold group-hover:text-purple-700">&rarr;</span>
              </div>
            </Link>

            {/* 7. Cart & Telebirr */}
            <Link
              href="/cart"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Digital Wallet & Pay</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Counter pickup vs dorm handoff fulfillment with instant Telebirr & CBE Birr quick-dial settlement.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                  Telebirr &bull; Zero Cents Loss
                </span>
                <span className="text-slate-400 font-bold group-hover:text-rose-700">&rarr;</span>
              </div>
            </Link>

            {/* 8. Merchant Portal */}
            <Link
              href="/merchant/dashboard"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Merchant & Admin Suite</h3>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Kitchen queue management, stock toggles, vendor verification approvals, and dispute moderation.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  Live Kitchen Display System
                </span>
                <span className="text-slate-400 font-bold group-hover:text-slate-900">&rarr;</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Digital Student ID Spotlight Card */}
        <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <QrCode className="w-3.5 h-3.5" /> Mobile Companion Feature
            </span>
            <h2 className="text-xl md:text-2xl font-black">Dynamic Digital Student ID Pass</h2>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Never get locked out of the campus gate or library. The CampusFlow mobile app generates a dynamic, rotating QR code pass that works completely offline with zero mobile data required.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-indigo-100">
              <span className="flex items-center gap-1">&check; 30-sec Rotating Security Ring</span>
              <span className="flex items-center gap-1">&check; Offline Library Barcode</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center">
              <QrCode className="w-full h-full text-indigo-950" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-white">Abebe Bekele</div>
              <div className="text-indigo-200 font-mono text-[11px]">UGR/24910/16</div>
              <div className="text-indigo-300 text-[10px]">Software Engineering &bull; Yr 3</div>
              <div className="inline-block mt-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-400/30">
                ACTIVE PASS
              </div>
            </div>
          </div>
        </section>

        {/* Quick Demo Credentials Card */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Pilot Sandbox Credentials
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-1">Ready-to-Test Seeded Accounts</h3>
            </div>
            <span className="text-xs text-slate-400">All accounts use password: <strong className="text-slate-700 font-mono">password123</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Student Account
              </span>
              <div className="text-slate-600 font-mono font-medium">student@haramaya.edu.et</div>
              <div className="text-slate-400 text-[11px] mt-1">Order food, book shuttles, view housing & exams</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-amber-300 transition">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <Store className="w-4 h-4 text-amber-600" /> Merchant Account
              </span>
              <div className="text-slate-600 font-mono font-medium">merchant@haramayacafe.et</div>
              <div className="text-slate-400 text-[11px] mt-1">Manage kitchen queue, menu stock & pickup codes</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin / Moderator
              </span>
              <div className="text-slate-600 font-mono font-medium">admin@campusflow.et</div>
              <div className="text-slate-400 text-[11px] mt-1">Verify business licenses, routes & dispute moderation</div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
