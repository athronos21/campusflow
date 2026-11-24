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
    <Card className="p-5 flex flex-col justify-between hover:border-primary/40 transition-colors">
      <div>
        <div className="text-xs text-primary font-semibold mb-1">{businessName}</div>
        <h3 className="font-display font-bold text-foreground text-base">{name}</h3>
        {description && (
          <p className="text-muted-foreground text-xs mt-1 line-clamp-2 leading-relaxed">{description}</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-foreground tabular-nums">{formatETB(priceMinor)}</span>
        <Button size="sm" onClick={() => onAddToCart?.(id)}>
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
