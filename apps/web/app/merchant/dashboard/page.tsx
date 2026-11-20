'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Utensils, CheckCircle2, AlertCircle, TrendingUp, Clock } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  totalMinor: number;
  createdAt?: string;
}

export default function MerchantDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsCount, setProductsCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const businessId = '0bf3972e-20a4-4b29-b190-e67fb185118f';

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const [ordersData, prodData] = await Promise.all([
          apiClient<Order[]>(`/orders/business/${businessId}`).catch(() => []),
          apiClient<any[]>(`/products?businessId=${businessId}`).catch(() => []),
        ]);
        setOrders(ordersData);
        setProductsCount(prodData.length);
      } catch (err) {
        console.error('Failed to load merchant metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const completedRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'ready')
    .reduce((sum, o) => sum + o.totalMinor, 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const completedCount = orders.filter((o) => o.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 font-medium">
        Loading merchant metrics for Haramaya Campus Cafe...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Merchant Dashboard</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Live orders, sales metrics, and catalog status for Haramaya Campus Cafe.
          </p>
        </div>
        <Link href="/merchant/orders">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Open Live Order Queue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900">{formatETB(completedRevenue)}</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedCount} fulfilled orders</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-indigo-200 bg-indigo-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Queue</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-indigo-600">{activeOrdersCount}</p>
            <span className="text-xs text-slate-500 font-medium mt-2 block">
              Pending preparation or student pickup
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menu Catalog</span>
              <Utensils className="w-4 h-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900">{productsCount}</p>
            <span className="text-xs text-slate-500 font-medium mt-2 block">
              Active items visible in student store
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Operational Guidelines & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              Kitchen Operational Guidelines
            </CardTitle>
            <CardDescription className="text-xs">
              Fast-track protocols for high-volume campus lunch hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <p>
                Keep audio chimes turned on in the <strong>Live Order Queue</strong> to hear sound notifications when new orders arrive.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <p>
                Mark orders as <strong>Ready for Pickup</strong> as soon as food is boxed so students receive push notifications and arrive promptly.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <p>
                If ingredients run out during peak hours, immediately toggle the item off in <strong>Menu & Catalog</strong> to prevent order backlog.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Merchant Payment Settlement
            </CardTitle>
            <CardDescription className="text-xs">
              Telebirr & cash reconciliation summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Direct Mobile Telebirr</span>
                <Badge variant="success">Auto-Reconciled</Badge>
              </div>
              <p className="text-slate-500 text-[11px]">
                Prepaid orders are confirmed instantly and routed to your verified merchant phone number.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Campus Gate / Pickup Cash</span>
                <Badge variant="secondary">Manual Verification</Badge>
              </div>
              <p className="text-slate-500 text-[11px]">
                Collect physical cash from the student before tapping &quot;Mark as Completed&quot; on the queue screen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
