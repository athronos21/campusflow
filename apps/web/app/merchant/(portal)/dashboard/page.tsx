'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { resolveMerchantBusinessId, partitionMerchantOrders, type BusinessSummaryRef } from '@/lib/merchant-helpers';
import { ShoppingBag, ArrowRight, Utensils, CheckCircle2, AlertCircle, TrendingUp, Clock, Store } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  totalMinor: number;
  createdAt?: string;
}

export default function MerchantDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [businessName, setBusinessName] = useState<string>('Campus Shop');
  const [noBusiness, setNoBusiness] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const campuses = await apiClient<{ id: string }[]>('/campuses').catch(() => []);
        const campusId = campuses[0]?.id;
        const bizList = campusId
          ? await apiClient<(BusinessSummaryRef & { name: string })[]>(`/businesses?campusId=${campusId}`).catch(() => [])
          : await apiClient<(BusinessSummaryRef & { name: string })[]>('/businesses').catch(() => []);

        const resolvedId = resolveMerchantBusinessId(bizList, user?.id);
        if (!resolvedId) {
          setNoBusiness(true);
          return;
        }

        const matched = bizList.find((b) => b.id === resolvedId);
        if (matched?.name) setBusinessName(matched.name);

        const [ordersData, prodData] = await Promise.all([
          apiClient<Order[]>(`/orders/business/${resolvedId}`).catch(() => []),
          apiClient<unknown[]>(`/products?businessId=${resolvedId}`).catch(() => []),
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
  }, [user?.id]);

  const completedRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'ready')
    .reduce((sum, o) => sum + o.totalMinor, 0);

  const { activeOrders } = partitionMerchantOrders(orders);
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchant Dashboard"
        description={`Live orders, sales metrics, and menu status for ${businessName}.`}
        action={
          <Button asChild>
            <Link href="/merchant/orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Open Live Queue
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading merchant metrics..." count={3} />
      ) : noBusiness ? (
        <EmptyState
          icon={<Store className="w-6 h-6" />}
          title="No verified shop assigned yet"
          description="Submit a shop application and await System Admin approval before operating your merchant dashboard."
          actionLabel="Register a Campus Shop"
          actionHref="/merchant/register"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>Gross Sales</span>
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl sm:text-3xl font-black text-foreground tabular-nums">
                  {formatETB(completedRevenue)}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completedCount} fulfilled orders</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary-50/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>Active Queue</span>
                  <Clock className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl sm:text-3xl font-black text-primary tabular-nums">
                  {activeOrders.length}
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  Pending, accepted, preparing, or ready for pickup
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>Menu Catalog</span>
                  <Utensils className="w-4 h-4 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl sm:text-3xl font-black text-foreground tabular-nums">
                  {productsCount}
                </p>
                <Link href="/merchant/menu" className="text-xs font-semibold text-primary hover:underline mt-2 inline-block">
                  Manage Menu Items &rarr;
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Kitchen Protocols
                </CardTitle>
                <CardDescription className="text-xs">
                  Fast-track steps for peak lecture-break hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>
                  Keep audio chimes enabled in <strong>Live Order Queue</strong> to hear incoming student orders immediately.
                </p>
                <p>
                  Mark orders as <strong>Ready for Pickup</strong> as soon as boxed so students arrive at the counter with their QR stub.
                </p>
                <p>
                  Toggle out-of-stock dishes immediately in <strong>Menu &amp; Catalog</strong> to prevent unfulfillable pre-orders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Payment Settlement
                </CardTitle>
                <CardDescription className="text-xs">
                  Telebirr &amp; cash pickup reconciliation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Telebirr &amp; CBE Birr</span>
                    <Badge variant="success">Auto-Reconciled</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Prepaid orders settle directly in integer ETB cents.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Cash at Pickup</span>
                    <Badge variant="secondary">Manual Check</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Collect cash before marking the order completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
