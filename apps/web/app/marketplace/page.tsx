'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { Tag, Book, Smartphone, Bed, PenTool, Phone, Search, Plus } from 'lucide-react';

interface MarketplaceItem {
  id: string;
  title: string;
  category: 'textbooks' | 'electronics' | 'dorm' | 'stationery';
  priceMinor: number | string;
  condition: 'Like New' | 'Good' | 'Fair';
  sellerName: string;
  sellerDorm: string;
  phone: string;
  description: string;
  createdAt: string;
}

export default function MarketplacePage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MarketplaceItem['category']>('textbooks');
  const [priceETB, setPriceETB] = useState('');
  const [condition, setCondition] = useState<MarketplaceItem['condition']>('Good');
  const [sellerName, setSellerName] = useState('');
  const [sellerDorm, setSellerDorm] = useState('Block 42, Room 204');
  const [phone, setPhone] = useState('+2519');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        setIsLoading(true);
        const data = await apiClient<
          {
            id: string;
            name: string;
            priceMinor: number | string;
            description?: string;
            createdAt: string;
            category?: { slug?: string };
            business?: { name?: string };
          }[]
        >('/products').catch(() => []);
        if (data && data.length > 0) {
          const nonDining = data.filter((p) => {
            const biz = (p.business?.name || '').toLowerCase();
            const slug = (p.category?.slug || '').toLowerCase();
            const name = (p.name || '').toLowerCase();
            const isFood =
              biz.includes('cafe') ||
              biz.includes('snack') ||
              biz.includes('food') ||
              slug.includes('food') ||
              slug.includes('beverage') ||
              slug.includes('cafe') ||
              name.includes('buna') ||
              name.includes('ful') ||
              name.includes('coffee') ||
              name.includes('tea') ||
              name.includes('macchiato') ||
              name.includes('bread') ||
              name.includes('pastry');
            return !isFood;
          });

          const mapped: MarketplaceItem[] = nonDining.map((p) => {
            let cat: MarketplaceItem['category'] = 'stationery';
            const slug = (p.category?.slug || '').toLowerCase();
            const nameLower = (p.name || '').toLowerCase();
            if (slug.includes('textbook') || nameLower.includes('book') || nameLower.includes('calculus')) {
              cat = 'textbooks';
            } else if (
              slug.includes('tech') ||
              slug.includes('electronic') ||
              nameLower.includes('calculator') ||
              nameLower.includes('lamp')
            ) {
              cat = 'electronics';
            } else if (slug.includes('dorm') || nameLower.includes('bed') || nameLower.includes('mattress')) {
              cat = 'dorm';
            }

            return {
              id: p.id,
              title: p.name,
              category: cat,
              priceMinor: p.priceMinor,
              condition: 'Like New',
              sellerName: p.business?.name || 'Campus Student Seller',
              sellerDorm: 'Student Dormitory, Main Campus',
              phone: '+251 91 122 3344',
              description: p.description || 'Verified product listing on CampusFlow.',
              createdAt: p.createdAt,
            };
          });
          setItems(mapped);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load live marketplace items:', err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLiveProducts();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priceETB || !sellerName || !description) return;

    const priceMinor = Math.round(parseFloat(priceETB) * 100);

    const newItem: MarketplaceItem = {
      id: `mp-${Date.now().toString().slice(-4)}`,
      title,
      category,
      priceMinor,
      condition,
      sellerName,
      sellerDorm,
      phone,
      description,
      createdAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    toast({
      title: 'Listing posted',
      description: `${title} is now visible in your marketplace view.`,
      variant: 'success',
    });
    setTitle('');
    setPriceETB('');
    setSellerName('');
    setDescription('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'textbooks':
        return <Book className="w-4 h-4 text-primary" />;
      case 'electronics':
        return <Smartphone className="w-4 h-4 text-teal-700" />;
      case 'dorm':
        return <Bed className="w-4 h-4 text-secondary" />;
      case 'stationery':
        return <PenTool className="w-4 h-4 text-emerald-700" />;
      default:
        return <Tag className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <AppShell maxWidth="6xl">
      <div className="space-y-6">
        <PageHeader
          title="Peer Student Marketplace"
          description="Buy and sell textbooks, scientific calculators, dorm essentials, and electronics across Haramaya University."
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Post Item
            </Button>
          }
        />

        {/* Search & Category Pills */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
            <Input
              id="marketplace-search"
              name="q"
              type="text"
              placeholder="Search textbooks, calculators, desk lamps, mattresses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[
              { id: 'all', label: `All Items (${items.length})`, icon: null },
              { id: 'textbooks', label: 'Textbooks', icon: Book },
              { id: 'electronics', label: 'Electronics', icon: Smartphone },
              { id: 'dorm', label: 'Dorm Essentials', icon: Bed },
              { id: 'stationery', label: 'Stationery', icon: PenTool },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  type="button"
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 mr-1.5" />}
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Marketplace Grid */}
        {isLoading ? (
          <LoadingState label="Loading campus marketplace listings..." count={3} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Tag className="w-5 h-5" />}
            title="No marketplace items found"
            description="No listings match your current search or category. Post an item to share with students."
            actionLabel="Post Item"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="p-2 rounded-lg bg-muted border border-border shrink-0">
                      {getCategoryIcon(item.category)}
                    </span>
                    <Badge variant="outline">{item.condition}</Badge>
                  </div>

                  <h2 className="font-display font-bold text-base text-foreground leading-snug mb-1">
                    {item.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-lg font-black text-foreground tabular-nums">
                      {formatETB(item.priceMinor)}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">{item.sellerDorm}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium min-w-0">
                      <span className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                        {(item.sellerName.trim()[0] || 'S').toUpperCase()}
                      </span>
                      <span className="truncate">{item.sellerName}</span>
                    </div>

                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${item.phone}`}>
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-primary" /> Call Seller
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>List Item on Campus Marketplace</DialogTitle>
            <DialogDescription>
              Direct peer-to-peer listing for Haramaya University students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="itemTitle" className="text-xs font-semibold">
                Item Title
              </Label>
              <Input
                id="itemTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio Scientific Calculator, Economics textbook"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MarketplaceItem['category'])}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="textbooks">Textbooks</option>
                  <option value="electronics">Electronics</option>
                  <option value="dorm">Dorm Essentials</option>
                  <option value="stationery">Stationery</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="condition" className="text-xs font-semibold">
                  Condition
                </Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as MarketplaceItem['condition'])}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-semibold">
                Price (ETB)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={priceETB}
                onChange={(e) => setPriceETB(e.target.value)}
                placeholder="e.g. 450"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Seller Name
                </Label>
                <Input
                  id="name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dorm" className="text-xs font-semibold">
                  Dorm Location
                </Label>
                <Input
                  id="dorm"
                  value={sellerDorm}
                  onChange={(e) => setSellerDorm(e.target.value)}
                  placeholder="Block 42, Room 204"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Contact Phone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251911223344"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold">
                Item Description
              </Label>
              <textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe edition, working condition, accessories included..."
                required
                className="w-full p-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish Listing</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
