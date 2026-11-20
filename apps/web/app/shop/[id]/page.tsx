'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, ChevronLeft, Plus, Minus, Store } from 'lucide-react';

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
  const { addItem, updateQuantity: updateGlobalQuantity, clearCart } = useCart();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
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

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleAddItem = (product: Product) => {
    updateQuantity(product.id, 1);
    if (business) {
      addItem(
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
    }
  };

  const handleRemoveItem = (product: Product) => {
    updateQuantity(product.id, -1);
    updateGlobalQuantity(product.id, -1);
  };

  const totalMinor = Object.entries(cart).reduce((sum, [productId, qty]) => {
    const p = business?.products.find((prod) => prod.id === productId);
    return sum + (p ? Number(p.priceMinor) * qty : 0);
  }, 0);

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const handlePlaceOrder = async () => {
    if (!business || cartCount === 0) return;

    if (!user) {
      alert('Please sign in or create an account to place an order.');
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setOrderError(null);

      const items = Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify({
          campusId: business.campusId,
          businessId: business.id,
          items,
        }),
      });

      clearCart();
      router.push('/orders');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating order';
      setOrderError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <div className="text-center py-24 text-slate-500 font-medium">Loading shop menu...</div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <div className="text-center py-24">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-slate-900">Shop Not Found</h2>
          <Button variant="outline" size="sm" asChild className="mt-3">
            <Link href="/directory">Return to Directory</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full pb-32 space-y-6">
        <div>
          <Link
            href="/directory"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-2">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{business.name}</h1>
              <p className="text-slate-600 text-sm mt-0.5">{business.description}</p>
            </div>
            <Badge variant="success" className="text-[10px] font-bold flex items-center gap-1 self-start sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED PARTNER
            </Badge>
          </div>
        </div>

        {orderError && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            {orderError}
          </div>
        )}

        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-xl font-bold text-slate-900">Available Menu & Items</h2>
          <p className="text-xs text-slate-500">Fast pickup ordering between lectures with audio alerts</p>
        </div>

        <div className="space-y-3">
          {business.products.map((product) => {
            const qty = cart[product.id] || 0;

            return (
              <Card
                key={product.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-slate-200 hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-slate-500 font-normal leading-relaxed">{product.description}</p>
                  )}
                  <span className="font-black text-primary text-base font-mono block mt-1">
                    {formatETB(product.priceMinor)}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {qty > 0 && (
                    <div className="flex items-center gap-2 mr-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(product)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="font-bold text-slate-900 w-6 text-center text-sm font-mono">
                        {qty}
                      </span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleAddItem(product)}
                    className="h-8 px-3 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> {qty > 0 ? 'Add' : 'Add to Cart'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Floating Checkout Drawer */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-xl p-4 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in pickup cart
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{formatETB(totalMinor)}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="h-9 font-semibold text-xs border-slate-300">
                <Link href="/cart" className="flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-primary" /> Review Cart ({cartCount})
                </Link>
              </Button>
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="h-9 font-bold text-xs px-4"
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm Pickup Order →'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
