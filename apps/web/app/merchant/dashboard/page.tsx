import React from 'react';
import { Card } from '@/components/ui/card';
import { formatETB } from '@/lib/utils';

export default function MerchantDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Merchant Dashboard</h1>
      <p className="text-slate-600 mb-8">Daily overview of campus orders and completed sales.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatETB(452000)}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">↑ 14 orders completed</span>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</span>
          <p className="text-2xl font-black text-indigo-600 mt-2">3</p>
          <span className="text-xs text-slate-500 mt-1 block">Awaiting prep / pickup</span>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu Items Active</span>
          <p className="text-2xl font-black text-slate-900 mt-2">12</p>
          <span className="text-xs text-slate-500 mt-1 block">In stock & visible to students</span>
        </Card>
      </div>
    </div>
  );
}
