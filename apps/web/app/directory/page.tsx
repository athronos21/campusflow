'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  priceMinor: number;
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

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Fetch campuses
        const campusRes = await fetch('http://localhost:4000/api/v1/campuses');
        const campusData = await campusRes.json();
        setCampuses(campusData);

        const activeCampus = campusData[0]?.id || '';
        setSelectedCampus(activeCampus);

        // 2. Fetch businesses for primary campus
        if (activeCampus) {
          const bizRes = await fetch(`http://localhost:4000/api/v1/businesses?campusId=${activeCampus}`);
          const bizData = await bizRes.json();
          setBusinesses(bizData);
        }
      } catch (err) {
        console.error('Failed to load directory:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Pilot Directory · Haramaya University
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Campus Directory</h1>
          <p className="text-slate-600 mt-1">
            Discover verified campus cafeterias, stationery shops, and local services.
          </p>
        </div>

        {/* Campus Selector & Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {campuses.length > 0 && (
            <select
              value={selectedCampus}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedCampus(newId);
                fetch(`http://localhost:4000/api/v1/businesses?campusId=${newId}`)
                  .then((r) => r.json())
                  .then((d) => setBusinesses(d))
                  .catch((err) => console.error(err));
              }}
              className="px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium shadow-sm"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  🏛️ {c.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Search verified food, coffee, printing, stationery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
          />
        </div>

        {/* Business Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading verified campus shops...</div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-medium">No verified businesses match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBusinesses.map((b) => (
              <Card key={b.id} className="flex flex-col justify-between hover:border-indigo-300 transition shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-slate-900">{b.name}</h3>
                    <Badge variant="success">VERIFIED</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {b.description || 'Verified campus partner providing student meals and supplies.'}
                  </p>

                  {b.products && b.products.length > 0 && (
                    <div className="space-y-1 mb-4 pt-3 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Popular Items
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {b.products.map((p) => (
                          <span
                            key={p.id}
                            className="inline-block text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">📍 Main Campus · Student Lounge</span>
                  <Link
                    href={`/shop/${b.id}`}
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
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
