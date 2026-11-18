import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatETB } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Your Pickup Cart</h1>

      <Card className="space-y-4 mb-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-semibold text-slate-900">Special Buna (Coffee)</h4>
            <span className="text-xs text-slate-500">Qty: 2</span>
          </div>
          <span className="font-medium text-slate-900">{formatETB(5000)}</span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-semibold text-slate-900">Ful with Egg and Bread</h4>
            <span className="text-xs text-slate-500">Qty: 1</span>
          </div>
          <span className="font-medium text-slate-900">{formatETB(8000)}</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-slate-900">Total (Pickup)</span>
          <span className="text-xl font-extrabold text-indigo-600">{formatETB(13000)}</span>
        </div>
      </Card>

      <Button size="lg" className="w-full">
        Confirm Order for Pickup
      </Button>

      <div className="text-center mt-4">
        <Link href="/directory" className="text-sm text-slate-500 hover:text-slate-800">
          ← Continue browsing campus shops
        </Link>
      </div>
    </div>
  );
}
