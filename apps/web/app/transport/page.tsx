'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
import { formatETB } from '@/lib/utils';
import { TripDto, TicketReservationDto } from '@campusflow/contracts';
import {
  Bus,
  Ticket,
  MapPin,
  Navigation,
  Clock,
  Smartphone,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Copy,
} from 'lucide-react';

export default function TransportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'trips' | 'tickets'>('trips');
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [userTickets, setUserTickets] = useState<TicketReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');

  // Seat Booking Dialog State
  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  const [tripDetails, setTripDetails] = useState<{ occupiedSeats?: number[] } | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'telebirr' | 'cbe_birr' | 'cash_at_station'>('telebirr');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<TicketReservationDto | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment Dialog State
  const [payModalTicket, setPayModalTicket] = useState<TicketReservationDto | null>(null);
  const [payData, setPayData] = useState<{
    amountMinor?: number | string;
    providerReference: string;
    ussdDial: string;
    checkoutUrl?: string;
  } | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  // Cancel Confirm Dialog State
  const [cancelTicketId, setCancelTicketId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<TripDto[]>('/transport/trips');
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserTickets = useCallback(async () => {
    try {
      const data = await apiClient<TicketReservationDto[]>('/transport/reservations/my');
      setUserTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    if (user) {
      fetchUserTickets();
      setPassengerName(user.displayName || '');
      if (user.phone) setPassengerPhone(user.phone);
    }
  }, [user, fetchTrips, fetchUserTickets]);

  async function openSeatPicker(trip: TripDto) {
    setSelectedTrip(trip);
    setTripDetails(null);
    setSelectedSeat(null);
    setConfirmedReservation(null);
    setErrorMsg('');
    try {
      const details = await apiClient<{ occupiedSeats?: number[] }>(`/transport/trips/${trip.id}`);
      setTripDetails(details);
    } catch (err) {
      console.error('Failed to load seat details:', err);
    }
  }

  async function handleBookSeat() {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to reserve a shuttle seat.',
        variant: 'warning',
      });
      setSelectedTrip(null);
      router.push('/login?next=/transport');
      return;
    }
    if (!selectedTrip) return;
    if (!selectedSeat) {
      setErrorMsg('Please select an available seat number.');
      return;
    }
    if (!passengerName.trim() || !passengerPhone.trim()) {
      setErrorMsg('Please enter passenger full name and contact phone number.');
      return;
    }

    setBookingLoading(true);
    setErrorMsg('');

    try {
      const res = await apiClient<TicketReservationDto>('/transport/reservations', {
        method: 'POST',
        body: JSON.stringify({
          tripId: selectedTrip.id,
          seatNumber: selectedSeat,
          passengerName,
          passengerPhone,
          paymentProvider,
        }),
      });

      setConfirmedReservation(res);
      toast({
        title: `Seat #${res.seatNumber} reserved`,
        description: 'Your QR boarding stub is ready.',
        variant: 'success',
      });
      fetchTrips();
      fetchUserTickets();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to complete reservation');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleConfirmCancelTicket() {
    if (!cancelTicketId) return;
    setCancelLoading(true);
    try {
      await apiClient(`/transport/reservations/${cancelTicketId}/cancel`, { method: 'POST' });
      setCancelTicketId(null);
      toast({
        title: 'Reservation cancelled',
        description: 'Your seat has been released back to the departure pool.',
        variant: 'success',
      });
      fetchUserTickets();
      fetchTrips();
    } catch (err: unknown) {
      toast({
        title: 'Cancellation failed',
        description: err instanceof Error ? err.message : 'Could not cancel ticket',
        variant: 'error',
      });
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleInitiateTicketPayment(ticket: TicketReservationDto) {
    setPayModalTicket(ticket);
    setPayData(null);
    setPayLoading(true);
    try {
      const res = await apiClient<{
        amountMinor?: number | string;
        providerReference: string;
        ussdDial: string;
        checkoutUrl?: string;
      }>('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          reservationId: ticket.id,
          provider: 'telebirr',
        }),
      });
      setPayData(res);
    } catch (err: unknown) {
      setPayModalTicket(null);
      toast({
        title: 'Payment initiation failed',
        description: err instanceof Error ? err.message : 'Could not start payment',
        variant: 'error',
      });
    } finally {
      setPayLoading(false);
    }
  }

  async function handleConfirmMockPayment(ref: string) {
    setPayLoading(true);
    try {
      await apiClient(`/payments/verify/${ref}`, { method: 'POST' });
      setPayModalTicket(null);
      setPayData(null);
      toast({
        title: 'Ticket confirmed',
        description: 'Telebirr payment verified. Ready for terminal boarding.',
        variant: 'success',
      });
      fetchUserTickets();
    } catch (err: unknown) {
      toast({
        title: 'Verification failed',
        description: err instanceof Error ? err.message : 'Could not verify payment',
        variant: 'error',
      });
    } finally {
      setPayLoading(false);
    }
  }

  const filteredTrips = trips.filter((t) => {
    if (selectedDestination === 'all') return true;
    return t.route.destination.toLowerCase() === selectedDestination.toLowerCase();
  });

  return (
    <AppShell maxWidth="6xl">
      <div className="space-y-6">
        <PageHeader
          title="Haramaya Shuttle & Regional Coaches"
          description="Verified student buses, minibuses, and intercity coaches to Dire Dawa, Harar, and Addis Ababa with digital QR boarding stubs."
          badge={
            <Badge variant="secondary">
              <ShieldCheck className="w-3 h-3" /> Fixed Student Tariff
            </Badge>
          }
        />

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          <Button
            type="button"
            variant={activeTab === 'trips' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('trips')}
          >
            <Bus className="w-4 h-4 mr-1.5" /> Available Departures ({trips.length})
          </Button>
          <Button
            type="button"
            variant={activeTab === 'tickets' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tickets')}
          >
            <Ticket className="w-4 h-4 mr-1.5" /> My Boarding Passes ({userTickets.length})
          </Button>
        </div>

        {activeTab === 'trips' ? (
          <div className="space-y-5">
            {/* Destination Filter Strip */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground mr-1">Destination:</span>
                {[
                  { id: 'all', label: 'All Routes' },
                  { id: 'Dire Dawa', label: 'Dire Dawa (~50m)' },
                  { id: 'Harar', label: 'Harar (~30m)' },
                  { id: 'Addis Ababa', label: 'Addis Ababa (Coach)' },
                ].map((dest) => (
                  <Button
                    key={dest.id}
                    type="button"
                    size="sm"
                    variant={selectedDestination.toLowerCase() === dest.id.toLowerCase() ? 'secondary' : 'outline'}
                    onClick={() => setSelectedDestination(dest.id)}
                    className="rounded-full"
                  >
                    {dest.label}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-mono font-bold text-foreground">{filteredTrips.length}</span> scheduled trips
              </div>
            </div>

            {loading ? (
              <LoadingState label="Loading scheduled departures..." count={3} />
            ) : filteredTrips.length === 0 ? (
              <EmptyState
                icon={<Bus className="w-5 h-5" />}
                title="No departures for this destination"
                description="No scheduled vehicles matched this route filter."
                actionLabel="Show All Routes"
                onAction={() => setSelectedDestination('all')}
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrips.map((trip) => {
                  const depDate = new Date(trip.departureTime);
                  const isLowSeats = trip.availableSeats <= 3;

                  return (
                    <Card key={trip.id} className="flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Badge variant="outline">{trip.operator?.name || 'Campus Shuttle'}</Badge>
                          <Badge variant={isLowSeats ? 'danger' : 'success'}>
                            {trip.availableSeats} seats left
                          </Badge>
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="truncate">{trip.route.origin}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-primary truncate">{trip.route.destination}</span>
                        </CardTitle>
                        <CardDescription className="text-xs space-y-1 pt-1">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" /> {trip.route.departureStation}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 shrink-0" /> {trip.route.arrivalStation}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> ~{trip.route.estimatedDurationMin} mins
                            {trip.route.distanceKm ? ` • ${trip.route.distanceKm} km` : ''}
                          </span>
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pb-4">
                        <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vehicle</span>
                            <span className="font-semibold text-foreground">{trip.vehicleType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Departure</span>
                            <span className="font-mono font-bold text-foreground tabular-nums">
                              {depDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &bull;{' '}
                              {depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] text-muted-foreground font-medium">Fare per seat</div>
                          <div className="font-mono text-lg font-black text-foreground tabular-nums">
                            {formatETB(trip.priceMinor)}
                          </div>
                        </div>
                        <Button
                          disabled={trip.availableSeats === 0}
                          variant="secondary"
                          onClick={() => openSeatPicker(trip)}
                        >
                          {trip.availableSeats === 0 ? 'Sold Out' : 'Select Seat'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : !user ? (
          <AuthPromptCard
            title="Sign in to view your boarding passes"
            description="Access your reserved seats, dynamic QR boarding stubs, and Telebirr payment status."
            returnTo="/transport"
          />
        ) : userTickets.length === 0 ? (
          <EmptyState
            icon={<Ticket className="w-5 h-5" />}
            title="No transport reservations yet"
            description="Choose an upcoming departure to reserve a seat and generate a QR boarding pass."
            actionLabel="Browse Scheduled Trips"
            onAction={() => setActiveTab('trips')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {userTickets.map((ticket) => {
              const depDate = ticket.trip ? new Date(ticket.trip.departureTime) : null;
              const isPaid = ticket.paymentStatus === 'paid';
              const isCancelled = ticket.status === 'cancelled';

              return (
                <div key={ticket.id} className={`space-y-2.5 ${isCancelled ? 'opacity-65' : ''}`}>
                  <TicketStub
                    accent={isCancelled ? 'ink' : 'primary'}
                    title={`${ticket.trip?.route.origin || 'Haramaya'} → ${ticket.trip?.route.destination || 'Destination'}`}
                    subtitle={`${ticket.trip?.operator.name || 'Campus Shuttle'} • Seat #${ticket.seatNumber}`}
                    badge={
                      <Badge variant={isCancelled ? 'danger' : isPaid ? 'success' : 'warning'}>
                        {isCancelled ? 'CANCELLED' : isPaid ? 'CONFIRMED' : 'PAYMENT PENDING'}
                      </Badge>
                    }
                    code={ticket.qrCode}
                    qrValue={`CAMPUSFLOW:BUS:${ticket.qrCode}:SEAT${ticket.seatNumber}`}
                    meta={[
                      { label: 'Passenger', value: `${ticket.passengerName} (${ticket.passengerPhone})` },
                      {
                        label: 'Departure',
                        value: depDate
                          ? depDate.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Scheduled',
                      },
                      { label: 'Terminal', value: ticket.trip?.route.departureStation || 'Main Gate' },
                      { label: 'Fare', value: formatETB(ticket.amountMinor) },
                    ]}
                    footerRight={
                      <div className="flex items-center gap-2">
                        {!isPaid && !isCancelled && (
                          <Button size="sm" variant="secondary" onClick={() => handleInitiateTicketPayment(ticket)}>
                            <Smartphone className="w-3.5 h-3.5 mr-1" /> Pay Telebirr
                          </Button>
                        )}
                        {!isCancelled && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCancelTicketId(ticket.id)}
                            className="text-destructive border-rose-200 hover:bg-rose-50"
                          >
                            Cancel Seat
                          </Button>
                        )}
                      </div>
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seat Picker Dialog */}
      <Dialog
        open={Boolean(selectedTrip)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTrip(null);
            setConfirmedReservation(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          {selectedTrip && confirmedReservation ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <DialogTitle>Seat #{confirmedReservation.seatNumber} Reserved</DialogTitle>
                <DialogDescription className="mt-1">
                  Confirmed on {selectedTrip.operator?.name || 'Campus Shuttle'}. Present this QR stub when boarding.
                </DialogDescription>
              </div>

              <TicketStub
                accent="primary"
                title={`${selectedTrip.route.origin} → ${selectedTrip.route.destination}`}
                subtitle={`${selectedTrip.route.departureStation} • Seat #${confirmedReservation.seatNumber}`}
                badge={<Badge variant="success">RESERVED</Badge>}
                code={confirmedReservation.qrCode}
                qrValue={`CAMPUSFLOW:BUS:${confirmedReservation.qrCode}:SEAT${confirmedReservation.seatNumber}`}
                meta={[
                  { label: 'Passenger', value: confirmedReservation.passengerName },
                  { label: 'Total Fare', value: formatETB(confirmedReservation.amountMinor) },
                ]}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTrip(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedTrip(null);
                    setActiveTab('tickets');
                  }}
                >
                  View My Boarding Passes
                </Button>
              </DialogFooter>
            </div>
          ) : selectedTrip ? (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  Select Seat &bull; {selectedTrip.route.origin} &rarr; {selectedTrip.route.destination}
                </DialogTitle>
                <DialogDescription>
                  {selectedTrip.vehicleType} &bull; Fare per seat:{' '}
                  <span className="font-mono font-bold text-foreground">{formatETB(selectedTrip.priceMinor)}</span>
                </DialogDescription>
              </DialogHeader>

              {errorMsg && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-border bg-card inline-block" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-primary inline-block" /> Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-muted inline-block" /> Occupied
                  </span>
                </div>

                <div className="rounded-t-lg border border-border bg-muted px-3 py-2 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1.5">
                  <Bus className="w-3.5 h-3.5" /> Driver Cabin (Front)
                </div>

                <div className="grid grid-cols-4 gap-2 rounded-b-lg border border-t-0 border-border bg-muted/35 p-3 max-h-52 overflow-y-auto">
                  {Array.from({ length: selectedTrip.totalSeats }, (_, i) => i + 1).map((seatNum) => {
                    const isOccupied = tripDetails?.occupiedSeats?.includes(seatNum);
                    const isSelected = selectedSeat === seatNum;

                    return (
                      <button
                        key={seatNum}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedSeat(seatNum)}
                        className={`min-h-[44px] rounded-lg font-mono text-xs font-bold transition-colors flex items-center justify-center ${
                          isOccupied
                            ? 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border text-foreground hover:border-primary'
                        }`}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="passenger-name" className="text-xs font-semibold">
                    Passenger Name
                  </Label>
                  <Input
                    id="passenger-name"
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Tigist Haile"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="passenger-phone" className="text-xs font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="passenger-phone"
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="+2519..."
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="payment-provider" className="text-xs font-semibold">
                    Payment Method
                  </Label>
                  <select
                    id="payment-provider"
                    value={paymentProvider}
                    onChange={(e) => setPaymentProvider(e.target.value as 'telebirr' | 'cbe_birr' | 'cash_at_station')}
                    className="w-full h-11 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="telebirr">Telebirr (Instant mobile payment)</option>
                    <option value="cbe_birr">CBE Birr</option>
                    <option value="cash_at_station">Cash at Campus Departure Gate</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedTrip(null)}>
                  Cancel
                </Button>
                <Button type="button" disabled={bookingLoading} onClick={handleBookSeat}>
                  {bookingLoading
                    ? 'Reserving...'
                    : `Confirm Seat ${selectedSeat ? `#${selectedSeat}` : ''} • ${formatETB(selectedTrip.priceMinor)}`}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Telebirr Ticket Payment Dialog */}
      <Dialog
        open={Boolean(payModalTicket)}
        onOpenChange={(open) => {
          if (!open) {
            setPayModalTicket(null);
            setPayData(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Telebirr Ticket Settlement</DialogTitle>
            <DialogDescription>
              {payModalTicket
                ? `Fare: ${formatETB(payData?.amountMinor ?? payModalTicket.amountMinor)}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          {payLoading && !payData ? (
            <LoadingState label="Initializing Telebirr checkout..." count={1} />
          ) : payData ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Reference</span>
                  <code className="font-mono font-bold text-foreground">{payData.providerReference}</code>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5">
                  <span className="font-mono font-black text-primary text-sm select-all">{payData.ussdDial}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(payData.ussdDial).catch(() => null);
                      toast({ title: 'USSD dial string copied', variant: 'success' });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Dial the USSD code on your phone or use the pilot verification button below.
                </p>
                {payData.checkoutUrl && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={payData.checkoutUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Telebirr Web Pay
                    </a>
                  </Button>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPayModalTicket(null);
                    setPayData(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  disabled={payLoading}
                  onClick={() => handleConfirmMockPayment(payData.providerReference)}
                >
                  {payLoading ? 'Verifying...' : 'Simulate Verified Payment'}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Cancel Ticket Confirmation */}
      <ConfirmDialog
        open={Boolean(cancelTicketId)}
        onOpenChange={(open) => {
          if (!open) setCancelTicketId(null);
        }}
        title="Cancel ticket reservation?"
        description="Your reserved seat will be released immediately for other students."
        confirmLabel="Cancel Seat"
        variant="destructive"
        isLoading={cancelLoading}
        onConfirm={handleConfirmCancelTicket}
      />
    </AppShell>
  );
}
