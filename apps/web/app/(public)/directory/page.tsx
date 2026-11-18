import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DirectoryPage() {
  const sampleBusinesses = [
    {
      id: '1',
      name: 'Haramaya Campus Cafe & Snack',
      category: 'Food & Drinks',
      location: 'Near Student Lounge',
      status: 'verified',
    },
    {
      id: '2',
      name: 'Eagle Tech & Fast Print',
      category: 'Printing & Stationery',
      location: 'Main Gate Building B',
      status: 'verified',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Campus Directory</h1>
          <p className="text-slate-600 mt-1">Verified campus businesses, cafeterias, and services at Haramaya University.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleBusinesses.map((b) => (
            <Card key={b.id} className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-900">{b.name}</h3>
                  <Badge variant="success">VERIFIED</Badge>
                </div>
                <p className="text-sm text-slate-500">{b.category} · {b.location}</p>
              </div>
              <Link
                href={`/orders?businessId=${b.id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                View Menu
              </Link>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
