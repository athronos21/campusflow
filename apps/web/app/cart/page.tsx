'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { formatETB } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import {
  ShoppingCart,
  Coffee,
  Footprints,
  Info,
  AlertTriangle,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalMinor,
    itemCount,
    businessName,
    businessId,
    campusId,
  } = useCart();

  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'express'>('pickup');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !businessId || !campusId) return;

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to place your campus order.',
        variant: 'warning',
      });
      router.push('/login?next=/cart');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify({
          campusId,
          businessId,
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
          notes: specialInstructions ? `[${fulfillmentType.toUpperCase()}] ${specialInstructions}` : undefined,
        }),
      });

      clearCart();
      toast({
        title: 'Order submitted',
        description: `Sent to ${businessName || 'campus merchant'}.`,
        variant: 'success',
      });
      router.push('/orders');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setErrorMsg(msg);
      toast({ title: 'Order failed', description: msg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell maxWidth="5xl">
      <div className="space-y-6">
        <PageHeader
          title="Your Pickup Cart"
          description="Direct counter pickup and dorm handoff orders at Haramaya University."
          action={
            items.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearCart();
                  toast({ title: 'Cart cleared', variant: 'default' });
                }}
                className="text-destructive border-rose-200 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Cart
              </Button>
            ) : undefined
          }
        />

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="w-6 h-6" />}
            title="Your pickup cart is empty"
            description="Browse verified campus cafeterias, buna lounges, and printing centers to start an order."
            actionLabel="Browse Campus Directory"
            actionHref="/directory"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Merchant + Items + Fulfillment */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#11241A] text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-300">Verified Merchant</div>
                  <h2 className="font-display text-base font-bold text-white">{businessName}</h2>
                </div>
                <Badge variant="success" className="font-mono">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              <Card className="divide-y divide-border overflow-hidden">
                {items.map((item) => {
                  const lineTotal = Number(item.priceMinor) * item.quantity;
                  return (
                    <div key={item.id} className="p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-foreground text-sm sm:text-base truncate">
                          {item.name}
                        </h3>
                        <div className="font-mono text-xs text-muted-foreground mt-0.5 tabular-nums">
                          {formatETB(item.priceMinor)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-mono font-bold text-foreground w-7 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <div className="font-mono font-bold text-foreground text-sm tabular-nums">
                          {formatETB(lineTotal)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="min-h-[44px] sm:min-h-[32px] px-2 text-xs text-destructive hover:underline font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Card>

              <Card className="p-5 space-y-4">
                <h3 className="font-display font-bold text-foreground text-sm">Fulfillment Mode</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors ${
                      fulfillmentType === 'pickup'
                        ? 'border-primary bg-primary-50/70 text-foreground'
                        : 'border-border bg-card hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-secondary" /> Counter Pickup
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Collect at shop counter</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('express')}
                    className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors ${
                      fulfillmentType === 'express'
                        ? 'border-primary bg-primary-50/70 text-foreground'
                        : 'border-border bg-card hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <Footprints className="w-4 h-4 text-primary" /> Dorm Handoff
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Meet at designated dorm gate</div>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cart-notes" className="text-xs font-semibold">
                    Order Instructions (Optional)
                  </Label>
                  <Input
                    id="cart-notes"
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Extra hot coffee, double sugar, or Block 24 gate"
                  />
                </div>
              </Card>
            </div>

            {/* Right Column: Receipt Summary */}
            <aside className="lg:col-span-4 space-y-4">
              <Card className="p-5 sm:p-6 space-y-4">
                <h3 className="font-display font-bold text-foreground text-base border-b border-border pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items ({itemCount})</span>
                    <span className="font-mono font-bold text-foreground tabular-nums">{formatETB(totalMinor)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee</span>
                    <span className="font-mono font-bold text-emerald-700">{formatETB(0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Prep</span>
                    <span className="font-semibold text-foreground">10 &ndash; 15 mins</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-bold text-foreground">Total Amount</span>
                  <span className="font-mono text-2xl font-black text-primary tabular-nums">
                    {formatETB(totalMinor)}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span>All amounts are settled in exact integer Ethiopian Birr cents.</span>
                </div>

                <Button
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full font-bold"
                >
                  {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                </Button>
              </Card>

              <div className="text-center">
                <Link href="/directory" className="text-xs font-semibold text-muted-foreground hover:text-primary">
                  &larr; Continue browsing shops
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}
