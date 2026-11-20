import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Bus, Utensils, Home, Calendar, BookOpen, Wrench, Store, ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-xs text-slate-500 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="font-black text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                C
              </span>
              <span>
                Campus<span className="text-indigo-600">Flow</span>
              </span>
            </Link>
            <p className="text-slate-600 leading-relaxed text-xs">
              Unified digital campus super-app piloted at Haramaya University Main Campus (Bate).
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 font-semibold w-fit">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Proclamation No. 1321/2024 Compliant</span>
            </div>
          </div>

          {/* Student Services */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Campus Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/directory" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-slate-400" />
                  <span>Food & Cafeterias</span>
                </Link>
              </li>
              <li>
                <Link href="/transport" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bus Shuttles & Coach</span>
                </Link>
              </li>
              <li>
                <Link href="/housing" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dorm Housing & Rooms</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Campus Events & RSVP</span>
                </Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Past Papers & Notes</span>
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print & Repair Appointments</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Merchant & Operator Portals */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Merchants & Partners</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/merchant/dashboard" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>Merchant Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/merchant/orders" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <span>Live Kitchen Order Queue</span>
                </Link>
              </li>
              <li>
                <Link href="/merchant/menu" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <span>Menu & Catalog Toggles</span>
                </Link>
              </li>
              <li>
                <Link href="/merchant/register" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                  <span>Register Campus Shop</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/verifications" className="hover:text-rose-600 transition flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Campus Moderator Panel</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Financial & Trust Pillars */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Financial Standards</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              All transactions are settled directly via Telebirr or CBE Birr with zero floating-point rounding errors (stored strictly in integer minor units).
            </p>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div><strong>Pilot Campus:</strong> Haramaya University</div>
              <div><strong>Locations:</strong> Bate Town, Harar, Dire Dawa</div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} CampusFlow. Built for Ethiopian Higher Education.</p>
          <div className="flex gap-4">
            <span>Data Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Haramaya IT Administration</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
