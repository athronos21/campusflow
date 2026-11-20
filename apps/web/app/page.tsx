'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  CreditCard,
  Building2,
  FileCode,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dining' | 'transport' | 'housing' | 'emergency'>('dining');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-12">
        {/* Top Campus Alert & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider text-[11px] text-slate-300">LIVE PILOT</span>
            <span className="text-slate-200">
              Haramaya University &bull; Main Campus (Bate) &bull; 2026/27 Academic Term
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-primary-300" /> 14:45 EAT
            </span>
            <Link
              href="/emergency"
              className="text-amber-400 font-bold hover:text-white flex items-center gap-1 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Clinic Hotline: 025-553-0112
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <header className="text-center space-y-6 pt-4 pb-2 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
            Every Campus Service.
            <br />
            <span className="text-primary">One Unified Platform.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Order fresh meals between lectures, reserve campus shuttle seats to Harar & Dire Dawa,
            discover verified student dorms in Bate, and download exam past papers.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-xl mx-auto relative mt-6">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "Special Foul", "Harar Shuttle", "Dorm in Bate", "SEng 3122"...'
                className="w-full pl-11 pr-24 h-12 rounded-xl bg-white border-slate-300 text-sm shadow-sm"
              />
              <Button
                size="sm"
                asChild
                className="absolute right-1.5 h-9 px-4 rounded-lg font-bold text-xs"
              >
                <Link href={`/directory?q=${encodeURIComponent(searchQuery)}`}>Search</Link>
              </Button>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Popular:</span>
              <Link href="/directory">
                <Badge variant="outline" className="hover:border-primary transition cursor-pointer">
                  Buna & Foul
                </Badge>
              </Link>
              <Link href="/transport">
                <Badge variant="outline" className="hover:border-amber-500 bg-amber-50/50 text-amber-800 transition cursor-pointer">
                  Harar Shuttle (15 ETB)
                </Badge>
              </Link>
              <Link href="/housing">
                <Badge variant="outline" className="hover:border-teal-500 bg-teal-50/50 text-teal-800 transition cursor-pointer">
                  Gate 2 Rooms
                </Badge>
              </Link>
              <Link href="/learning">
                <Badge variant="outline" className="hover:border-primary transition cursor-pointer">
                  Past Exams PDF
                </Badge>
              </Link>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Button size="lg" asChild className="font-bold text-sm h-11 px-6 shadow-sm">
              <Link href="/directory" className="flex items-center gap-2">
                Explore Campus Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="font-bold text-sm h-11 px-6 border-slate-300">
              <Link href="/transport" className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-600" /> Book Campus Bus
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild className="font-semibold text-sm h-11 px-5 text-slate-600">
              <a href="http://localhost:4000/api/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-500" /> API Docs
              </a>
            </Button>
          </div>
        </header>

        {/* Campus Operational Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4 border-slate-200">
            <div className="text-2xl font-black text-primary">12</div>
            <div className="text-xs font-bold text-slate-900 mt-1">Verified Cafeterias</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Live audio kitchen queue</div>
          </Card>
          <Card className="text-center p-4 border-slate-200">
            <div className="text-2xl font-black text-amber-600">18</div>
            <div className="text-xs font-bold text-slate-900 mt-1">Daily Bus Shuttles</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Campus &bull; Harar &bull; Dire Dawa</div>
          </Card>
          <Card className="text-center p-4 border-slate-200">
            <div className="text-2xl font-black text-teal-600">100%</div>
            <div className="text-xs font-bold text-slate-900 mt-1">Verified Landlords</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Water, power & WiFi audited</div>
          </Card>
          <Card className="text-center p-4 border-slate-200">
            <div className="text-2xl font-black text-emerald-600">0 ETB</div>
            <div className="text-xs font-bold text-slate-900 mt-1">Student Platform Fee</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Direct Telebirr settlement</div>
          </Card>
        </section>

        {/* Live Interactive "Today on Campus" Section */}
        <Card className="border-slate-200 overflow-hidden shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <CardTitle className="text-lg font-bold text-slate-900">Today on Campus</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Live schedules, kitchen prep status, and next departures
              </CardDescription>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold gap-1">
              <button
                onClick={() => setActiveTab('dining')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'dining' ? 'bg-white text-primary shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Food Specials
              </button>
              <button
                onClick={() => setActiveTab('transport')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'transport' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Next Shuttles
              </button>
              <button
                onClick={() => setActiveTab('housing')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'housing' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Available Rooms
              </button>
              <button
                onClick={() => setActiveTab('emergency')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'emergency' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Emergency & Clinic
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            {/* Tab 1: Food Specials */}
            {activeTab === 'dining' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex justify-between items-center hover:border-slate-300 transition">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Injera with Shiro & Salad</div>
                    <div className="text-[11px] text-slate-500">Haramaya Central Cafe &bull; 10 min prep</div>
                    <div className="text-xs font-black text-primary mt-1 font-mono">85.00 ETB</div>
                  </div>
                  <Button size="sm" asChild className="h-8 font-bold text-xs">
                    <Link href="/directory">Order</Link>
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex justify-between items-center hover:border-slate-300 transition">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Special Ful with Egg & Oil</div>
                    <div className="text-[11px] text-slate-500">Bate Green Cafe &bull; 8 min prep</div>
                    <div className="text-xs font-black text-primary mt-1 font-mono">65.00 ETB</div>
                  </div>
                  <Button size="sm" asChild className="h-8 font-bold text-xs">
                    <Link href="/directory">Order</Link>
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex justify-between items-center hover:border-slate-300 transition">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Harar Buna & Sambusa (2x)</div>
                    <div className="text-[11px] text-slate-500">Student Lounge &bull; Ready now</div>
                    <div className="text-xs font-black text-primary mt-1 font-mono">35.00 ETB</div>
                  </div>
                  <Button size="sm" asChild className="h-8 font-bold text-xs">
                    <Link href="/directory">Order</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 2: Next Shuttles */}
            {activeTab === 'transport' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex justify-between items-center">
                  <div>
                    <Badge variant="warning" className="text-[10px] uppercase font-bold">
                      Leaves in 12 mins
                    </Badge>
                    <div className="text-sm font-bold text-slate-900 mt-1">Main Gate 1 &rarr; Harar Health Campus</div>
                    <div className="text-xs text-slate-600">Toyota Coaster &bull; 6 seats remaining</div>
                    <div className="text-xs font-black text-amber-800 mt-1 font-mono">15.00 ETB / seat</div>
                  </div>
                  <Button size="sm" asChild className="h-8 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs">
                    <Link href="/transport">Pick Seat</Link>
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      Departs 16:00
                    </Badge>
                    <div className="text-sm font-bold text-slate-900 mt-1">Main Campus &rarr; Dire Dawa (Meskel Sq)</div>
                    <div className="text-xs text-slate-600">Minibus &bull; 11 seats remaining</div>
                    <div className="text-xs font-black text-slate-900 mt-1 font-mono">45.00 ETB / seat</div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="h-8 font-bold text-xs border-slate-300">
                    <Link href="/transport">Pick Seat</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 3: Available Rooms */}
            {activeTab === 'housing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex justify-between items-center">
                  <div>
                    <Badge variant="success" className="text-[10px] uppercase font-bold">
                      450m from Gate 2
                    </Badge>
                    <div className="text-sm font-bold text-slate-900 mt-1">Single Dorm Room (Concrete Floor)</div>
                    <div className="text-xs text-slate-600">Water Tank Reserve &bull; Backup Generator &bull; Private Key</div>
                    <div className="text-xs font-black text-teal-800 mt-1 font-mono">1,400 ETB / month</div>
                  </div>
                  <Button size="sm" asChild className="h-8 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs">
                    <Link href="/housing">View Room</Link>
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      Bate Town Center
                    </Badge>
                    <div className="text-sm font-bold text-slate-900 mt-1">Shared 2-Person Room (Near Market)</div>
                    <div className="text-xs text-slate-600">High-speed WiFi included &bull; Shared Kitchen</div>
                    <div className="text-xs font-black text-slate-900 mt-1 font-mono">950 ETB / month</div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="h-8 font-bold text-xs border-slate-300">
                    <Link href="/housing">View Room</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 4: Emergency & Clinic */}
            {activeTab === 'emergency' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-rose-600" /> University Clinic
                  </div>
                  <div className="text-base font-black text-rose-700 mt-1 font-mono">025-553-0112</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">24/7 Outpatient & Ambulance</div>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" /> Campus Security Dispatch
                  </div>
                  <div className="text-base font-black text-rose-700 mt-1 font-mono">025-553-0333</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Main Gate & Dorm Block Patrol</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-600" /> Bate Police Sub-Station
                  </div>
                  <div className="text-base font-black text-slate-900 mt-1 font-mono">025-553-0991</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Off-Campus Student Security</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 8 Core Services Directory */}
        <section id="explore" className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Campus Services Directory</h2>
            <p className="text-xs text-slate-500">Verified services tailored for Haramaya University students & faculty</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Dining */}
            <Link href="/directory" className="group">
              <Card className="h-full border-slate-200 hover:border-primary/50 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Cafeteria & Food Orders</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Pre-order fresh Buna, Ful, and cafeteria meals between lectures with audio alerts.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-primary">15-min pickup guarantee</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition" />
                </div>
              </Card>
            </Link>

            {/* 2. Transport */}
            <Link href="/transport" className="group">
              <Card className="h-full border-slate-200 hover:border-amber-400/60 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Bus className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Campus Shuttles</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Daily buses to Harar & Dire Dawa with interactive seat selection and digital boarding passes.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-amber-800">Harar Shuttle &bull; 15 ETB</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-800 transition" />
                </div>
              </Card>
            </Link>

            {/* 3. Housing */}
            <Link href="/housing" className="group">
              <Card className="h-full border-slate-200 hover:border-teal-400/60 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Home className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Student Housing</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Verified off-campus dorms in Bate & Gate 1. Audited water tanks, power, and WiFi.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-teal-800">Verified Landlords</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-800 transition" />
                </div>
              </Card>
            </Link>

            {/* 4. Events */}
            <Link href="/events" className="group">
              <Card className="h-full border-slate-200 hover:border-purple-400/60 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Events & Passes</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Haramaya Hackathons, conferences, and student society meetups with instant QR passes.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-purple-800">Free Digital Pass</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-800 transition" />
                </div>
              </Card>
            </Link>

            {/* 5. Academic Vault */}
            <Link href="/learning" className="group">
              <Card className="h-full border-slate-200 hover:border-sky-400/60 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Academic Vault</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Repository of lecture slides, final exam papers, and laboratory manuals across departments.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-sky-800">1,280+ Free PDFs</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-800 transition" />
                </div>
              </Card>
            </Link>

            {/* 6. Campus Services & Printing */}
            <Link href="/bookings" className="group">
              <Card className="h-full border-slate-200 hover:border-indigo-400/60 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Printing & Repairs</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Hardcover thesis binding at Afras Stationery, laptop OS repairs, and barbershop bookings.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-indigo-800">Same-Day Binding</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-800 transition" />
                </div>
              </Card>
            </Link>

            {/* 7. Cart & Telebirr */}
            <Link href="/cart" className="group">
              <Card className="h-full border-slate-200 hover:border-rose-400/60 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Telebirr & CBE Birr</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Quick-dial USSD and QR payments stored in integer Ethiopian Birr minor units with zero rounding loss.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-rose-800">Zero Cents Loss</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-800 transition" />
                </div>
              </Card>
            </Link>

            {/* 8. Merchant Portal */}
            <Link href="/merchant/dashboard" className="group">
              <Card className="h-full border-slate-200 hover:border-slate-400 hover:shadow-sm transition p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Merchant Suite</h3>
                  <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                    Kitchen audio queue, live catalog stock toggling, and real-time order status tracking.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-800">Kitchen Display</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Digital Student ID Spotlight */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-3 max-w-xl">
            <Badge variant="secondary" className="bg-slate-800 text-slate-200 border-slate-700 text-[11px] font-bold">
              <QrCode className="w-3.5 h-3.5 mr-1 text-primary-300" /> Mobile Companion Feature
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Dynamic Digital Student ID Pass</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Never get locked out of the campus gate or library. The CampusFlow mobile app generates a dynamic,
              rotating QR code pass that works completely offline with zero mobile data required.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">&check; 30-sec Rotating Security Ring</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">&check; Offline Library Barcode</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4 shrink-0 shadow-sm">
            <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-950" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-white text-sm">Abebe Bekele</div>
              <div className="text-slate-400 font-mono text-[11px]">UGR/24910/16</div>
              <div className="text-slate-300 text-[11px]">Software Engineering &bull; Yr 3</div>
              <div className="inline-block mt-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                ACTIVE PASS
              </div>
            </div>
          </div>
        </section>

        {/* Sandbox Seeded Accounts */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Ready-to-Test Seeded Accounts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Test the platform locally across different campus roles
              </CardDescription>
            </div>
            <span className="text-xs text-slate-500">
              Universal password: <strong className="text-slate-900 font-mono">password123</strong>
            </span>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="w-4 h-4 text-primary" /> Student Account
              </span>
              <div className="text-slate-700 font-mono font-medium">student@haramaya.edu.et</div>
              <div className="text-slate-500 text-[11px] mt-1">Order food, book shuttles, view housing & exams</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Store className="w-4 h-4 text-amber-700" /> Merchant Account
              </span>
              <div className="text-slate-700 font-mono font-medium">merchant@haramayacafe.et</div>
              <div className="text-slate-500 text-[11px] mt-1">Manage kitchen queue, menu stock & pickup codes</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> Admin / Moderator
              </span>
              <div className="text-slate-700 font-mono font-medium">admin@campusflow.et</div>
              <div className="text-slate-500 text-[11px] mt-1">Verify business licenses, routes & dispute moderation</div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
