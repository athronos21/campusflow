'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  serviceName: string;
  startsAt: string;
  status: string;
  business?: { name: string };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [serviceName, setServiceName] = useState('Thesis Printing & Hardcover Binding');
  const [bookingDate, setBookingDate] = useState('2026-11-20T14:00:00.000Z');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Seeded business ID
  const businessId = '0bf3972e-20a4-4b29-b190-e67fb185118f';

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:4000/api/v1/bookings/my-bookings', {
        headers: {
          'Authorization': 'Bearer student-dev-token',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:4000/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer student-dev-token',
        },
        body: JSON.stringify({
          businessId,
          serviceName,
          startsAt: bookingDate,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        await fetchBookings();
      }
    } catch (err) {
      console.error(err);
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
            <form onSubmit={handleCreateBooking} className="space-y-4 max-w-lg">
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

        {isLoading && bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading appointments...</div>
        ) : bookings.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-600 font-medium">You don't have any booked appointments yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id} className="flex items-center justify-between shadow-sm">
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
