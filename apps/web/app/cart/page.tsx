'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatETB } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Your Pickup Cart</h1>

        <Card className="space-y-4 mb-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-semibold text-slate-900">Special Buna (Coffee)</h4>
              <span className="text-xs text-slate-500">Qty: 2 • Fresh Brewed</span>
            </div>
            <span className="font-medium text-slate-900">{formatETB(5000)}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-semibold text-slate-900">Ful with Egg and Bread</h4>
              <span className="text-xs text-slate-500">Qty: 1 • Student Special</span>
            </div>
            <span className="font-medium text-slate-900">{formatETB(8000)}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <span className="font-bold text-slate-900 block">Total Minor Units</span>
              <span className="text-xs text-slate-500">Pay via Telebirr or Cash at Pickup</span>
            </div>
            <span className="text-xl font-extrabold text-indigo-600">{formatETB(13000)}</span>
          </div>
        </Card>

        <Link href="/directory">
          <Button size="lg" className="w-full">
            Browse Campus Menus & Place Live Order →
          </Button>
        </Link>

        <div className="text-center mt-4">
          <Link href="/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            View My Active Orders →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
