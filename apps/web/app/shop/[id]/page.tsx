'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, CheckCircle2, ChevronLeft, Plus, Minus, Store, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceMinor: number | string;
  isAvailable: boolean;
}

interface Business {
  id: string;
  campusId: string;
  name: string;
  description: string | null;
  status: string;
  products: Product[];
}

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    items: cartItems,
    businessId: cartBusinessId,
    addItem,
    updateQuantity,
    clearCart,
    totalMinor: cartTotalMinor,
    itemCount: cartItemCount,
  } = useCart();

  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShop() {
      try {
        setIsLoading(true);
        const data = await apiClient<Business>(`/businesses/${businessId}`);
        setBusiness(data);
      } catch (err) {
        console.error('Shop fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (businessId) {
      loadShop();
    }
  }, [businessId]);

  const isThisShopInCart = Boolean(business && cartBusinessId === business.id);
  const shopCartItems = isThisShopInCart ? cartItems : [];
  const shopItemCount = shopCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shopTotalMinor = isThisShopInCart ? cartTotalMinor : 0;

  const getProductQty = (productId: string) => {
    if (!isThisShopInCart) return 0;
    return cartItems.find((i) => i.id === productId)?.quantity || 0;
  };

  const handleAddItem = (product: Product) => {
    if (!business) return;
    const added = addItem(
      {
        id: product.id,
        name: product.name,
        priceMinor: product.priceMinor,
        businessId: business.id,
        businessName: business.name,
        campusId: business.campusId,
      },
      1,
    );
    if (added) {
      toast({
        title: `Added ${product.name}`,
        description: `1x added to your ${business.name} pickup order.`,
        variant: 'success',
        durationMs: 2200,
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!business || shopItemCount === 0) return;

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to submit your pickup order.',
        variant: 'warning',
      });
      router.push(`/login?next=${encodeURIComponent(`/shop/${business.id}`)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setOrderError(null);

      await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify({
          campusId: business.campusId,
          businessId: business.id,
          items: shopCartItems.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
        }),
      });

      clearCart();
      toast({
        title: 'Order placed',
        description: `Sent to ${business.name}. Track preparation live on My Orders.`,
        variant: 'success',
      });
      router.push('/orders');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating order';
      setOrderError(msg);
      toast({ title: 'Could not place order', description: msg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell maxWidth="5xl">
      {isLoading ? (
        <LoadingState label="Loading shop menu..." count={4} />
      ) : !business ? (
        <EmptyState
          icon={<Store className="h-6 w-6" />}
          title="Shop not found"
          description="This merchant may no longer be active or the link is invalid."
          actionLabel="Return to Directory"
          actionHref="/directory"
        />
      ) : (
        <div className="space-y-6 pb-20 lg:pb-0">
          <div>
            <Link
              href="/directory"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Directory
            </Link>

            <PageHeader
              title={business.name}
              description={business.description || 'Verified Haramaya campus partner serving student pickup orders.'}
              badge={
                <Badge variant="success">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED PARTNER
                </Badge>
              }
            />
          </div>

          {orderError && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Menu List */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">Menu &amp; Items</h2>
                <span className="text-xs text-muted-foreground">
                  {business.products.length} {business.products.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {business.products.length === 0 ? (
                <EmptyState
                  icon={<Store className="h-5 w-5" />}
                  title="No menu items listed yet"
                  description="This merchant hasn't published active menu items yet."
                />
              ) : (
                business.products.map((product) => {
                  const qty = getProductQty(product.id);
                  const available = product.isAvailable !== false;

                  return (
                    <Card
                      key={product.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground text-base">
                            {product.name}
                          </h3>
                          {!available && <Badge variant="muted">Sold Out</Badge>}
                        </div>
                        {product.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
                        )}
                        <div className="font-mono font-bold text-primary text-sm pt-1 tabular-nums">
                          {formatETB(product.priceMinor)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {qty > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              aria-label={`Decrease quantity of ${product.name}`}
                              onClick={() => updateQuantity(product.id, -1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-mono font-bold text-foreground w-7 text-center text-sm tabular-nums">
                              {qty}
                            </span>
                          </div>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          disabled={!available}
                          onClick={() => handleAddItem(product)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {qty > 0 ? 'Add' : 'Add to Cart'}
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Desktop Order Summary Rail */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-display font-bold text-base text-foreground">Pickup Summary</h3>
                  <Badge variant="default" className="font-mono">
                    {shopItemCount} {shopItemCount === 1 ? 'item' : 'items'}
                  </Badge>
                </div>

                {shopItemCount === 0 ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add items from {business.name} to start a direct counter pickup order.
                    {cartItemCount > 0 && !isThisShopInCart
                      ? ' Adding an item here will prompt to switch your active cart.'
                      : ''}
                  </p>
                ) : (
                  <>
                    <ul className="space-y-2 text-xs">
                      {shopCartItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span className="text-foreground font-medium truncate">
                            <span className="font-mono font-bold">{item.quantity}x</span> {item.name}
                          </span>
                          <span className="font-mono font-semibold text-foreground shrink-0 tabular-nums">
                            {formatETB(Number(item.priceMinor) * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-3 border-t border-border flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Total</span>
                      <span className="font-mono text-xl font-black text-foreground tabular-nums">
                        {formatETB(shopTotalMinor)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handlePlaceOrder}
                        className="w-full font-bold"
                      >
                        {isSubmitting ? 'Placing Order...' : 'Confirm Pickup Order'}
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/cart">
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Review Full Cart
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </aside>
          </div>

          {/* Sticky Mobile Summary Bar */}
          {shopItemCount > 0 && (
            <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm p-3 shadow-drawer">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    {shopItemCount} {shopItemCount === 1 ? 'item' : 'items'}
                  </div>
                  <div className="font-mono text-base font-black text-foreground tabular-nums">
                    {formatETB(shopTotalMinor)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/cart">Cart</Link>
                  </Button>
                  <Button size="sm" disabled={isSubmitting} onClick={handlePlaceOrder}>
                    {isSubmitting ? 'Placing...' : 'Order Now'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
