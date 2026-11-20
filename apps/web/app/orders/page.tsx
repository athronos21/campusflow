'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { formatETB } from '@/lib/utils';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Smartphone, RotateCw, ShoppingBag, X } from 'lucide-react';

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

interface PaymentData {
  providerReference: string;
  ussdDial: string;
  instructions: string;
}

export default function StudentOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Telebirr Pay Modal State
  const [payModalOrder, setPayModalOrder] = useState<Order | null>(null);
  const [payData, setPayData] = useState<PaymentData | null>(null);
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
    } catch {
      // Fallback polling
    }

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
      const res = await apiClient<PaymentData>('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          provider,
        }),
      });
      setPayData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment initialization failed';
      alert(msg);
    } finally {
      setPayLoading(false);
    }
  }

  async function handleConfirmMockPayment(ref: string) {
    try {
      setPayLoading(true);
      await apiClient('/payments/webhook/mock', {
        method: 'POST',
        body: JSON.stringify({
          providerReference: ref,
          status: 'success',
        }),
      });

      setPayModalOrder(null);
      setPayData(null);
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm payment';
      alert(msg);
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Live Campus Orders</h1>
            <p className="text-sm text-slate-600">
              {user ? `Logged in as ${user.displayName} &bull; ` : ''}Real-time kitchen order queue and Telebirr settlement.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="h-9 font-semibold text-xs border-slate-300 flex items-center gap-1.5 self-start sm:self-center"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Queue
          </Button>
        </div>

        {isLoading && orders.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm font-medium">
            Loading your campus orders...
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-16 p-6 border-slate-200">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold text-sm">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/directory"
              className="mt-3 inline-block text-xs font-bold text-primary hover:underline"
            >
              Explore campus cafeterias & order food &rarr;
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPaid = order.paymentStatus === 'paid';
              return (
                <Card
                  key={order.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-base">
                        {order.business?.name || 'Campus Cafe'}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <Badge
                        variant={isPaid ? 'success' : 'warning'}
                        className="text-[10px] font-bold uppercase tracking-wider"
                      >
                        {isPaid ? '✓ PAID' : 'UNPAID'}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      {order.items.map((i) => (
                        <div key={i.id}>
                          <span className="font-bold text-slate-800">{i.quantity}x</span> {i.productName} (
                          {formatETB(i.unitPriceMinor)} each)
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull;{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        {formatETB(order.totalMinor)}
                      </div>
                    </div>

                    {!isPaid && order.status !== 'cancelled' && order.status !== 'rejected' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleInitiatePayment(order, 'telebirr')}
                          className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Pay Telebirr
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInitiatePayment(order, 'cbe_birr')}
                          className="h-8 text-xs font-bold border-purple-300 text-purple-900 bg-purple-50 hover:bg-purple-100"
                        >
                          CBE Birr
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Telebirr / CBE Payment Modal */}
      {payModalOrder && payData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 bg-white border-slate-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setPayModalOrder(null);
                setPayData(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <Badge variant="warning" className="text-[10px] uppercase font-bold">
                Instant USSD Settlement
              </Badge>
              <CardTitle className="text-lg font-black text-slate-900">
                {formatETB(payModalOrder.totalMinor)}
              </CardTitle>
              <div className="text-xs text-slate-500">
                Ref: <code className="font-mono font-bold text-primary">{payData.providerReference}</code>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-primary" /> Payment Instruction:
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-center font-black text-primary text-sm select-all">
                {payData.ussdDial}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                {payData.instructions}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                disabled={payLoading}
                onClick={() => handleConfirmMockPayment(payData.providerReference)}
                className="flex-1 h-9 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {payLoading ? 'Verifying...' : 'Simulate Verified Payment'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPayModalOrder(null);
                  setPayData(null);
                }}
                className="h-9 text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
