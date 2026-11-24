'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { useToast } from '@/components/ui/toast';
import { formatETB } from '@/lib/utils';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  resolveMerchantBusinessId,
  partitionMerchantOrders,
  type BusinessSummaryRef,
} from '@/lib/merchant-helpers';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);

  const playChime = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    } catch {
      // Browser audio autoplay policy fallback
    }
  }, [audioEnabled]);

  useEffect(() => {
    let active = true;
    async function initBusiness() {
      const campuses = await apiClient<{ id: string }[]>('/campuses').catch(() => []);
      const campusId = campuses[0]?.id;
      const bizList = campusId
        ? await apiClient<BusinessSummaryRef[]>(`/businesses?campusId=${campusId}`).catch(() => [])
        : await apiClient<BusinessSummaryRef[]>('/businesses').catch(() => []);
      if (!active) return;
      const resolved = resolveMerchantBusinessId(bizList, user?.id);
      setBusinessId(resolved);
      if (!resolved) setIsLoading(false);
    }
    initBusiness();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const fetchOrders = useCallback(async () => {
    if (!businessId) return;
    try {
      setIsLoading(true);
      const data = await apiClient<Order[]>(`/orders/business/${businessId}`);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load merchant orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    fetchOrders();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_BASE_URL}/orders/stream?businessId=${businessId}`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'order_created') {
            playChime();
            setNewOrderAlert(true);
            window.setTimeout(() => setNewOrderAlert(false), 6000);
          }
          fetchOrders();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };
    } catch {
      // Fallback polling
    }

    const interval = window.setInterval(fetchOrders, 6000);
    return () => {
      window.clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [businessId, fetchOrders, playChime]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      await apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast({
        title: `Order marked ${status}`,
        variant: status === 'rejected' ? 'warning' : 'success',
      });
      await fetchOrders();
    } catch (err: unknown) {
      toast({
        title: 'Status update failed',
        description: err instanceof Error ? err.message : 'Could not update order',
        variant: 'error',
      });
    } finally {
      setUpdatingId(null);
      setRejectOrderId(null);
    }
  };

  const { activeOrders, pastOrders } = partitionMerchantOrders(orders);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Kitchen Queue"
        description="Real-time incoming student orders with audio alerts and pickup dispatch."
        badge={<Badge variant="success">SSE Live</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) playChime();
              }}
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 mr-1.5 text-primary" /> Sound On
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Sound Off
                </>
              )}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={fetchOrders} disabled={!businessId}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
          </div>
        }
      />

      {newOrderAlert && (
        <div className="p-4 bg-primary text-primary-foreground rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <Bell className="w-5 h-5 shrink-0" />
            <span>New order incoming. Accept and begin preparation.</span>
          </div>
          <button
            type="button"
            onClick={() => setNewOrderAlert(false)}
            aria-label="Dismiss new order alert"
            className="opacity-80 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading && orders.length === 0 ? (
        <LoadingState label="Listening to live kitchen orders..." count={2} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6" />}
          title="No kitchen orders yet"
          description="Incoming student orders will appear here in real time with an audible chime."
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground">
              Active Orders ({activeOrders.length})
            </h2>

            {activeOrders.length === 0 ? (
              <Card className="p-6 text-center text-xs text-muted-foreground">
                All incoming orders have been fulfilled. Kitchen is ready for new orders.
              </Card>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const isPaid = order.paymentStatus === 'paid';
                  return (
                    <Card key={order.id} className="border-primary/35">
                      <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold bg-muted text-foreground px-2 py-0.5 rounded border border-border">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <OrderStatusBadge status={order.status} />
                              <Badge variant={isPaid ? 'success' : 'warning'}>
                                {isPaid ? 'PAID ONLINE' : 'CASH AT PICKUP'}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 font-semibold text-foreground">
                                <User className="w-3.5 h-3.5" />
                                {order.customer?.displayName || 'Student Customer'}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3" />
                                {order.customer?.phone || 'No phone'}
                              </span>
                              <span className="font-mono">
                                {new Date(order.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <div className="font-mono text-xl font-black text-foreground tabular-nums">
                              {formatETB(order.totalMinor)}
                            </div>
                            <span className="text-[11px] text-muted-foreground">Order Total</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="py-4">
                        <div className="grid gap-2 bg-muted/40 p-3 rounded-lg border border-border">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs items-center">
                              <span className="text-foreground font-medium">
                                <span className="font-mono font-bold text-primary bg-primary-50 px-1.5 py-0.5 rounded mr-2 border border-primary/20">
                                  {item.quantity}x
                                </span>
                                {item.productName}
                              </span>
                              <span className="text-foreground font-mono font-bold tabular-nums">
                                {formatETB(item.unitPriceMinor * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                          Status: <span className="font-bold text-foreground">{order.status.toUpperCase()}</span>
                        </span>

                        <div className="flex flex-wrap gap-2">
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
                                onClick={() => setRejectOrderId(order.id)}
                                className="text-destructive border-rose-200 hover:bg-rose-50"
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
                              variant="secondary"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'ready')}
                            >
                              <Bell className="w-3.5 h-3.5 mr-1.5" /> Ready for Pickup
                            </Button>
                          )}

                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Handed Over &amp; Complete
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

          {pastOrders.length > 0 && (
            <div className="pt-4 border-t border-border space-y-3">
              <h2 className="text-xs font-bold text-muted-foreground">
                Completed &amp; Past Orders ({pastOrders.length})
              </h2>
              <div className="space-y-2">
                {pastOrders.map((order) => (
                  <Card key={order.id} className="p-4 bg-muted/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="font-semibold text-foreground text-sm truncate">
                          {order.customer?.displayName || 'Customer'}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="font-mono font-bold text-foreground text-sm tabular-nums shrink-0">
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

      <ConfirmDialog
        open={Boolean(rejectOrderId)}
        onOpenChange={(open) => {
          if (!open) setRejectOrderId(null);
        }}
        title="Reject incoming order?"
        description="The student will be notified that this order cannot be fulfilled right now."
        confirmLabel="Reject Order"
        variant="destructive"
        isLoading={Boolean(updatingId)}
        onConfirm={() => {
          if (rejectOrderId) return handleUpdateStatus(rejectOrderId, 'rejected');
        }}
      />
    </div>
  );
}
