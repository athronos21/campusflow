'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  Megaphone,
  Coffee,
  Printer,
  Laptop,
  Bus,
  Home,
  Calendar,
  BookOpen,
  CalendarCheck,
  MapPin,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  priceMinor: number | string;
}

interface Business {
  id: string;
  campusId: string;
  name: string;
  description: string | null;
  status: string;
  products: Product[];
}

interface Campus {
  id: string;
  name: string;
  slug: string;
  city: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Fetch campuses
        const campusData = await apiClient<Campus[]>('/campuses');
        setCampuses(campusData);

        const activeCampus = campusData[0]?.id || '';
        setSelectedCampus(activeCampus);

        // 2. Fetch businesses & announcements for primary campus
        if (activeCampus) {
          const [bizData, annData] = await Promise.all([
            apiClient<Business[]>(`/businesses?campusId=${activeCampus}`),
            apiClient<Announcement[]>(`/announcements?campusId=${activeCampus}`).catch(() => []),
          ]);
          setBusinesses(bizData);
          setAnnouncements(annData);
        }
      } catch (err) {
        console.error('Failed to load directory:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCampusChange = async (campusId: string) => {
    setSelectedCampus(campusId);
    try {
      setIsLoading(true);
      const [bizData, annData] = await Promise.all([
        apiClient<Business[]>(`/businesses?campusId=${campusId}`),
        apiClient<Announcement[]>(`/announcements?campusId=${campusId}`).catch(() => []),
      ]);
      setBusinesses(bizData);
      setAnnouncements(annData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase())) ||
      (b.products && b.products.some((p) => p.name.toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;

    if (selectedCategory === 'food') {
      return b.name.toLowerCase().includes('cafe') || b.name.toLowerCase().includes('snack') || b.name.toLowerCase().includes('food') || b.name.toLowerCase().includes('restaurant');
    }
    if (selectedCategory === 'stationery') {
      return b.name.toLowerCase().includes('print') || b.name.toLowerCase().includes('stationery') || b.name.toLowerCase().includes('book');
    }
    if (selectedCategory === 'tech') {
      return b.name.toLowerCase().includes('tech') || b.name.toLowerCase().includes('electronic') || b.name.toLowerCase().includes('laptop') || b.name.toLowerCase().includes('phone') || b.name.toLowerCase().includes('repair');
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Campus Announcement Banner */}
        {announcements.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 shadow-sm">
            <Megaphone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Campus Notice
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(announcements[0].createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{announcements[0].title}</h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{announcements[0].body}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Pilot Directory · Haramaya University
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Campus Directory</h1>
          <p className="text-slate-600 mt-1">
            Discover verified campus cafeterias, stationery shops, bus shuttles, and student services.
          </p>
        </div>

        {/* Campus Selector & Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {campuses.length > 0 && (
            <select
              value={selectedCampus}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium shadow-sm"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Search verified food, coffee, printing, stationery, books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
          />
        </div>

        {/* Category Pills & Quick Shortcuts */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Merchants ({businesses.length})
          </button>
          <button
            onClick={() => setSelectedCategory('food')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === 'food'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" /> Food & Cafeteria
          </button>
          <button
            onClick={() => setSelectedCategory('stationery')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === 'stationery'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> Printing & Stationery
          </button>
          <button
            onClick={() => setSelectedCategory('tech')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === 'tech'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" /> Tech & Electronics
          </button>
          <Link
            href="/transport"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition inline-flex items-center gap-1.5"
          >
            <Bus className="w-3.5 h-3.5" /> Bus Shuttles →
          </Link>
          <Link
            href="/housing"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition inline-flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" /> Off-Campus Housing →
          </Link>
          <Link
            href="/events"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition inline-flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" /> Events & Passes →
          </Link>
          <Link
            href="/learning"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" /> Academic Bank →
          </Link>
          <Link
            href="/bookings"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition inline-flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5" /> Appointments →
          </Link>
        </div>

        {/* Business Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 font-medium">Loading verified campus shops...</div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-medium">No verified businesses match your search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBusinesses.map((b) => (
              <Card key={b.id} className="flex flex-col justify-between hover:border-indigo-300 transition shadow-sm p-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-slate-900">{b.name}</h3>
                    <Badge variant="success">✓ VERIFIED</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {b.description || 'Verified campus partner providing student meals, beverages, and supplies.'}
                  </p>

                  {b.products && b.products.length > 0 && (
                    <div className="space-y-1 mb-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Popular Menu Items
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {b.products.map((p) => (
                          <span
                            key={p.id}
                            className="inline-block text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Main Campus · Student Lounge
                  </span>
                  <Link
                    href={`/shop/${b.id}`}
                    className="text-xs font-bold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    View Menu & Order →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
