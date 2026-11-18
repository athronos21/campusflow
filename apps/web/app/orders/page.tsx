'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { formatETB } from '@/lib/utils';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productName: string;
  unitPriceMinor: number;
  quantity: number;
}

interface Order {
  id: string;
  business: { id: string; name: string };
  status: string;
  paymentStatus: string;
  totalMinor: number;
  createdAt: string;
  items: OrderItem[];
}

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:4000/api/v1/orders/my-orders', {
        headers: {
          'Authorization': 'Bearer student-dev-token',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-poll status every 6 seconds for live updates
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
          <p className="text-slate-600 mt-1">Live status of your campus orders and pickup notifications.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-600 font-medium">You haven't placed any orders yet.</p>
          <Link
            href="/directory"
            className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Explore campus shops & order food →
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-lg">
                    {order.business?.name || 'Campus Cafe'}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="text-sm text-slate-700 mt-2 space-y-0.5">
                  {order.items.map((i) => (
                    <div key={i.id} className="text-slate-600">
                      <span className="font-semibold text-slate-800">{i.quantity}x</span> {i.productName} (
                      {formatETB(i.unitPriceMinor)} each)
                    </div>
                  ))}
                </div>

                <span className="text-xs text-slate-400 mt-2 block">
                  Ordered at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-right md:border-l md:pl-6 border-slate-100 flex flex-col justify-center">
                <span className="text-xl font-black text-slate-900 block">{formatETB(order.totalMinor)}</span>
                <span className="text-xs text-slate-500 mt-0.5">Payment at pickup</span>
                {order.status === 'ready' && (
                  <span className="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md animate-bounce">
                    Ready for Pickup! 🔔
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
