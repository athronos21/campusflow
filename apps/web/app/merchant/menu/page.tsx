'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Menu & Catalog Management</h1>
          <p className="text-slate-600 mt-1">Manage items, pricing, and live availability for Haramaya Campus Cafe.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Add New Menu Item</Button>
      </div>

      {showAddModal && (
        <Card className="mb-8 p-6 border-indigo-200 bg-indigo-50/50">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Add New Item to Shop</h3>
          <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sambusa (Meat / Lentil)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Price (ETB)</label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="e.g. 20.00"
                value={newPriceETB}
                onChange={(e) => setNewPriceETB(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Freshly fried crispy pastry snack"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Item Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {uploadingFile && <p className="text-xs text-indigo-600 mt-1">Uploading photo...</p>}
              {uploadedImageUrl && <p className="text-xs text-emerald-600 mt-1">✓ Image uploaded successfully</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting || uploadingFile}>
                {isSubmitting ? 'Saving...' : 'Add Item to Menu'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && products.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading catalog...</div>
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-600 font-medium">No products in your catalog yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((item) => (
            <Card key={item.id} className="flex items-center justify-between py-4 shadow-sm p-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                <span className="text-sm font-black text-indigo-600 mt-1 block">
                  {formatETB(item.priceMinor)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={item.isAvailable ? 'success' : 'default'}>
                  {item.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}
                </Badge>
                <button
                  onClick={() => handleToggle(item.id, item.isAvailable)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition"
                >
                  {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
