import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatETB } from '@/lib/utils';

export default function MerchantMenuPage() {
  const menuItems = [
    { id: '1', name: 'Special Buna (Coffee)', priceMinor: 2500, isAvailable: true },
    { id: '2', name: 'Ful with Egg and Bread', priceMinor: 8000, isAvailable: true },
    { id: '3', name: 'Sambusa (Lentil)', priceMinor: 2000, isAvailable: false },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Menu & Catalog</h1>
          <p className="text-slate-600 mt-1">Manage listings and instant stock availability.</p>
        </div>
        <Button>+ Add New Item</Button>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <Card key={item.id} className="flex items-center justify-between py-4">
            <div>
              <h3 className="font-semibold text-slate-900">{item.name}</h3>
              <span className="text-sm font-bold text-slate-700">{formatETB(item.priceMinor)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={item.isAvailable ? 'success' : 'default'}>
                {item.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}
              </Badge>
              <Button size="sm" variant="outline">
                {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
