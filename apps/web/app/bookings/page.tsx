'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TicketStub } from '@/components/ui/ticket-stub';
import { LoadingState, EmptyState, AuthPromptCard } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { MapPin, Calendar, Clock, Plus, ShieldCheck, QrCode, X } from 'lucide-react';

interface Booking {
  id: string;
  serviceName: string;
  startsAt: string;
  status: string;
  business?: { name: string };
}

function getDefaultBookingInput(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00`;
}

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [serviceName, setServiceName] = useState('Thesis Printing & Hardcover Binding');
  const [bookingInput, setBookingInput] = useState<string>(getDefaultBookingInput);
  const [activePassBooking, setActivePassBooking] = useState<Booking | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const [bookingsData, bizData] = await Promise.all([
        apiClient<Booking[]>('/bookings/my-bookings').catch(() => []),
        apiClient<{ id: string; name: string }[]>('/businesses').catch(() => []),
      ]);
      setBookings(bookingsData);
      setBusinesses(bizData);
      if (bizData.length > 0) {
        setSelectedBusinessId((prev) => prev || bizData[0].id);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchBookings]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to schedule a campus appointment.',
        variant: 'warning',
      });
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
          startsAt: new Date(bookingInput).toISOString(),
        }),
      });
      setShowModal(false);
      toast({
        title: 'Appointment scheduled',
        description: `${serviceName} slot reserved.`,
        variant: 'success',
      });
      await fetchBookings();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to request booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancelBooking = async () => {
    if (!cancelBookingId) return;
    try {
      setIsSubmitting(true);
      await apiClient(`/bookings/${cancelBookingId}/cancel`, { method: 'PATCH' });
      setCancelBookingId(null);
      toast({ title: 'Appointment cancelled', variant: 'success' });
      await fetchBookings();
    } catch (err: unknown) {
      toast({
        title: 'Cancellation failed',
        description: err instanceof Error ? err.message : 'Failed to cancel appointment',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell maxWidth="5xl">
      <div className="space-y-6">
        <PageHeader
          title="Campus Service Appointments"
          description="Reserve timeslots for thesis printing, hardcover binding, dorm laundry, laptop diagnostics, and lamination."
          action={
            user ? (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Book Appointment
              </Button>
            ) : undefined
          }
        />

        {authLoading || (isLoading && bookings.length === 0) ? (
          <LoadingState label="Checking scheduled appointments..." count={2} />
        ) : !user ? (
          <AuthPromptCard
            title="Sign in to manage appointments"
            description="Reserve campus printing, repair, and laundry slots and keep your counter QR passes organized."
            returnTo="/bookings"
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No scheduled appointments"
            description="Schedule thesis binding, electronics repair, or campus laundry ahead of time to skip the queue."
            actionLabel="Book First Appointment"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-muted-foreground">
              {bookings.length} {bookings.length === 1 ? 'Appointment' : 'Appointments'} on Record
            </div>

            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          b.status === 'confirmed'
                            ? 'success'
                            : b.status === 'cancelled'
                            ? 'danger'
                            : b.status === 'completed'
                            ? 'default'
                            : 'warning'
                        }
                      >
                        {b.status.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        #{b.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-foreground text-base sm:text-lg">
                      {b.serviceName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(b.startsAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(b.startsAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {b.business?.name || 'Haramaya Campus Hub'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setActivePassBooking(b)}>
                      <QrCode className="w-3.5 h-3.5 mr-1.5 text-primary" /> Counter QR Pass
                    </Button>
                    {b.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCancelBookingId(b.id)}
                        className="text-destructive hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Booking Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Service Appointment</DialogTitle>
            <DialogDescription>
              Choose a verified campus provider and preferred timeslot.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBooking} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {businesses.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="booking-provider" className="text-xs font-semibold">
                  Campus Provider
                </Label>
                <select
                  id="booking-provider"
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="booking-service" className="text-xs font-semibold">
                Service Type
              </Label>
              <select
                id="booking-service"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Thesis Printing & Hardcover Binding">Thesis Printing &amp; Hardcover Binding</option>
                <option value="Laptop Diagnostic & Software Repair">Laptop Diagnostic &amp; Software Repair</option>
                <option value="Dorm Laundry & Ironing Service">Dorm Laundry &amp; Ironing Service</option>
                <option value="ID Card & Document Lamination">ID Card &amp; Document Lamination</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="booking-datetime" className="text-xs font-semibold">
                Appointment Date &amp; Time
              </Label>
              <Input
                id="booking-datetime"
                type="datetime-local"
                required
                value={bookingInput}
                onChange={(e) => setBookingInput(e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Free reservation. Payment settles at the campus shop counter upon completion.</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Requesting...' : 'Confirm Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Appointment QR Pass Dialog */}
      <Dialog
        open={Boolean(activePassBooking)}
        onOpenChange={(open) => {
          if (!open) setActivePassBooking(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Appointment Counter Pass</DialogTitle>
            <DialogDescription>Present this QR stub when checking in at the shop.</DialogDescription>
          </DialogHeader>

          {activePassBooking && (
            <TicketStub
              accent="ink"
              title={activePassBooking.serviceName}
              subtitle={activePassBooking.business?.name || 'Haramaya Campus Partner'}
              badge={<Badge variant="success">{activePassBooking.status.toUpperCase()}</Badge>}
              code={`APPT-${activePassBooking.id.slice(0, 8).toUpperCase()}`}
              qrValue={`CAMPUSFLOW:APPT:${activePassBooking.id}:${activePassBooking.serviceName}`}
              meta={[
                {
                  label: 'Date',
                  value: new Date(activePassBooking.startsAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }),
                },
                {
                  label: 'Time',
                  value: new Date(activePassBooking.startsAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ]}
            />
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setActivePassBooking(null)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(cancelBookingId)}
        onOpenChange={(open) => {
          if (!open) setCancelBookingId(null);
        }}
        title="Cancel service appointment?"
        description="This releases your reserved slot at the campus shop."
        confirmLabel="Cancel Appointment"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleConfirmCancelBooking}
      />
    </AppShell>
  );
}
