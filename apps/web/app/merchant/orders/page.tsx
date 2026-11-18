'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

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
  const [newOrderAlert, setNewOrderAlert] = useState<boolean>(false);

  // Seeded Haramaya Campus Cafe business ID:
  const businessId = '0bf3972e-20a4-4b29-b190-e67fb185118f';

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient<Order[]>(`/orders/business/${businessId}`);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load merchant orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Connect to real-time Server-Sent Events stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`http://localhost:4000/api/v1/orders/stream?businessId=${businessId}`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'order_created') {
            playChime();
            setNewOrderAlert(true);
            setTimeout(() => setNewOrderAlert(false), 5000);
          }
          fetchOrders();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };
    } catch (e) {
      console.warn('SSE not available, falling back to polling');
    }

    const interval = setInterval(fetchOrders, 6000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      await apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
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
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            Live Order Queue
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-slate-600 mt-1">Real-time incoming student orders with instant sound alert and pickup dispatch.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {newOrderAlert && (
        <div className="mb-6 p-4 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="text-xl">🔔</span> NEW ORDER RECEIVED! Update queue below.
          </div>
          <button
            onClick={() => setNewOrderAlert(false)}
            className="text-white/80 hover:text-white font-bold text-xs"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {isLoading && orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading incoming queue...</div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-12 text-slate-500">
          No orders received yet. Active listings are waiting for customers!
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.paymentStatus === 'paid';
            return (
              <Card key={order.id} className="p-5 border-l-4 border-l-indigo-600 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="font-bold text-slate-900">
                        {order.customer?.displayName || 'Student Customer'}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPaid ? '✓ PAID' : 'UNPAID (COLLECT CASH)'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      Phone: <span className="font-medium text-slate-700">{order.customer?.phone || 'Not provided'}</span>
                      <span className="mx-2">•</span>
                      Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">{formatETB(order.totalMinor)}</span>
                    <span className="text-xs text-slate-500 block">Total order value</span>
                  </div>
                </div>

                <div className="py-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Order Items</div>
                  <div className="grid gap-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-800 font-medium">
                          <span className="font-bold text-indigo-600">{item.quantity}x</span> {item.productName}
                        </span>
                        <span className="text-slate-600 font-mono">
                          {formatETB(item.unitPriceMinor * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifecycle Management Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    Workflow: <span className="font-semibold text-slate-700">{order.status.toUpperCase()}</span>
                  </span>

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'accepted')}
                        >
                          Accept Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'rejected')}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {order.status === 'accepted' && (
                      <Button
                        size="sm"
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      >
                        Start Preparing
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                      >
                        🔔 Mark Ready for Pickup
                      </Button>
                    )}

                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                      >
                        Complete & Handed Over
                      </Button>
                    )}

                    {order.status === 'completed' && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        ✓ Fulfilled
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
