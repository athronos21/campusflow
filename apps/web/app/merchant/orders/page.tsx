'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { formatETB } from '@/lib/utils';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import { Bell, RefreshCw, Volume2, VolumeX, CheckCircle, Clock, User, Phone, X } from 'lucide-react';

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
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Seeded Haramaya Campus Cafe business ID:
  const businessId = '0bf3972e-20a4-4b29-b190-e67fb185118f';

  const playChime = () => {
    if (!audioEnabled) return;
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
      eventSource = new EventSource(`${API_BASE_URL}/orders/stream?businessId=${businessId}`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'order_created') {
            playChime();
            setNewOrderAlert(true);
            setTimeout(() => setNewOrderAlert(false), 6000);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled]);

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

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'rejected');
  const pastOrders = orders.filter((o) => o.status === 'completed' || o.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Kitchen Queue</h1>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-sm">
            Real-time incoming student orders with instant sound alerts and pickup dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) playChime();
            }}
            className="text-xs"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Sound On
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Sound Off
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {newOrderAlert && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3 font-bold text-sm">
            <Bell className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>NEW ORDER INCOMING! Please accept and begin preparation.</span>
          </div>
          <button
            onClick={() => setNewOrderAlert(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading && orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">Listening to live kitchen orders...</div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-16 text-slate-500">
          <CardContent>
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-800">No active kitchen orders</p>
            <p className="text-xs text-slate-500 mt-1">
              Your listings are active in the student marketplace. When orders are placed, they will appear here with an audio alert.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Orders ({activeOrders.length})
              </h2>
            </div>

            {activeOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                All incoming orders have been fulfilled. Kitchen is ready for new orders!
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const isPaid = order.paymentStatus === 'paid';
                  return (
                    <Card key={order.id} className="border-l-4 border-l-indigo-600 shadow-sm">
                      <CardHeader className="pb-3 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                #{order.id.slice(0, 8)}
                              </span>
                              <OrderStatusBadge status={order.status} />
                              <Badge variant={isPaid ? 'success' : 'warning'}>
                                {isPaid ? 'PAID ONLINE' : 'CASH AT PICKUP'}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                              <span className="flex items-center gap-1 font-bold text-slate-900">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {order.customer?.displayName || 'Student Customer'}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {order.customer?.phone || 'No phone'}
                              </span>
                              <span className="text-slate-400">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <div className="text-2xl font-black text-slate-900">{formatETB(order.totalMinor)}</div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Value</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Order Items</div>
                        <div className="grid gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs items-center">
                              <span className="text-slate-800 font-medium">
                                <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded mr-2 border border-indigo-100">
                                  {item.quantity}x
                                </span>
                                {item.productName}
                              </span>
                              <span className="text-slate-700 font-bold font-mono">
                                {formatETB(item.unitPriceMinor * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                          Status: <span className="font-bold text-slate-800">{order.status.toUpperCase()}</span>
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
                                className="text-rose-600 border-rose-200 hover:bg-rose-50"
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
                              <Bell className="w-3.5 h-3.5 mr-1.5" /> Ready for Pickup
                            </Button>
                          )}

                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="font-bold"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Handed Over & Complete
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Orders Section */}
          {pastOrders.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
                Completed & Past Orders ({pastOrders.length})
              </h2>
              <div className="space-y-3 opacity-80">
                {pastOrders.map((order) => (
                  <Card key={order.id} className="p-4 bg-slate-50 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {order.customer?.displayName || 'Customer'}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="font-bold text-slate-800 text-sm">
                        {formatETB(order.totalMinor)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
