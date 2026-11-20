'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatETB } from '@/lib/utils';
import { Home, MapPin, Droplets, Zap, Wifi, Calendar, CheckCircle2, X } from 'lucide-react';

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

export default function HousingPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [myViewings, setMyViewings] = useState<ViewingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'my-viewings'>('listings');
  const [loading, setLoading] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Viewing Request Modal state
  const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null);
  const [viewingDate, setViewingDate] = useState('');
  const [studentPhone, setStudentPhone] = useState(user?.phone || '+251911002233');
  const [viewingMessage, setViewingMessage] = useState('');
  const [submittingViewing, setSubmittingViewing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchMyViewings();
    }
  }, [user]);

  async function fetchListings() {
    try {
      setLoading(true);
      const data = await apiClient.get<HousingListing[]>('/housing/listings');
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyViewings() {
    try {
      const data = await apiClient.get<ViewingRequest[]>('/housing/viewings/my');
      setMyViewings(data);
    } catch (err) {
      console.error('Failed to load viewing requests', err);
    }
  }

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

      setSuccessNotice(`Viewing requested for ${selectedListing.title}! The landlord will contact you shortly.`);
      setSelectedListing(null);
      setViewingMessage('');
      fetchMyViewings();
      setTimeout(() => setSuccessNotice(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit viewing request';
      alert(msg);
    } finally {
      setSubmittingViewing(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
              Haramaya & Bate Accommodation
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Student Housing & Dorms
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Verified off-campus single rooms, shared apartments, and studios near Main Gate and Bate.
            Audited for water reserves, backup generators, and WiFi connectivity.
          </p>
        </div>

        {successNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'listings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('listings')}
              className="h-9 font-bold text-xs"
            >
              Available Rooms ({listings.length})
            </Button>
            {user && (
              <Button
                variant={activeTab === 'my-viewings' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('my-viewings')}
                className="h-9 font-bold text-xs"
              >
                My Scheduled Viewings ({myViewings.length})
              </Button>
            )}
          </div>

          {activeTab === 'listings' && (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="text-slate-400 font-semibold mr-1">Type:</span>
              {['all', 'room', 'shared', 'studio', 'apartment'].map((type) => (
                <Button
                  key={type}
                  variant={propertyFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPropertyFilter(type)}
                  className="h-7 px-2.5 capitalize text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        {activeTab === 'listings' ? (
          loading ? (
            <div className="py-20 text-center text-slate-500 text-sm font-medium">
              Loading housing listings near Haramaya campus...
            </div>
          ) : filteredListings.length === 0 ? (
            <Card className="py-16 text-center border-slate-200">
              <Home className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">No accommodation listings match this filter.</p>
              <p className="text-slate-400 text-xs mt-1">Try another property type or check back soon.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden flex flex-col justify-between border-slate-200 hover:border-teal-400/60 hover:shadow-xs transition"
                >
                  <div>
                    <div className="relative h-44 bg-slate-100 w-full overflow-hidden">
                      {listing.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Home className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        <Badge variant="secondary" className="capitalize text-[10px] font-bold shadow-xs">
                          {listing.propertyType}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 line-clamp-1">{listing.title}</h3>
                        <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {listing.location}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {listing.description || 'Secure student room within walking distance to campus gates.'}
                      </p>

                      {/* Utilities */}
                      <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
                        <span
                          className={`flex items-center gap-1 ${listing.hasWater ? 'text-teal-700 font-semibold' : 'text-slate-300 line-through'}`}
                        >
                          <Droplets className="w-3.5 h-3.5" /> Water
                        </span>
                        <span
                          className={`flex items-center gap-1 ${listing.hasElectricity ? 'text-amber-700 font-semibold' : 'text-slate-300 line-through'}`}
                        >
                          <Zap className="w-3.5 h-3.5" /> Power
                        </span>
                        <span
                          className={`flex items-center gap-1 ${listing.hasWifi ? 'text-indigo-700 font-semibold' : 'text-slate-300 line-through'}`}
                        >
                          <Wifi className="w-3.5 h-3.5" /> WiFi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Rent</div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        {formatETB(listing.rentMinor)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!user) {
                          alert('Please sign in to schedule an in-person room viewing.');
                          return;
                        }
                        setSelectedListing(listing);
                      }}
                      className="h-8 font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Book Viewing
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* My Scheduled Viewings Tab */
          myViewings.length === 0 ? (
            <Card className="py-16 text-center border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">You have no scheduled viewings yet.</p>
              <p className="text-slate-400 text-xs mt-1">Explore available rooms above and schedule an in-person viewing.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {myViewings.map((req) => (
                <Card key={req.id} className="p-5 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{req.listing.title}</h4>
                      <Badge
                        variant={
                          req.status === 'accepted'
                            ? 'success'
                            : req.status === 'declined'
                            ? 'danger'
                            : 'warning'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.listing.location} &bull;{' '}
                      <span className="font-mono font-bold text-slate-700">
                        {formatETB(req.listing.rentMinor)} / mo
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Preferred Date:{' '}
                      <strong className="text-slate-800 font-mono">
                        {new Date(req.preferredDate).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Contact Phone: {req.studentPhone}</span>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </main>

      <Footer />

      {/* Viewing Request Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Schedule Room Viewing</CardTitle>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-900">{selectedListing.title}</p>
              <p className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedListing.location}
              </p>
              <p className="text-teal-800 font-bold font-mono">
                {formatETB(selectedListing.rentMinor)} / month
              </p>
            </div>

            <form onSubmit={handleRequestViewing} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="viewingDate" className="text-xs font-semibold text-slate-700">
                  Preferred Date & Time
                </Label>
                <Input
                  id="viewingDate"
                  type="datetime-local"
                  required
                  value={viewingDate}
                  onChange={(e) => setViewingDate(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="studentPhone" className="text-xs font-semibold text-slate-700">
                  Student Phone Number
                </Label>
                <Input
                  id="studentPhone"
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="+251911002233"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="viewingMessage" className="text-xs font-semibold text-slate-700">
                  Notes for Landlord (Optional)
                </Label>
                <textarea
                  id="viewingMessage"
                  rows={2}
                  value={viewingMessage}
                  onChange={(e) => setViewingMessage(e.target.value)}
                  placeholder="e.g. 3rd year Software Engineering student looking to move next month."
                  className="w-full text-xs p-2.5 rounded-md border border-input bg-transparent shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedListing(null)}
                  className="h-8 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingViewing}
                  size="sm"
                  className="h-8 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {submittingViewing ? 'Sending Request...' : 'Confirm Viewing'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
