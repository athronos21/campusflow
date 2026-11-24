'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TicketStub } from '@/components/ui/ticket-stub';
import { LoadingState, EmptyState, AuthPromptCard } from '@/components/ui/state-views';
import { OrderStatusBadge } from '@/components/commerce/order-status-badge';
import { useToast } from '@/components/ui/toast';
import { formatETB } from '@/lib/utils';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import { getPaymentVerifyEndpoint } from '@/lib/payment-helpers';
import { useAuth } from '@/lib/auth-context';
import { Smartphone, RotateCw, ShoppingBag, ExternalLink, QrCode, Copy, Check } from 'lucide-react';

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
  checkoutUrl?: string;
}

const ORDER_STEPS = ['pending', 'preparing', 'ready', 'completed'] as const;

function getStepIndex(status: string): number {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'preparing') return 1;
  if (s === 'ready') return 2;
  if (s === 'completed') return 3;
  return 0;
}

export default function StudentOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [payModalOrder, setPayModalOrder] = useState<Order | null>(null);
  const [payData, setPayData] = useState<PaymentData | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [pickupModalOrder, setPickupModalOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await apiClient<Order[]>('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    fetchOrders();

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
      // Fallback polling handles updates cleanly
    }

    const interval = window.setInterval(fetchOrders, 8000);
    return () => {
      window.clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [user, fetchOrders]);

  async function handleInitiatePayment(order: Order, provider: 'telebirr' | 'cbe_birr') {
    setPayModalOrder(order);
    setPayData(null);
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
      setPayModalOrder(null);
      toast({ title: 'Payment initialization failed', description: msg, variant: 'error' });
    } finally {
      setPayLoading(false);
    }
  }

  async function handleConfirmMockPayment(ref: string) {
    try {
      setPayLoading(true);
      await apiClient(getPaymentVerifyEndpoint(ref), {
        method: 'POST',
      });

      setPayModalOrder(null);
      setPayData(null);
      toast({
        title: 'Payment confirmed',
        description: 'Your counter pickup QR pass is ready.',
        variant: 'success',
      });
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm payment';
      toast({ title: 'Verification failed', description: msg, variant: 'error' });
    } finally {
      setPayLoading(false);
    }
  }

  const copyUssd = async (ussd: string) => {
    try {
      await navigator.clipboard.writeText(ussd);
      toast({ title: 'USSD string copied', description: ussd, variant: 'success' });
    } catch {
      toast({ title: 'Copy unavailable', description: ussd, variant: 'warning' });
    }
  };

  return (
    <AppShell maxWidth="5xl">
      <div className="space-y-6">
        <PageHeader
          title="Live Campus Orders"
          description={
            user
              ? `Signed in as ${user.displayName}. Real-time kitchen progress and Telebirr/CBE Birr settlement.`
              : 'Track kitchen preparation live and view counter pickup QR passes.'
          }
          action={
            user ? (
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Queue
              </Button>
            ) : undefined
          }
        />

        {authLoading || (isLoading && orders.length === 0) ? (
          <LoadingState label="Loading your campus orders..." count={2} />
        ) : !user ? (
          <AuthPromptCard
            title="Sign in to view your orders"
            description="Sign in with your student account to track cafeteria prep updates and access your pickup QR passes."
            returnTo="/orders"
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title="No campus orders yet"
            description="Order a meal, coffee, or printing service from any verified campus shop to track it live here."
            actionLabel="Explore Campus Directory"
            actionHref="/directory"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPaid = order.paymentStatus === 'paid';
              const isTerminalFailure =
                order.status.toLowerCase() === 'cancelled' || order.status.toLowerCase() === 'rejected';
              const stepIdx = getStepIndex(order.status);

              return (
                <Card key={order.id} className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display font-bold text-foreground text-base">
                          {order.business?.name || 'Campus Cafe'}
                        </h2>
                        <OrderStatusBadge status={order.status} />
                        <Badge variant={isPaid ? 'success' : 'warning'}>
                          {isPaid ? 'PAID' : 'UNPAID'}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {order.items.map((item) => (
                          <div key={item.id}>
                            <span className="font-mono font-bold text-foreground">{item.quantity}x</span>{' '}
                            {item.productName}{' '}
                            <span className="font-mono">({formatETB(item.unitPriceMinor)} each)</span>
                          </div>
                        ))}
                      </div>

                      <div className="font-mono text-[11px] text-muted-foreground">
                        #{order.id.slice(0, 8).toUpperCase()} &bull;{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull;{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border shrink-0">
                      <div className="text-left md:text-right">
                        <div className="text-[11px] font-semibold text-muted-foreground">Total</div>
                        <div className="font-mono text-lg font-black text-foreground tabular-nums">
                          {formatETB(order.totalMinor)}
                        </div>
                      </div>

                      {isPaid && (
                        <Button size="sm" variant="outline" onClick={() => setPickupModalOrder(order)}>
                          <QrCode className="w-3.5 h-3.5 mr-1.5 text-primary" /> Pickup QR Pass
                        </Button>
                      )}

                      {!isPaid && !isTerminalFailure && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleInitiatePayment(order, 'telebirr')}
                          >
                            <Smartphone className="w-3.5 h-3.5 mr-1.5" /> Pay Telebirr
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInitiatePayment(order, 'cbe_birr')}
                          >
                            CBE Birr
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4-Step Live Progress Strip */}
                  {!isTerminalFailure && (
                    <div className="pt-3 border-t border-border grid grid-cols-4 gap-2">
                      {ORDER_STEPS.map((step, idx) => {
                        const reached = idx <= stepIdx;
                        return (
                          <div key={step} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full transition-colors ${reached ? 'bg-primary' : 'bg-muted'
                                }`}
                            />
                            <div
                              className={`text-[11px] font-semibold capitalize flex items-center gap-1 ${reached ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                              {reached && <Check className="h-3 w-3 text-primary" />}
                              <span>{step}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Telebirr / CBE Birr Checkout Dialog */}
      <Dialog
        open={Boolean(payModalOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setPayModalOrder(null);
            setPayData(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Instant USSD Settlement</DialogTitle>
            <DialogDescription>
              {payModalOrder
                ? `Complete payment of ${formatETB(payModalOrder.totalMinor)} to ${payModalOrder.business?.name || 'merchant'}.`
                : ''}
            </DialogDescription>
          </DialogHeader>

          {payLoading && !payData ? (
            <LoadingState label="Generating payment instructions..." count={1} />
          ) : payData ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">Reference</span>
                  <code className="font-mono font-bold text-foreground">{payData.providerReference}</code>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5">
                  <span className="font-mono font-black text-primary text-sm select-all">{payData.ussdDial}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => copyUssd(payData.ussdDial)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-muted-foreground leading-relaxed">{payData.instructions}</p>
                {payData.checkoutUrl && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={payData.checkoutUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Payment Checkout
                    </a>
                  </Button>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPayModalOrder(null);
                    setPayData(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  disabled={payLoading}
                  onClick={() => handleConfirmMockPayment(payData.providerReference)}
                >
                  {payLoading ? 'Verifying...' : 'Simulate Verified Payment'}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Pickup QR Pass Dialog */}
      <Dialog
        open={Boolean(pickupModalOrder)}
        onOpenChange={(open) => {
          if (!open) setPickupModalOrder(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Counter Pickup Pass</DialogTitle>
            <DialogDescription>
              Show this QR stub at the merchant counter to collect your order.
            </DialogDescription>
          </DialogHeader>

          {pickupModalOrder && (
            <TicketStub
              accent="primary"
              title={pickupModalOrder.business?.name || 'Campus Cafeteria'}
              subtitle={pickupModalOrder.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
              badge={<Badge variant="success">PAID</Badge>}
              code={`ORD-${pickupModalOrder.id.slice(0, 8).toUpperCase()}`}
              qrValue={`CAMPUSFLOW:PICKUP:${pickupModalOrder.id}:${pickupModalOrder.business?.id}`}
              meta={[
                { label: 'Status', value: pickupModalOrder.status.toUpperCase() },
                { label: 'Total', value: formatETB(pickupModalOrder.totalMinor) },
              ]}
            />
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setPickupModalOrder(null)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
