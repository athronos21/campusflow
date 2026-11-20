'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { Plus, Utensils, X, Upload } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceMinor: number | string;
  isAvailable: boolean;
}

export default function MerchantMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPriceETB, setNewPriceETB] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const businessId = '0bf3972e-20a4-4b29-b190-e67fb185118f';

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient<Product[]>(`/products?businessId=${businessId}`);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggle = async (productId: string, current: boolean) => {
    try {
      await apiClient(`/products/${productId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !current }),
      });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('campusflow_token') : null;
      const res = await fetch('http://localhost:4000/api/v1/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setUploadedImageUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const priceMinor = Math.round(parseFloat(newPriceETB) * 100);

      await apiClient(`/products/business/${businessId}`, {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          priceMinor,
          currency: 'ETB',
          isAvailable: true,
        }),
      });

      setNewName('');
      setNewPriceETB('');
      setNewDescription('');
      setUploadedImageUrl(null);
      setShowAddModal(false);
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Menu & Catalog Management</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Control items, student pricing, and live availability for Haramaya Campus Cafe.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Menu Item
        </Button>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-2xl bg-white border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Add New Menu Item</CardTitle>
                <CardDescription className="text-xs">
                  Create a new product listing in your campus cafe catalog
                </CardDescription>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <form onSubmit={handleCreate}>
              <CardContent className="pt-5 space-y-4">
                <div>
                  <Label className="text-xs">Item Name</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Sambusa (Meat / Lentil)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Price (ETB)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 25.00"
                    value={newPriceETB}
                    onChange={(e) => setNewPriceETB(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Description (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Freshly fried crispy pastry snack"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Item Photo (Optional)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs file:bg-indigo-50 file:text-indigo-700 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2"
                    />
                  </div>
                  {uploadingFile && <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1"><Upload className="w-3 h-3 animate-spin" /> Uploading photo...</p>}
                  {uploadedImageUrl && <p className="text-xs text-emerald-600 mt-1 font-semibold">✓ Image uploaded</p>}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || uploadingFile}>
                  {isSubmitting ? 'Saving...' : 'Add Item'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Catalog List */}
      {isLoading && products.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">Loading catalog items...</div>
      ) : products.length === 0 ? (
        <Card className="text-center py-16 text-slate-500">
          <CardContent>
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-800">No items in your catalog yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Add your foods, drinks, or retail items to start accepting student orders.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 font-semibold px-1">
            {products.length} Item{products.length > 1 ? 's' : ''} in Catalog
          </div>

          {products.map((item) => (
            <Card key={item.id} className="p-5 hover:border-slate-300 transition shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                    <Badge variant={item.isAvailable ? 'success' : 'secondary'}>
                      {item.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  )}
                  <div className="text-lg font-black text-slate-900 mt-2">
                    {formatETB(item.priceMinor)}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(item.id, item.isAvailable)}
                    className={item.isAvailable ? 'text-amber-700 border-amber-200 hover:bg-amber-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}
                  >
                    {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
