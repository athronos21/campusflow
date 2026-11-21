'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  LogOut,
  ArrowRight,
  CheckCircle2,
  LogIn,
  User,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'id' | 'wallet' | 'security'>('id');

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-100 font-sans">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Verifying student session...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Unauthenticated fallback state (while router redirect happens or if JS is disabled)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-100 font-sans">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900">Sign in to view your profile</h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please sign in with your student or campus account to access your digital ID, campus wallet, and orders.
            </p>
          </div>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
            >
              <LogIn className="w-4 h-4" /> Sign In Now
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = user.displayName;
  const email = user.email || 'student@haramaya.edu.et';
  const role = user.roles?.[0]
    ? user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)
    : 'Student';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Breadcrumb / Top Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Student Profile</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-slate-700">Account Active &bull; Academic Term 2026/27</span>
          </div>
        </div>

        {/* Profile Hero Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-white font-black text-2xl shadow-sm shrink-0">
                {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{displayName}</h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {role}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-300 font-medium">
                  Faculty of Computing &bull; Department of Software Engineering &bull; Year 3
                </div>
                <div className="text-xs text-indigo-300 font-mono font-bold flex items-center gap-3 pt-0.5">
                  <span>Student ID: UGR/24910/16</span>
                  <span>&bull;</span>
                  <span>Haramaya Main Campus (Bate)</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>

          {/* Quick Snapshot Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs text-slate-400">Campus Wallet</div>
              <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono mt-0.5">1,420.50 ETB</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs text-slate-400">Past Orders</div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">4 Completed</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs text-slate-400">Cumulative GPA</div>
              <div className="text-base sm:text-lg font-bold text-indigo-300 font-mono mt-0.5">3.85 / 4.00</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Profile Details */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('id')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'id'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" /> Digital Student ID Card
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Telebirr & Wallet
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Security & Privacy
          </button>
        </div>

        {/* TAB 1: Digital ID Card Presentation */}
        {activeTab === 'id' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 cols: Card Facsimile */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Official Campus Gate Pass</h2>
                  <p className="text-xs text-slate-500">Valid for Main Gate 1, Dorm Blocks & Library Access</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VALID PASS
                </span>
              </div>

              {/* Physical Card Mockup */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white space-y-4 border border-indigo-900 shadow-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                      HU
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white">Haramaya University</div>
                      <div className="text-[10px] text-indigo-300">Office of the Registrar &bull; Student Pass</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-white/20 flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <GraduationCap className="w-8 h-8 text-indigo-400" />
                    <span className="text-[9px] font-bold mt-1 text-slate-300">PHOTO ID</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-base font-black text-white">{displayName}</div>
                    <div className="text-indigo-200 font-mono text-xs font-bold">ID: UGR/24910/16</div>
                    <div className="text-slate-300 text-[11px]">Software Engineering &bull; Year 3</div>
                    <div className="text-slate-400 text-[10px]">Campus: Main Campus (Bate)</div>
                    <div className="text-indigo-300 text-[10px] font-mono pt-1">Issued: 15 Oct 2024 &bull; Expires: 30 Jul 2027</div>
                  </div>
                </div>

                {/* Rotating QR & Barcode Section */}
                <div className="bg-white p-3 rounded-xl flex items-center justify-between text-slate-900">
                  <div className="w-16 h-16 bg-slate-50 p-1 border border-slate-200 rounded-lg flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center justify-end gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Dynamic Security QR
                    </div>
                    <div className="text-[10px] text-slate-500">Auto-regenerates every 30 seconds</div>
                    <div className="text-[11px] font-mono font-bold text-indigo-700">CODE: HU-8921-2026</div>
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Offline Validated via Gate Scanners
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 5 cols: Info & Mobile App Hint */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Digital ID Privileges</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Access to Main Gate 1, Gate 2 & Harar Health Campus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Central Library turnstile scanning & book borrowing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Subsidized student dining hall access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Campus shuttle boarding pass validation</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-bold text-indigo-900">Mobile Companion App</div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Open the CampusFlow mobile app on your phone to display your dynamic security pass without requiring internet or cellular airtime.
                </p>
                <div className="pt-1">
                  <Link
                    href="/emergency"
                    className="text-xs font-bold text-indigo-800 hover:underline flex items-center gap-1"
                  >
                    View Emergency Hotlines <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Telebirr & Wallet */}
        {activeTab === 'wallet' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Digital Wallet & Payments</h2>
                <p className="text-xs text-slate-500">Stored in zero-loss integer Ethiopian Birr minor units (cents)</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                Telebirr &bull; CBE Birr Integrated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500">Available Balance</span>
                <div className="text-2xl font-black text-slate-900 font-mono">1,420.50 ETB</div>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready for cafeteria & bus checkout
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500">Linked Payment Method</span>
                <div className="text-base font-bold text-slate-900">Telebirr Mobile Money</div>
                <span className="text-xs font-mono text-slate-500">+251 91 **** 4567</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
                <span className="text-xs text-slate-500">Quick Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/orders"
                    className="py-1.5 text-center bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    + Top Up
                  </Link>
                  <Link
                    href="/orders"
                    className="py-1.5 text-center bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-100 transition"
                  >
                    Statements
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Wallet Transactions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Wallet Activity</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      &darr;
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Top-Up via Telebirr</div>
                      <div className="text-slate-400 text-[11px]">20 Nov 2026 &bull; Ref: TXN-HU-20419</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">+500.00 ETB</span>
                </div>

                <div className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      &uarr;
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Haramaya Central Cafeteria</div>
                      <div className="text-slate-400 text-[11px]">Injera with Shiro &bull; Order #1042</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">-85.00 ETB</span>
                </div>

                <div className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      &uarr;
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Gate 1 Shuttle to Harar</div>
                      <div className="text-slate-400 text-[11px]">Seat 2A &bull; Boarding Pass #SH-882</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">-15.00 ETB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Security & Privacy */}
        {activeTab === 'security' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Account Details & Compliance</h2>
                <p className="text-xs text-slate-500">Compliant with Ethiopian Personal Data Protection Proclamation No. 1321/2024</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Proclamation Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" /> University Email
                </span>
                <div className="font-mono font-bold text-slate-900">{email}</div>
                <span className="text-[11px] text-slate-500">Verified institutional domain (@haramaya.edu.et)</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" /> Mobile Number
                </span>
                <div className="font-mono font-bold text-slate-900">+251 91 123 4567</div>
                <span className="text-[11px] text-slate-500">Linked to Telebirr direct checkout</span>
              </div>
            </div>

            {/* Privacy Proclamation Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-600" /> Student Data Governance Notice
              </div>
              <p className="text-slate-600 leading-relaxed">
                CampusFlow adheres strictly to Proclamation No. 1321/2024. Your academic ID, orders, and payment records are maintained solely for university service delivery. Banking credentials are never stored locally. You have the right to request data review or account termination at any time through the campus administration.
              </p>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
