'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Order {
  id: string;
  status: string;
  totalMinor: number;
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
          apiClient<Order[]>(`/orders/business/${businessId}`),
          apiClient<any[]>(`/products?businessId=${businessId}`),
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

  if (isLoading) {
    return (
      <div className="text-center py-12 text-slate-500 font-medium">
        Loading merchant metrics for Haramaya Campus Cafe...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Merchant Dashboard</h1>
          <p className="text-slate-600 mt-1">Daily overview of campus orders and completed sales for Haramaya Campus Cafe.</p>
        </div>
        <Link
          href="/merchant/orders"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition shadow-sm"
        >
          Open Live Order Queue →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{formatETB(completedRevenue)}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            ✓ {orders.filter((o) => o.status === 'completed').length} completed orders
          </span>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Queue</span>
          <p className="text-3xl font-black text-indigo-600 mt-2">{activeOrdersCount}</p>
          <span className="text-xs text-slate-500 mt-1 block">Pending preparation or pickup</span>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Menu Items</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{productsCount}</p>
          <span className="text-xs text-slate-500 mt-1 block">Visible in student marketplace</span>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg text-slate-900 mb-2">Pilot Operational Guidelines</h3>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
          <li>Confirm payment at physical pickup before marking the order <strong>Completed</strong>.</li>
          <li>Mark orders <strong>Ready for Pickup</strong> as soon as food/coffee is packaged to avoid student crowds.</li>
          <li>Toggle unavailable items off from the <strong>Menu & Catalog</strong> tab if ingredients run out.</li>
        </ul>
      </Card>
    </div>
  );
}
