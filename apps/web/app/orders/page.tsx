'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { formatETB } from '@/lib/utils';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Smartphone, Bell, Check } from 'lucide-react';

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
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Telebirr Pay Modal State
  const [payModalOrder, setPayModalOrder] = useState<Order | null>(null);
  const [payData, setPayData] = useState<any | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient<Order[]>('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Setup real-time Server-Sent Events (SSE) for instant live order updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_BASE_URL}/orders/stream`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'order_updated' || payload.type === 'order_created') {
            fetchOrders();
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };
    } catch (e) {
      console.warn('SSE not supported or connection error, falling back to polling');
    }

    // Secondary fallback poll every 8 seconds
    const interval = setInterval(fetchOrders, 8000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  async function handleInitiatePayment(order: Order, provider: 'telebirr' | 'cbe_birr') {
    setPayModalOrder(order);
    setPayLoading(true);
    try {
      const res = await apiClient<any>('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          provider,
        }),
      });
      setPayData(res);
    } catch (err: any) {
      alert(err.message || 'Payment initialization failed');
    } finally {
      setPayLoading(false);
    }
  }

  async function handleConfirmMockPayment(ref: string) {
    setPayLoading(true);
    try {
      await apiClient<any>(`/payments/verify/${ref}`, { method: 'POST' });
      alert('Payment verified successfully! Order marked as PAID.');
      setPayModalOrder(null);
      setPayData(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
          <p className="text-slate-600 mt-1">
            {user ? `Logged in as ${user.displayName} • ` : ''}Live status of your campus orders, Telebirr payment, and pickup notifications.
          </p>
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
          {orders.map((order) => {
            const isPaid = order.paymentStatus === 'paid';
            return (
              <Card key={order.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-lg">
                      {order.business?.name || 'Campus Cafe'}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isPaid ? '✓ PAID' : 'UNPAID'}
                    </span>
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

                <div className="text-right md:border-l md:pl-6 border-slate-100 flex flex-col justify-center items-end">
                  <span className="text-xl font-black text-slate-900 block">{formatETB(order.totalMinor)}</span>
                  
                  {isPaid ? (
                    <span className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Paid via Digital Payment
                    </span>
                  ) : (
                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={() => handleInitiatePayment(order, 'telebirr')}
                        className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition flex items-center gap-1"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Pay Telebirr
                      </button>
                      <button
                        onClick={() => handleInitiatePayment(order, 'cbe_birr')}
                        className="px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition"
                      >
                        CBE Birr
                      </button>
                    </div>
                  )}

                  {order.status === 'ready' && (
                    <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md animate-bounce">
                      Ready for Pickup! <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Dialog */}
      {payModalOrder && payData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  {payData.provider === 'telebirr' ? 'TB' : 'CBE'}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Pay {payData.provider === 'telebirr' ? 'Telebirr' : 'CBE Birr'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setPayModalOrder(null);
                  setPayData(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2 mb-4">
              <div className="text-xs text-slate-400 uppercase font-semibold">Total Amount</div>
              <div className="text-3xl font-black text-slate-900">{formatETB(payData.amountMinor)}</div>
              <div className="text-xs text-slate-500 mt-1">
                Ref: <code className="font-mono font-bold text-indigo-600">{payData.providerReference}</code>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 mb-6 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" /> Payment Instruction:
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-center font-bold text-indigo-700 text-sm">
                {payData.ussdDial}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {payData.instructions}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                disabled={payLoading}
                onClick={() => handleConfirmMockPayment(payData.providerReference)}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
              >
                {payLoading ? 'Verifying...' : 'Simulate Verified Payment'}
              </button>
              <button
                onClick={() => {
                  setPayModalOrder(null);
                  setPayData(null);
                }}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
