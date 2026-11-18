import React from 'react';
import { Card } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { formatETB } from '@/lib/utils';

export default function StudentOrdersPage() {
  const sampleOrders = [
    {
      id: 'ord-101',
      businessName: 'Haramaya Campus Cafe & Snack',
      items: '2x Special Buna, 1x Ful with Egg',
      totalMinor: 13000,
      status: 'ready',
      placedAt: '10 minutes ago',
    },
    {
      id: 'ord-100',
      businessName: 'Eagle Tech & Fast Print',
      items: '15 Pages Assignment Print (Color)',
      totalMinor: 7500,
      status: 'completed',
      placedAt: 'Yesterday',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
        <p className="text-slate-600 mt-1">Track your campus orders and pickup notifications.</p>
      </div>

      <div className="space-y-4">
        {sampleOrders.map((order) => (
          <Card key={order.id} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900">{order.businessName}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-slate-600 mt-1">{order.items}</p>
              <span className="text-xs text-slate-400 mt-2 block">{order.placedAt}</span>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-slate-900 block">{formatETB(order.totalMinor)}</span>
              <span className="text-xs text-slate-500">Pay at pickup</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
