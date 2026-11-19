'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatETB } from '@/lib/utils';
import Link from 'next/link';
import { Home, MapPin, Droplets, Zap, Wifi, Calendar, Phone, CheckCircle2 } from 'lucide-react';

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

  async function fetchMyMyViewingsInternal() {
    try {
      const data = await apiClient.get<ViewingRequest[]>('/housing/viewings/my');
      setMyViewings(data);
    } catch (err) {
      console.error('Failed to load viewing requests', err);
    }
  }

  function fetchMyViewings() {
    fetchMyMyViewingsInternal();
  }

  const filteredListings = propertyFilter === 'all'
    ? listings
    : listings.filter(l => l.propertyType === propertyFilter);

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
    } catch (err: any) {
      alert(err.message || 'Failed to submit viewing request');
    } finally {
      setSubmittingViewing(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-950 text-white rounded-2xl p-8 shadow-md">
        <div className="max-w-2xl">
          <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 mb-3">
            Service 05 • Student Housing & Accommodations
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Verified Off-Campus Student Housing</h1>
          <p className="mt-2 text-emerald-100/90 text-sm leading-relaxed">
            Find and inspect safe rooms, studios, and shared houses in Bate, Main Gate, and Haramaya Town with guaranteed water and power availability.
          </p>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successNotice}
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'listings'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Available Rooms ({listings.length})
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('my-viewings')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'my-viewings'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              My Scheduled Viewings ({myViewings.length})
            </button>
          )}
        </div>

        {activeTab === 'listings' && (
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-500">Filter:</span>
            {['all', 'room', 'shared', 'studio', 'apartment'].map((type) => (
              <button
                key={type}
                onClick={() => setPropertyFilter(type)}
                className={`px-2.5 py-1 rounded-md capitalize transition ${
                  propertyFilter === type
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      {activeTab === 'listings' ? (
        loading ? (
          <div className="py-20 text-center text-slate-500">Loading housing listings near campus...</div>
        ) : filteredListings.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-600 font-medium">No accommodation listings found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="relative h-44 bg-slate-100 w-full overflow-hidden rounded-lg mb-4">
                    {listing.imageUrl ? (
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
                    <div className="absolute top-2 right-2">
                      <Badge variant="success" className="bg-emerald-600 text-white font-bold border-none">
                        {listing.propertyType.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">{listing.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {listing.location}
                    </p>
                    {listing.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                    )}
                  </div>

                  {/* Amenities Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {listing.hasWater && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        <Droplets className="w-3 h-3 text-blue-500" /> Water Supply
                      </span>
                    )}
                    {listing.hasElectricity && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                        <Zap className="w-3 h-3 text-amber-500" /> Electricity
                      </span>
                    )}
                    {listing.hasWifi && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                        <Wifi className="w-3 h-3 text-purple-500" /> High-Speed WiFi
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Monthly Rent</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatETB(listing.rentMinor)}
                    </span>
                  </div>

                  {user ? (
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setViewingDate(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
                      }}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition"
                    >
                      Book Viewing
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                    >
                      Sign In to View
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* My Viewing Requests Tab */
        <div className="space-y-4">
          {myViewings.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-600 font-medium">You haven&apos;t scheduled any housing viewings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myViewings.map((viewing) => (
                <Card key={viewing.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-500">
                        Requested {new Date(viewing.createdAt).toLocaleDateString()}
                      </span>
                      <Badge
                        variant={
                          viewing.status === 'confirmed'
                            ? 'success'
                            : viewing.status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {viewing.status.toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{viewing.listing?.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {viewing.listing?.location}
                    </p>
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-lg text-xs space-y-1">
                      <p className="text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> <strong className="text-slate-900">Preferred Date:</strong>{' '}
                        {new Date(viewing.preferredDate).toLocaleString()}
                      </p>
                      <p className="text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" /> <strong className="text-slate-900">Contact Provided:</strong> {viewing.studentPhone}
                      </p>
                      {viewing.message && (
                        <p className="text-slate-500 italic mt-1">&quot;{viewing.message}&quot;</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Rent: {formatETB(viewing.listing?.rentMinor || 0)}/mo</span>
                    <span>Direct Call: {viewing.listing?.contactPhone}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Viewing Booking Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Schedule Room Viewing</h3>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-900">{selectedListing.title}</p>
              <p className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedListing.location}
              </p>
              <p className="text-emerald-700 font-bold mt-1">
                {formatETB(selectedListing.rentMinor)} / month
              </p>
            </div>

            <form onSubmit={handleRequestViewing} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={viewingDate}
                  onChange={(e) => setViewingDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="+251911002233"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes for Landlord (Optional)
                </label>
                <textarea
                  rows={2}
                  value={viewingMessage}
                  onChange={(e) => setViewingMessage(e.target.value)}
                  placeholder="e.g. 3rd year CS student looking to move next month."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingViewing}
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {submittingViewing ? 'Sending Request...' : 'Confirm Viewing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
