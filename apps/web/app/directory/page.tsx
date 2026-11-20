'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
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
  Search,
  CheckCircle2,
  ChevronRight,
  Store,
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
        const campusData = await apiClient<Campus[]>('/campuses');
        setCampuses(campusData);

        const activeCampus = campusData[0]?.id || '';
        setSelectedCampus(activeCampus);

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
      return (
        b.name.toLowerCase().includes('cafe') ||
        b.name.toLowerCase().includes('snack') ||
        b.name.toLowerCase().includes('food') ||
        b.name.toLowerCase().includes('restaurant')
      );
    }
    if (selectedCategory === 'stationery') {
      return (
        b.name.toLowerCase().includes('print') ||
        b.name.toLowerCase().includes('stationery') ||
        b.name.toLowerCase().includes('book')
      );
    }
    if (selectedCategory === 'tech') {
      return (
        b.name.toLowerCase().includes('tech') ||
        b.name.toLowerCase().includes('electronic') ||
        b.name.toLowerCase().includes('laptop') ||
        b.name.toLowerCase().includes('phone') ||
        b.name.toLowerCase().includes('repair')
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Campus Announcement Banner */}
        {announcements.length > 0 && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 shadow-xs">
            <Megaphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider h-5">
                  Campus Notice
                </Badge>
                <span className="text-xs text-slate-500">
                  {new Date(announcements[0].createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{announcements[0].title}</h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{announcements[0].body}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
              Haramaya University Pilot
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Campus Directory & Shops
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Verified campus cafeterias, printing centers, and stationery stores serving students and faculty.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {campuses.length > 0 && (
            <select
              value={selectedCampus}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-semibold bg-white text-slate-800 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search verified food, coffee, printing, stationery, books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-300 text-sm shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills & Quick Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-8 rounded-full text-xs font-bold"
          >
            All Merchants ({businesses.length})
          </Button>
          <Button
            variant={selectedCategory === 'food' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('food')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Coffee className="w-3.5 h-3.5" /> Food & Cafeteria
          </Button>
          <Button
            variant={selectedCategory === 'stationery' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('stationery')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Printing & Stationery
          </Button>
          <Button
            variant={selectedCategory === 'tech' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('tech')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Laptop className="w-3.5 h-3.5" /> Tech & Electronics
          </Button>

          <span className="text-slate-300 mx-1 hidden lg:inline">|</span>

          <Link href="/transport">
            <Badge variant="outline" className="hover:border-primary transition cursor-pointer flex items-center gap-1">
              <Bus className="w-3.5 h-3.5 text-amber-600" /> Shuttles
            </Badge>
          </Link>
          <Link href="/housing">
            <Badge variant="outline" className="hover:border-teal-500 transition cursor-pointer flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-teal-600" /> Housing
            </Badge>
          </Link>
          <Link href="/events">
            <Badge variant="outline" className="hover:border-purple-500 transition cursor-pointer flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> Events
            </Badge>
          </Link>
          <Link href="/learning">
            <Badge variant="outline" className="hover:border-sky-500 transition cursor-pointer flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Exams
            </Badge>
          </Link>
          <Link href="/bookings">
            <Badge variant="outline" className="hover:border-indigo-500 transition cursor-pointer flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" /> Bookings
            </Badge>
          </Link>
        </div>

        {/* Business Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 text-sm font-medium">
            Loading verified campus shops...
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <Card className="text-center py-16 p-6 border-slate-200">
            <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold text-sm">No verified businesses match your search filter.</p>
            <p className="text-slate-400 text-xs mt-1">Try another category or clear your search query.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBusinesses.map((b) => (
              <Card
                key={b.id}
                className="flex flex-col justify-between border-slate-200 hover:border-primary/50 hover:shadow-xs transition p-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{b.name}</h3>
                    <Badge variant="success" className="text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed font-normal">
                    {b.description || 'Verified campus partner providing student meals, beverages, and supplies.'}
                  </p>

                  {b.products && b.products.length > 0 && (
                    <div className="space-y-1 mb-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Popular Items
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {b.products.slice(0, 4).map((p) => (
                          <span
                            key={p.id}
                            className="inline-block text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
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
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Main Campus &bull; Bate
                  </span>
                  <Button size="sm" asChild className="h-8 text-xs font-bold">
                    <Link href={`/shop/${b.id}`} className="flex items-center gap-1">
                      View Menu & Order <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
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
