'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Booking {
  id: string;
  serviceName: string;
  startsAt: string;
  status: string;
  business?: { name: string };
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [serviceName, setServiceName] = useState('Thesis Printing & Hardcover Binding');
  const [bookingDate, setBookingDate] = useState('2026-11-20T14:00:00.000Z');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const [bookingsData, bizData] = await Promise.all([
        apiClient<Booking[]>('/bookings/my-bookings').catch(() => []),
        apiClient<{ id: string; name: string }[]>('/businesses').catch(() => []),
      ]);
      setBookings(bookingsData);
      setBusinesses(bizData);
      if (bizData.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(bizData[0].id);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to schedule an appointment.');
      return;
    }

    const targetBizId = selectedBusinessId || (businesses.length > 0 ? businesses[0].id : '');
    if (!targetBizId) {
      setErrorMsg('No verified service merchant available for bookings.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await apiClient('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          businessId: targetBizId,
          serviceName,
          startsAt: bookingDate,
        }),
      });

      setShowModal(false);
      await fetchBookings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Campus Appointments</h1>
            <p className="text-slate-600 mt-1">Book services such as print binding, tech repairs, and laundry.</p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Request Service Appointment</Button>
        </div>

        {showModal && (
          <Card className="mb-8 p-6 border-indigo-200 bg-white shadow-md">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Request Service Appointment</h3>
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateBooking} className="space-y-4 max-w-lg">
              {businesses.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Select Campus Merchant / Provider
                  </label>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        🏪 {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Service</label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Thesis Printing & Hardcover Binding">Thesis Printing & Hardcover Binding</option>
                  <option value="Laptop Diagnostic & Software Repair">Laptop Diagnostic & Software Repair</option>
                  <option value="Dorm Laundry & Ironing Service">Dorm Laundry & Ironing Service</option>
                  <option value="ID Card & Document Lamination">ID Card & Document Lamination</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Appointment Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  onChange={(e) => setBookingDate(new Date(e.target.value).toISOString())}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Requesting...' : 'Submit Booking'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {!user ? (
          <Card className="text-center py-12">
            <p className="text-slate-600 font-medium mb-3">Please sign in to view and manage your appointments.</p>
            <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold inline-block">
              Sign In →
            </Link>
          </Card>
        ) : isLoading && bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading appointments...</div>
        ) : bookings.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-600 font-medium">You don't have any booked appointments yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id} className="flex items-center justify-between shadow-sm p-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-base">{b.serviceName}</span>
                    <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Scheduled for: {new Date(b.startsAt).toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-slate-400">📍 Haramaya Campus Hub</span>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
