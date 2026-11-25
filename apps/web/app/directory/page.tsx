'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { apiClient } from '@/lib/api-client';
import {
  Megaphone,
  Coffee,
  Printer,
  Laptop,
  MapPin,
  Search,
  CheckCircle2,
  ChevronRight,
  Store,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  priceMinor: number | string;
}

interface Business {
  id: string;
  campusId: string;
  name: string;
  description: string | null;
  status: string;
  products: Product[];
}

interface Campus {
  id: string;
  name: string;
  slug: string;
  city: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

function DirectoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const campusData = await apiClient<Campus[]>('/campuses');
      setCampuses(campusData);

      const activeCampus = campusData[0]?.id || '';
      setSelectedCampus(activeCampus);

      if (activeCampus) {
        const [bizData, annData] = await Promise.all([
          apiClient<Business[]>(`/businesses?campusId=${activeCampus}`),
          apiClient<Announcement[]>(`/announcements?campusId=${activeCampus}`).catch(() => []),
        ]);
        setBusinesses(bizData);
        setAnnouncements(annData);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to reach campus directory API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCampusChange = async (campusId: string) => {
    setSelectedCampus(campusId);
    try {
      setIsLoading(true);
      setLoadError(null);
      const [bizData, annData] = await Promise.all([
        apiClient<Business[]>(`/businesses?campusId=${campusId}`),
        apiClient<Announcement[]>(`/announcements?campusId=${campusId}`).catch(() => []),
      ]);
      setBusinesses(bizData);
      setAnnouncements(annData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load shops for this campus');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      (b.products && b.products.some((p) => p.name.toLowerCase().includes(q)));

    if (!matchesSearch) return false;

    const hay = `${b.name} ${b.description || ''}`.toLowerCase();
    if (selectedCategory === 'food') {
      return hay.includes('cafe') || hay.includes('snack') || hay.includes('food') || hay.includes('restaurant') || hay.includes('buna');
    }
    if (selectedCategory === 'stationery') {
      return hay.includes('print') || hay.includes('stationery') || hay.includes('book');
    }
    if (selectedCategory === 'tech') {
      return hay.includes('tech') || hay.includes('electronic') || hay.includes('laptop') || hay.includes('phone') || hay.includes('repair');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Directory & Shops"
        description="Verified cafeterias, printing centers, and campus supply stores across Haramaya University."
        badge={<Badge variant="success">Haramaya Pilot</Badge>}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/merchant/register">
              <Store className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Register a Shop
            </Link>
          </Button>
        }
      />

      {announcements.length > 0 && (
        <div className="p-4 bg-primary-50/70 border border-primary/25 rounded-xl flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="default">Campus Notice</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(announcements[0].createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="font-display font-bold text-foreground text-sm mt-1">{announcements[0].title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{announcements[0].body}</p>
          </div>
        </div>
      )}

      {/* Search & Campus Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {campuses.length > 0 && (
            <select
              aria-label="Filter by campus"
              value={selectedCampus}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="h-11 px-3.5 rounded-lg border border-input text-sm font-semibold bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
            <Input
              id="directory-search"
              name="q"
              type="text"
              placeholder="Search food, coffee, thesis printing, stationery, electronics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: 'all', label: `All Merchants (${businesses.length})`, icon: null },
            { id: 'food', label: 'Food & Cafeteria', icon: Coffee },
            { id: 'stationery', label: 'Printing & Stationery', icon: Printer },
            { id: 'tech', label: 'Tech & Electronics', icon: Laptop },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                type="button"
                variant={active ? 'default' : 'outline'}
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

      {/* Business Grid */}
      {isLoading ? (
        <LoadingState label="Loading verified campus shops..." count={4} />
      ) : loadError ? (
        <EmptyState
          icon={<Store className="w-5 h-5 text-destructive" />}
          title="Could not load campus directory"
          description={loadError}
          actionLabel="Retry"
          onAction={loadInitialData}
        />
      ) : filteredBusinesses.length === 0 ? (
        <EmptyState
          icon={<Store className="w-5 h-5" />}
          title="No verified shops match your filter"
          description="Try clearing your search term or switching back to all merchant categories."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBusinesses.map((b) => (
            <Card
              key={b.id}
              className="flex flex-col justify-between hover:border-primary/45 transition-colors p-5 sm:p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-display font-bold text-lg text-foreground">{b.name}</h2>
                  <Badge variant="success" className="shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {b.description || 'Verified campus partner providing student meals, beverages, and supplies.'}
                </p>

                {b.products && b.products.length > 0 && (
                  <div className="space-y-1.5 mb-4 pt-3 border-t border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Popular Items
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {b.products.slice(0, 4).map((p) => (
                        <span
                          key={p.id}
                          className="inline-block text-[11px] bg-muted border border-border text-foreground px-2 py-0.5 rounded font-medium"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5" /> Main Campus &bull; Bate
                </span>
                <Button size="sm" asChild>
                  <Link href={`/shop/${b.id}`} className="inline-flex items-center gap-1">
                    View Menu <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <AppShell maxWidth="6xl">
      <Suspense fallback={<LoadingState label="Loading directory..." count={4} />}>
        <DirectoryContent />
      </Suspense>
    </AppShell>
  );
}
