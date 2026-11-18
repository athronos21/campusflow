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
      } catch (err: any) {
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
        1
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
    } catch (err: any) {
      setOrderError(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <Navbar />
        <div className="text-center py-24 text-slate-500 font-medium">Loading shop details...</div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <Navbar />
        <div className="text-center py-24">
          <h2 className="text-xl font-bold text-slate-900">Shop Not Found</h2>
          <Link href="/directory" className="text-indigo-600 text-sm mt-2 inline-block">
            ← Return to Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full pb-32">
        <div className="mb-6">
          <Link href="/directory" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            ← Back to Directory
          </Link>
          <div className="flex items-center justify-between mt-3">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{business.name}</h1>
              <p className="text-slate-600 text-sm mt-1">{business.description}</p>
            </div>
            <Badge variant="success">✓ VERIFIED PARTNER</Badge>
          </div>
        </div>

        {orderError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm">
            {orderError}
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-900 mb-4">Available Menu & Items</h2>

        <div className="space-y-4">
          {business.products.map((product) => {
            const qty = cart[product.id] || 0;

            return (
              <Card key={product.id} className="flex items-center justify-between shadow-sm p-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{product.description}</p>
                  )}
                  <span className="font-black text-indigo-600 text-lg mt-2 block">
                    {formatETB(product.priceMinor)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {qty > 0 && (
                    <>
                      <button
                        onClick={() => handleRemoveItem(product)}
                        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-lg transition"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 w-6 text-center">{qty}</span>
                    </>
                  )}
                  <button
                    onClick={() => handleAddItem(product)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm"
                  >
                    {qty > 0 ? '+ Add More' : 'Add to Cart'}
                  </button>
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
              <div className="text-xs text-slate-500 uppercase font-semibold">
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in pickup cart
              </div>
              <div className="text-2xl font-black text-slate-900">{formatETB(totalMinor)}</div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/cart">
                <Button variant="outline" size="lg" className="font-semibold border-slate-300">
                  Review Cart ({cartCount}) 🛒
                </Button>
              </Link>
              <Button
                size="lg"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-semibold shadow-md"
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
