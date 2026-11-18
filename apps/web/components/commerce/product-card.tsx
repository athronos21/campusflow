import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { formatETB } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  priceMinor: number;
  businessName: string;
  onAddToCart?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  description,
  priceMinor,
  businessName,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="flex flex-col justify-between hover:border-indigo-200 transition">
      <div>
        <div className="text-xs text-indigo-600 font-medium mb-1">{businessName}</div>
        <h3 className="font-semibold text-slate-900 text-lg">{name}</h3>
        {description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{description}</p>}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="font-bold text-slate-900">{formatETB(priceMinor)}</span>
        <Button size="sm" onClick={() => onAddToCart?.(id)}>
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
