'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { resolveMerchantBusinessId, type BusinessSummaryRef } from '@/lib/merchant-helpers';
import { Plus, Utensils } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceMinor: number | string;
  isAvailable: boolean;
}

export default function MerchantMenuPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPriceETB, setNewPriceETB] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const fetchProducts = useCallback(async () => {
    if (!businessId) return;
    try {
      setIsLoading(true);
      const data = await apiClient<Product[]>(`/products?businessId=${businessId}`);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) fetchProducts();
  }, [businessId, fetchProducts]);

  const handleToggle = async (productId: string, current: boolean) => {
    try {
      await apiClient(`/products/${productId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !current }),
      });
      toast({
        title: !current ? 'Item marked available' : 'Item marked out of stock',
        variant: 'success',
      });
      await fetchProducts();
    } catch (err: unknown) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Could not update availability',
        variant: 'error',
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      setIsSubmitting(true);
      const priceMinor = Math.round(parseFloat(newPriceETB) * 100);

      await apiClient(`/products/business/${businessId}`, {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          description: newDescription || undefined,
          priceMinor,
          currency: 'ETB',
          isAvailable: true,
        }),
      });

      setNewName('');
      setNewPriceETB('');
      setNewDescription('');
      setShowAddModal(false);
      toast({ title: 'Menu item added', variant: 'success' });
      await fetchProducts();
    } catch (err: unknown) {
      toast({
        title: 'Could not add item',
        description: err instanceof Error ? err.message : 'Save failed',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu & Catalog Management"
        description="Control items, student pricing, and live availability for your campus shop."
        action={
          <Button onClick={() => setShowAddModal(true)} disabled={!businessId}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Menu Item
          </Button>
        }
      />

      {isLoading && products.length === 0 ? (
        <LoadingState label="Loading catalog items..." count={2} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Utensils className="w-6 h-6" />}
          title="No items in your catalog yet"
          description="Add your foods, beverages, or retail items to start accepting student pre-orders."
          actionLabel={businessId ? 'Add First Item' : 'Register a Campus Shop'}
          actionHref={businessId ? undefined : '/merchant/register'}
          onAction={businessId ? () => setShowAddModal(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">
            {products.length} {products.length === 1 ? 'Item' : 'Items'} in Catalog
          </div>

          {products.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-bold text-foreground text-base">{item.name}</h2>
                    <Badge variant={item.isAvailable ? 'success' : 'muted'}>
                      {item.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                  <div className="font-mono text-base font-black text-foreground pt-1 tabular-nums">
                    {formatETB(item.priceMinor)}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(item.id, item.isAvailable)}
                  className={
                    item.isAvailable
                      ? 'text-amber-800 border-amber-200 hover:bg-amber-50'
                      : 'text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                  }
                >
                  {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Create a new product listing in your campus catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="menu-name" className="text-xs font-semibold">Item Name</Label>
              <Input
                id="menu-name"
                type="text"
                required
                placeholder="e.g. Sambusa (Meat / Lentil)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="menu-price" className="text-xs font-semibold">Price (ETB)</Label>
              <Input
                id="menu-price"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 25.00"
                value={newPriceETB}
                onChange={(e) => setNewPriceETB(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="menu-desc" className="text-xs font-semibold">Description (Optional)</Label>
              <Input
                id="menu-desc"
                type="text"
                placeholder="e.g. Freshly fried crispy pastry snack"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
