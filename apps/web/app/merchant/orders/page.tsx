import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatETB } from '@/lib/utils';

export default function MerchantOrdersQueuePage() {
  const incomingOrders = [
    {
      id: 'ord-204',
      customerName: 'Tigist Haile',
      items: '2x Special Buna, 1x Ful with Egg',
      totalMinor: 13000,
      status: 'pending',
      time: '3 mins ago',
    },
    {
      id: 'ord-203',
      customerName: 'Amanuel Tesfaye',
      items: '1x Macchiato, 1x Sambusa',
      totalMinor: 4500,
      status: 'preparing',
      time: '12 mins ago',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Live Order Queue</h1>
      <p className="text-slate-600 mb-8">Accept orders and notify students when items are ready for pickup.</p>

      <div className="space-y-4">
        {incomingOrders.map((o) => (
          <Card key={o.id} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{o.customerName}</span>
                <Badge variant={o.status === 'pending' ? 'warning' : 'default'}>
                  {o.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-400">{o.time}</span>
              </div>
              <p className="text-sm text-slate-700 mt-1">{o.items}</p>
              <span className="text-sm font-semibold text-slate-900 mt-2 block">
                Total: {formatETB(o.totalMinor)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {o.status === 'pending' && (
                <Button size="sm" variant="primary">
                  Accept & Prepare
                </Button>
              )}
              {o.status === 'preparing' && (
                <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                  Mark Ready for Pickup
                </Button>
              )}
              <Button size="sm" variant="outline">
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
