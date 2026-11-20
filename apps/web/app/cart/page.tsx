'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatETB } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Bus, Package, Coffee, Printer, Footprints, Info, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, totalMinor, itemCount, businessName, businessId, campusId } =
    useCart();

  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'express'>('pickup');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !businessId || !campusId) return;

    if (!user) {
      alert('Please sign in or create an account to place an order.');
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const orderPayload = {
        campusId,
        businessId,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        notes: specialInstructions ? `[${fulfillmentType.toUpperCase()}] ${specialInstructions}` : undefined,
      };

      await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      clearCart();
      router.push('/orders');
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Pickup Cart</h1>
            <p className="text-slate-600 text-sm mt-1">
              Direct counter pickup & dorm handoff orders at Haramaya University.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Cart
            </Button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <Card className="text-center py-16 shadow-sm">
            <CardContent>
              <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">Your pickup cart is empty</h2>
              <p className="text-slate-600 max-w-md mx-auto text-sm mb-8 leading-relaxed">
                Order fresh foods, buna, printing binding, or book scheduled bus shuttles across Harar and Dire Dawa.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/directory">
                  <Button className="font-bold">
                    Browse Campus Directory <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/transport">
                  <Button variant="outline" className="font-semibold">
                    <Bus className="w-4 h-4 mr-1.5 text-amber-600" /> Bus Shuttles
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="font-semibold">
                    <Package className="w-4 h-4 mr-1.5 text-slate-600" /> View Past Orders
                  </Button>
                </Link>
              </div>

              {/* Quick Merchant Recommendations */}
              <div className="mt-12 pt-8 border-t border-slate-100 text-left max-w-2xl mx-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Popular Verified Campus Spots
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/directory"
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Coffee className="w-4 h-4 text-amber-600" /> Haramaya Campus Cafe
                      </h4>
                      <p className="text-xs text-slate-500">Fresh Buna, Ful, Sambusa, Tea</p>
                    </div>
                    <span className="text-indigo-600 text-sm font-bold">Order →</span>
                  </Link>
                  <Link
                    href="/directory"
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Printer className="w-4 h-4 text-indigo-600" /> Afras Campus Stationery
                      </h4>
                      <p className="text-xs text-slate-500">Thesis Binding, Hardcover, Print</p>
                    </div>
                    <span className="text-indigo-600 text-sm font-bold">Order →</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Merchant Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                    Ordering From Verified Merchant
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{businessName}</h3>
                </div>
                <Badge variant="secondary" className="bg-slate-800 text-indigo-300 font-bold">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              {/* Items Card */}
              <Card className="divide-y divide-slate-100 p-0 overflow-hidden shadow-sm">
                {items.map((item) => {
                  const lineTotal = Number(item.priceMinor) * item.quantity;
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">{formatETB(item.priceMinor)} each</div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition text-sm"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-900 w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Subtotal & Remove */}
                      <div className="text-right">
                        <div className="font-black text-slate-900 text-sm">{formatETB(lineTotal)}</div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 mt-0.5 font-medium transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Card>

              {/* Fulfillment Options */}
              <Card className="p-5 space-y-4 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm">Fulfillment Mode</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      fulfillmentType === 'pickup'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-amber-600" /> Counter Pickup
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-normal">Collect at shop counter</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('express')}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      fulfillmentType === 'express'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <Footprints className="w-4 h-4 text-indigo-600" /> Dorm Handoff
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-normal">Meet at designated dorm gate</div>
                  </button>
                </div>

                <div>
                  <Label className="text-xs">Order Instructions / Special Requests (Optional)</Label>
                  <Input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Extra hot coffee, double sugar, or block 24 gate"
                    className="mt-1"
                  />
                </div>
              </Card>
            </div>

            {/* Right: Order Summary & Checkout */}
            <div className="space-y-4">
              <Card className="p-6 space-y-4 shadow-sm">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal ({itemCount})</span>
                    <span className="font-bold text-slate-900">{formatETB(totalMinor)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Campus Platform Fee</span>
                    <span className="font-bold text-emerald-600">0.00 ETB (Free)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Prep Time</span>
                    <span className="font-bold text-slate-900">10 – 15 mins</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600">{formatETB(totalMinor)}</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Precision ETB:</strong> All monetary values are settled directly as integer minor units in Ethiopian Birr.
                  </div>
                </div>

                <Button
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 shadow-md transition"
                >
                  {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order →'}
                </Button>

                <p className="text-[11px] text-center text-slate-400">
                  By confirming, you agree to CampusFlow terms and merchant preparation policies.
                </p>
              </Card>

              <div className="text-center">
                <Link
                  href="/directory"
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition inline-block"
                >
                  ← Back to Directory
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
