'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { formatETB } from '@/lib/utils';

interface OrderItem {
  id: string;
  productName: string;
  unitPriceMinor: number;
  quantity: number;
}

interface Order {
  id: string;
  customer?: { displayName: string; email: string | null; phone: string | null };
  status: string;
  paymentStatus: string;
  totalMinor: number;
  createdAt: string;
  items: OrderItem[];
}

export default function MerchantOrdersQueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // In pilot, we use the seeded Haramaya Campus Cafe business ID:
  // 0bf3972e-20a4-4b29-b190-e67fb185118f
  const businessId = '0bf3972e-20a4-4b29-b190-e67fb185118f';

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:4000/api/v1/orders/business/${businessId}`, {
        headers: {
          'Authorization': 'Bearer merchant-dev-token',
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
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`http://localhost:4000/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer merchant-dev-token',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update order status');
      await fetchOrders();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Live Order Queue</h1>
          <p className="text-slate-600 mt-1">Accept incoming student orders and notify them when pickup is ready.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          ↻ Refresh Queue
        </button>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading incoming orders...</div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-600 font-medium">No incoming orders right now.</p>
          <span className="text-xs text-slate-400 mt-1 block">
            Orders placed by students in the storefront will appear here instantly.
          </span>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-lg">
                    {o.customer?.displayName || 'Student Customer'}
                  </span>
                  <OrderStatusBadge status={o.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-sm text-slate-700 mt-2 space-y-0.5">
                  {o.items.map((i) => (
                    <div key={i.id} className="text-slate-600">
                      <span className="font-semibold text-slate-900">{i.quantity}x</span> {i.productName}
                    </div>
                  ))}
                </div>

                <span className="text-base font-extrabold text-slate-900 mt-2 block">
                  Total: {formatETB(o.totalMinor)}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0">
                {o.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={updatingId === o.id}
                    onClick={() => handleUpdateStatus(o.id, 'preparing')}
                  >
                    Accept & Prepare
                  </Button>
                )}

                {o.status === 'preparing' && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updatingId === o.id}
                    onClick={() => handleUpdateStatus(o.id, 'ready')}
                  >
                    Mark Ready for Pickup 🔔
                  </Button>
                )}

                {o.status === 'ready' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingId === o.id}
                    onClick={() => handleUpdateStatus(o.id, 'completed')}
                  >
                    Mark Completed
                  </Button>
                )}

                {(o.status === 'pending' || o.status === 'preparing') && (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={updatingId === o.id}
                    onClick={() => handleUpdateStatus(o.id, 'rejected')}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
