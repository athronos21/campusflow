'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
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
import { formatETB } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import {
  Tag,
  Book,
  Smartphone,
  Bed,
  PenTool,
  Phone,
  Search,
  Plus,
  Loader2,
} from 'lucide-react';

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

const INITIAL_ITEMS: MarketplaceItem[] = [
  {
    id: 'mp-1',
    title: 'Calculus: Early Transcendentals (8th Ed)',
    category: 'textbooks',
    priceMinor: 45000, // 450.00 ETB
    condition: 'Like New',
    sellerName: 'Dawit Mengistu',
    sellerDorm: 'Block 42, Room 310',
    phone: '+251911223344',
    description: 'Clean textbook without highlights. Essential for Freshman engineering and mathematics courses.',
    createdAt: '2026-11-19T10:00:00.000Z',
  },
  {
    id: 'mp-2',
    title: 'Casio Scientific Calculator FX-991ES Plus',
    category: 'electronics',
    priceMinor: 65000, // 650.00 ETB
    condition: 'Good',
    sellerName: 'Selamawit Tadesse',
    sellerDorm: 'Block 18, Room 102',
    phone: '+251922334455',
    description: 'Original solar + battery dual power Casio calculator. Used for one semester in civil engineering.',
    createdAt: '2026-11-19T12:30:00.000Z',
  },
  {
    id: 'mp-3',
    title: 'Dorm Study Desk LED Lamp & Rechargeable Battery',
    category: 'dorm',
    priceMinor: 35000, // 350.00 ETB
    condition: 'Like New',
    sellerName: 'Ephrem Bekele',
    sellerDorm: 'Block 5, Room 114',
    phone: '+251933445566',
    description: 'Has 4-hour backup battery during campus power cuts. 3 adjustable brightness levels with USB-C charging.',
    createdAt: '2026-11-18T16:00:00.000Z',
  },
  {
    id: 'mp-4',
    title: 'Animal Genetics & Livestock Breeding Reference Book',
    category: 'textbooks',
    priceMinor: 30000, // 300.00 ETB
    condition: 'Good',
    sellerName: 'Chala Gemechu',
    sellerDorm: 'Block 24, Room 204',
    phone: '+251944556677',
    description: 'Required reading for College of Agriculture 3rd year students. Includes past exam summaries.',
    createdAt: '2026-11-18T09:15:00.000Z',
  },
  {
    id: 'mp-5',
    title: 'Folding Dorm Mattress & Washable Cover',
    category: 'dorm',
    priceMinor: 95000, // 950.00 ETB
    condition: 'Good',
    sellerName: 'Hanan Mohammed',
    sellerDorm: 'Block 12, Room 402',
    phone: '+251955667788',
    description: 'High-density foam mattress, comfortable for dorm bunk beds. Clean sanitized cover included.',
    createdAt: '2026-11-17T14:40:00.000Z',
  },
];

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>(INITIAL_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        setIsLoading(true);
        const data = await apiClient<any[]>('/products').catch(() => []);
        if (data && data.length > 0) {
          const mapped: MarketplaceItem[] = data.map((p) => {
            let cat: 'textbooks' | 'electronics' | 'dorm' | 'stationery' = 'stationery';
            const slug = (p.category?.slug || '').toLowerCase();
            const nameLower = (p.name || '').toLowerCase();
            if (slug.includes('textbook') || nameLower.includes('book') || nameLower.includes('calculus')) cat = 'textbooks';
            else if (slug.includes('tech') || slug.includes('electronic') || nameLower.includes('calculator') || nameLower.includes('lamp')) cat = 'electronics';
            else if (slug.includes('dorm') || nameLower.includes('bed') || nameLower.includes('mattress')) cat = 'dorm';

            return {
              id: p.id,
              title: p.name,
              category: cat,
              priceMinor: p.priceMinor,
              condition: 'Like New',
              sellerName: p.business?.name || 'Haramaya Campus Merchant',
              sellerDorm: 'Commercial & Student Center',
              phone: '+251 91 122 3344',
              description: p.description || 'Verified product listing on CampusFlow.',
              createdAt: p.createdAt,
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.error('Failed to load live marketplace items:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLiveProducts();
  }, []);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'textbooks' | 'electronics' | 'dorm' | 'stationery'>('textbooks');
  const [priceETB, setPriceETB] = useState('');
  const [condition, setCondition] = useState<'Like New' | 'Good' | 'Fair'>('Good');
  const [sellerName, setSellerName] = useState('');
  const [sellerDorm, setSellerDorm] = useState('Block 42, Room 204');
  const [phone, setPhone] = useState('+2519');
  const [description, setDescription] = useState('');

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
    setTitle('');
    setPriceETB('');
    setSellerName('');
    setDescription('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'textbooks':
        return <Book className="w-4 h-4 text-purple-600" />;
      case 'electronics':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'dorm':
        return <Bed className="w-4 h-4 text-amber-600" />;
      case 'stationery':
        return <PenTool className="w-4 h-4 text-emerald-600" />;
      default:
        return <Tag className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Peer Student Marketplace
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
              Buy and sell textbooks, calculators, dorm essentials, and electronics directly between Haramaya University students.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="font-bold flex items-center gap-2 self-start sm:self-center shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post Item for Sale</span>
          </Button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search textbooks, calculators, desk lamps, mattresses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-300 text-sm shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-8 rounded-full text-xs font-bold"
          >
            All Items ({items.length})
          </Button>
          <Button
            variant={selectedCategory === 'textbooks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('textbooks')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Book className="w-3.5 h-3.5 text-purple-600" /> Textbooks
          </Button>
          <Button
            variant={selectedCategory === 'electronics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('electronics')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" /> Electronics
          </Button>
          <Button
            variant={selectedCategory === 'dorm' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('dorm')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Bed className="w-3.5 h-3.5 text-amber-600" /> Dorm Essentials
          </Button>
          <Button
            variant={selectedCategory === 'stationery' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('stationery')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-600" /> Stationery
          </Button>
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-xs font-medium">Loading live campus marketplace items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              <p className="text-sm font-semibold">No marketplace items found</p>
              <p className="text-xs mt-1">Be the first to list a textbook, electronics, or dorm supply!</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col justify-between border-slate-200 hover:border-slate-300 hover:shadow-xs transition p-5"
              >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    {getCategoryIcon(item.category)}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {item.condition}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900">
                    {formatETB(item.priceMinor)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.sellerDorm}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {item.sellerName[0]}
                    </span>
                    <span className="truncate max-w-[110px]">{item.sellerName}</span>
                  </div>

                  <a
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline bg-primary/10 px-2.5 py-1.5 rounded-md transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Seller</span>
                  </a>
                </div>
              </div>
            </Card>
          )))}
        </div>
      </main>

      {/* Post Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              List Item on Campus Marketplace
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Direct peer-to-peer sale between verified Haramaya University students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="itemTitle" className="text-xs font-semibold uppercase text-slate-700">
                Item Title
              </Label>
              <Input
                id="itemTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio Scientific Calculator, Economics textbook"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold uppercase text-slate-700">
                  Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MarketplaceItem['category'])}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="textbooks">Textbooks</option>
                  <option value="electronics">Electronics</option>
                  <option value="dorm">Dorm Essentials</option>
                  <option value="stationery">Stationery</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="condition" className="text-xs font-semibold uppercase text-slate-700">
                  Condition
                </Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as MarketplaceItem['condition'])}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-semibold uppercase text-slate-700">
                Price (ETB)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={priceETB}
                onChange={(e) => setPriceETB(e.target.value)}
                placeholder="e.g. 450"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold uppercase text-slate-700">
                  Seller Name
                </Label>
                <Input
                  id="name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dorm" className="text-xs font-semibold uppercase text-slate-700">
                  Dorm Location
                </Label>
                <Input
                  id="dorm"
                  value={sellerDorm}
                  onChange={(e) => setSellerDorm(e.target.value)}
                  placeholder="Block 42, Room 204"
                  required
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase text-slate-700">
                Contact Phone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251911223344"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold uppercase text-slate-700">
                Item Description
              </Label>
              <textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe edition, working condition, accessories included..."
                required
                className="w-full p-2.5 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Publish Listing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
