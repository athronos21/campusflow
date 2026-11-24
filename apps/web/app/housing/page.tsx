'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Home, MapPin, Droplets, Zap, Wifi, Calendar } from 'lucide-react';

interface Landlord {
  displayName: string;
  phone?: string | null;
  email?: string | null;
}

interface HousingListing {
  id: string;
  campusId: string;
  title: string;
  description?: string | null;
  location: string;
  propertyType: 'room' | 'shared' | 'studio' | 'apartment';
  rentMinor: string;
  currency: string;
  hasWater: boolean;
  hasElectricity: boolean;
  hasWifi: boolean;
  contactPhone: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  landlord?: Landlord;
}

interface ViewingRequest {
  id: string;
  listingId: string;
  studentPhone: string;
  preferredDate: string;
  message?: string | null;
  status: string;
  createdAt: string;
  listing: HousingListing;
}

function getTomorrowMorningInput(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:00`;
}

export default function HousingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [listings, setListings] = useState<HousingListing[]>([]);
  const [myViewings, setMyViewings] = useState<ViewingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'my-viewings'>('listings');
  const [loading, setLoading] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null);
  const [viewingDate, setViewingDate] = useState(getTomorrowMorningInput);
  const [studentPhone, setStudentPhone] = useState(user?.phone || '');
  const [viewingMessage, setViewingMessage] = useState('');
  const [submittingViewing, setSubmittingViewing] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<HousingListing[]>('/housing/listings');
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyViewings = useCallback(async () => {
    try {
      const data = await apiClient.get<ViewingRequest[]>('/housing/viewings/my');
      setMyViewings(data);
    } catch (err) {
      console.error('Failed to load viewing requests', err);
    }
  }, []);

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchMyViewings();
      if (user.phone) setStudentPhone(user.phone);
    }
  }, [user, fetchListings, fetchMyViewings]);

  const filteredListings =
    propertyFilter === 'all'
      ? listings
      : listings.filter((l) => l.propertyType === propertyFilter);

  async function handleRequestViewing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedListing) return;

    try {
      setSubmittingViewing(true);
      await apiClient.post('/housing/viewings', {
        listingId: selectedListing.id,
        preferredDate: new Date(viewingDate).toISOString(),
        studentPhone,
        message: viewingMessage,
      });

      toast({
        title: 'Viewing requested',
        description: `The landlord for ${selectedListing.title} will contact you shortly.`,
        variant: 'success',
      });
      setSelectedListing(null);
      setViewingMessage('');
      fetchMyViewings();
    } catch (err: unknown) {
      toast({
        title: 'Request failed',
        description: err instanceof Error ? err.message : 'Failed to submit viewing request',
        variant: 'error',
      });
    } finally {
      setSubmittingViewing(false);
    }
  }

  return (
    <AppShell maxWidth="6xl">
      <div className="space-y-6">
        <PageHeader
          title="Student Housing & Dorms"
          description="Verified off-campus rooms, shared apartments, and studios near Haramaya Main Gate and Bate, audited for water, power, and WiFi."
          badge={<Badge variant="info">Zero Broker Fees</Badge>}
        />

        {/* Tabs & Type Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={activeTab === 'listings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('listings')}
            >
              Available Rooms ({listings.length})
            </Button>
            {user && (
              <Button
                type="button"
                variant={activeTab === 'my-viewings' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('my-viewings')}
              >
                My Viewings ({myViewings.length})
              </Button>
            )}
          </div>

          {activeTab === 'listings' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'room', 'shared', 'studio', 'apartment'].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={propertyFilter === type ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setPropertyFilter(type)}
                  className="capitalize rounded-full"
                >
                  {type}
                </Button>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'listings' ? (
          loading ? (
            <LoadingState label="Loading verified housing listings..." count={3} />
          ) : filteredListings.length === 0 ? (
            <EmptyState
              icon={<Home className="w-5 h-5" />}
              title="No accommodation listings match this filter"
              description="Try another property type or check back shortly."
              actionLabel="Show All Property Types"
              onAction={() => setPropertyFilter('all')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 bg-muted w-full overflow-hidden border-b border-border">
                      {listing.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Home className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="capitalize bg-card/95">
                          {listing.propertyType}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h2 className="font-display font-bold text-base text-foreground line-clamp-1">
                          {listing.title}
                        </h2>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {listing.location}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {listing.description || 'Secure student room within walking distance to campus gates.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-border">
                        <span
                          className={`flex items-center gap-1 ${
                            listing.hasWater ? 'text-teal-800 font-semibold' : 'text-muted-foreground/50 line-through'
                          }`}
                        >
                          <Droplets className="w-3.5 h-3.5" /> Water
                        </span>
                        <span
                          className={`flex items-center gap-1 ${
                            listing.hasElectricity ? 'text-amber-800 font-semibold' : 'text-muted-foreground/50 line-through'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" /> Power
                        </span>
                        <span
                          className={`flex items-center gap-1 ${
                            listing.hasWifi ? 'text-primary font-semibold' : 'text-muted-foreground/50 line-through'
                          }`}
                        >
                          <Wifi className="w-3.5 h-3.5" /> WiFi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3 bg-muted/25">
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">Monthly Rent</div>
                      <div className="font-mono text-base font-black text-foreground tabular-nums">
                        {formatETB(listing.rentMinor)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: 'Sign in required',
                            description: 'Please sign in to schedule an in-person room viewing.',
                            variant: 'warning',
                          });
                          return;
                        }
                        setSelectedListing(listing);
                      }}
                    >
                      Book Viewing
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : myViewings.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-5 h-5" />}
            title="No scheduled viewings yet"
            description="Browse available rooms and request an in-person walkthrough with a verified landlord."
            actionLabel="Browse Available Rooms"
            onAction={() => setActiveTab('listings')}
          />
        ) : (
          <div className="space-y-3">
            {myViewings.map((req) => (
              <Card
                key={req.id}
                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-base text-foreground">{req.listing.title}</h3>
                    <Badge
                      variant={
                        req.status === 'accepted'
                          ? 'success'
                          : req.status === 'declined'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {req.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {req.listing.location} &bull;{' '}
                    <span className="font-mono font-bold text-foreground tabular-nums">
                      {formatETB(req.listing.rentMinor)} / mo
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Preferred:{' '}
                    <span className="font-mono font-semibold text-foreground">
                      {new Date(req.preferredDate).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="text-xs font-mono text-muted-foreground">Phone: {req.studentPhone}</div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Viewing Request Dialog */}
      <Dialog
        open={Boolean(selectedListing)}
        onOpenChange={(open) => {
          if (!open) setSelectedListing(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Room Viewing</DialogTitle>
            <DialogDescription>
              {selectedListing
                ? `${selectedListing.title} • ${selectedListing.location} • ${formatETB(selectedListing.rentMinor)}/mo`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestViewing} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="viewingDate" className="text-xs font-semibold">
                Preferred Date &amp; Time
              </Label>
              <Input
                id="viewingDate"
                type="datetime-local"
                required
                value={viewingDate}
                onChange={(e) => setViewingDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentPhone" className="text-xs font-semibold">
                Student Phone Number
              </Label>
              <Input
                id="studentPhone"
                type="tel"
                required
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="+251911002233"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="viewingMessage" className="text-xs font-semibold">
                Notes for Landlord (Optional)
              </Label>
              <textarea
                id="viewingMessage"
                rows={3}
                value={viewingMessage}
                onChange={(e) => setViewingMessage(e.target.value)}
                placeholder="e.g. 3rd year Software Engineering student looking to move next month."
                className="w-full text-sm p-3 rounded-lg border border-input bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedListing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingViewing}>
                {submittingViewing ? 'Sending...' : 'Confirm Viewing'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
