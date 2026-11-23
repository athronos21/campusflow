'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Plus, ShieldCheck, Wrench, X, QrCode } from 'lucide-react';

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
  const [activePassBooking, setActivePassBooking] = useState<Booking | null>(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to schedule an appointment.');
      return;
    }

    const targetBizId = selectedBusinessId || (businesses.length > 0 ? businesses[0].id : '');
    if (!targetBizId) {
      setErrorMsg('No verified campus service merchant available for bookings.');
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await apiClient(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Editorial Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>Service 09 • Appointments & Campus Services</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Campus Service Appointments
              </h1>
              <p className="mt-2 text-slate-300 text-sm leading-relaxed max-w-2xl">
                Reserve timeslots for thesis printing, hardcover binding, dorm laundry, electronics repair, and document lamination with verified campus merchants.
              </p>
            </div>

            <Button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Book Appointment
            </Button>
          </div>
        </div>

        {/* Modal Dialog */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl bg-white border-slate-200">
              <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Request Service Appointment</CardTitle>
                  <CardDescription className="text-xs">
                    Choose a provider and select your preferred timeslot
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>

              <form onSubmit={handleCreateBooking}>
                <CardContent className="pt-5 space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {businesses.length > 0 && (
                    <div>
                      <Label className="text-xs">Select Campus Provider</Label>
                      <select
                        value={selectedBusinessId}
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                      >
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Service Type</Label>
                    <select
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                    >
                      <option value="Thesis Printing & Hardcover Binding">Thesis Printing & Hardcover Binding</option>
                      <option value="Laptop Diagnostic & Software Repair">Laptop Diagnostic & Software Repair</option>
                      <option value="Dorm Laundry & Ironing Service">Dorm Laundry & Ironing Service</option>
                      <option value="ID Card & Document Lamination">ID Card & Document Lamination</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Appointment Date & Time</Label>
                    <Input
                      type="datetime-local"
                      required
                      defaultValue="2026-11-20T14:00"
                      onChange={(e) => setBookingDate(new Date(e.target.value).toISOString())}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free reservation. Settlement occurs upon service delivery at the campus shop.</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Requesting...' : 'Confirm Appointment'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* Content Section */}
        {!user ? (
          <Card className="text-center py-16">
            <CardContent>
              <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold mb-1">Sign in to view your appointments</p>
              <p className="text-xs text-slate-500 mb-4">Keep track of your scheduled print jobs, repairs, and bookings.</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        ) : isLoading && bookings.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-medium">Checking scheduled appointments...</div>
        ) : bookings.length === 0 ? (
          <Card className="text-center py-16 text-slate-500">
            <CardContent>
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-800">No scheduled appointments</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Schedule your thesis binding, electronics repair, or campus laundry ahead of time to skip the line.
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>{bookings.length} Appointment{bookings.length > 1 ? 's' : ''} on Record</span>
            </div>

            {bookings.map((b) => (
              <Card key={b.id} className="hover:border-slate-300 transition shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <Badge
                          variant={
                            b.status === 'confirmed'
                              ? 'success'
                              : b.status === 'completed'
                              ? 'secondary'
                              : 'warning'
                          }
                        >
                          {b.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500 font-medium">
                          Ref: #{b.id.slice(0, 8)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{b.serviceName}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(b.startsAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(b.startsAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {b.business?.name || 'Haramaya Campus Hub'}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Guaranteed Slot
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActivePassBooking(b)}
                          className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Counter QR Pass
                        </Button>
                        {b.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelBooking(b.id)}
                            className="h-8 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 px-2"
                            title="Cancel Appointment"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Counter Pass QR Modal */}
        {activePassBooking && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm p-6 bg-white border-slate-200 shadow-2xl relative text-center space-y-4">
              <button
                onClick={() => setActivePassBooking(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <Badge variant="success" className="text-[10px] uppercase font-bold">
                  Verified Appointment
                </Badge>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {activePassBooking.serviceName}
                </h3>
                <p className="text-xs text-slate-500">
                  {activePassBooking.business?.name || 'Haramaya Campus Partner'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="w-36 h-36 mx-auto bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-center shadow-xs">
                  <QRCodeSVG
                    value={`CAMPUSFLOW:APPT:${activePassBooking.id}:${activePassBooking.serviceName}`}
                    size={120}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="font-mono text-xs font-bold text-indigo-700 bg-white py-1 rounded border border-slate-200">
                  REF: #{activePassBooking.id.slice(0, 8).toUpperCase()}
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Present this dynamic QR code at the counter for instant booking validation.
              </p>

              <Button
                onClick={() => setActivePassBooking(null)}
                className="w-full h-9 font-bold text-xs"
              >
                Done
              </Button>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
