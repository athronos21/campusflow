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
import { formatETB } from '@/lib/utils';
import { TripDto, TicketReservationDto } from '@campusflow/contracts';
import { Bus, Ticket, MapPin, Navigation, Clock, Smartphone, CheckCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function TransportPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trips' | 'tickets'>('trips');
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [userTickets, setUserTickets] = useState<TicketReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');

  // Seat Booking Modal State
  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  const [tripDetails, setTripDetails] = useState<any | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'telebirr' | 'cbe_birr' | 'cash_at_station'>('telebirr');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<TicketReservationDto | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Telebirr Pay Modal State
  const [payModalTicket, setPayModalTicket] = useState<TicketReservationDto | null>(null);
  const [payData, setPayData] = useState<any | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    fetchTrips();
    if (user) {
      fetchUserTickets();
      setPassengerName(user.displayName || '');
    }
  }, [user]);

  async function fetchTrips() {
    setLoading(true);
    try {
      const data = await apiClient<TripDto[]>('/transport/trips');
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserTickets() {
    try {
      const data = await apiClient<TicketReservationDto[]>('/transport/reservations/my');
      setUserTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  }

  async function openSeatPicker(trip: TripDto) {
    setSelectedTrip(trip);
    setSelectedSeat(null);
    setConfirmedReservation(null);
    setErrorMsg('');
    try {
      const details = await apiClient<any>(`/transport/trips/${trip.id}`);
      setTripDetails(details);
    } catch (err) {
      console.error('Failed to load seat details:', err);
    }
  }

  async function handleBookSeat() {
    if (!user) {
      alert('Please sign in to reserve a seat.');
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
      fetchTrips();
      fetchUserTickets();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete reservation');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancelTicket(ticketId: string) {
    if (!confirm('Are you sure you want to cancel this ticket reservation?')) return;
    try {
      await apiClient(`/transport/reservations/${ticketId}/cancel`, { method: 'POST' });
      alert('Reservation cancelled and seat released.');
      fetchUserTickets();
      fetchTrips();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  }

  async function handleInitiateTicketPayment(ticket: TicketReservationDto) {
    setPayModalTicket(ticket);
    setPayLoading(true);
    try {
      const res = await apiClient<any>('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          reservationId: ticket.id,
          provider: 'telebirr',
        }),
      });
      setPayData(res);
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setPayLoading(false);
    }
  }

  async function handleConfirmMockPayment(ref: string) {
    setPayLoading(true);
    try {
      await apiClient<any>(`/payments/verify/${ref}`, { method: 'POST' });
      alert('Payment verified! Your ticket is now officially CONFIRMED.');
      setPayModalTicket(null);
      setPayData(null);
      fetchUserTickets();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setPayLoading(false);
    }
  }

  const filteredTrips = trips.filter((t) => {
    if (selectedDestination === 'all') return true;
    return t.route.destination.toLowerCase() === selectedDestination.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Editorial Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Bus className="w-4 h-4" />
                <span>Service 02 • Campus & Intercity Transport</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Haramaya Shuttle & Regional Coaches
              </h1>
              <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                Book verified student buses, minibuses, and intercity coaches departing directly from Haramaya University terminal to Dire Dawa, Harar, and Addis Ababa. Real-time seat allocation with digital QR boarding passes.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 self-start md:self-auto">
              <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-white">Verified Carriers</div>
                <div className="text-slate-400">Fixed student tariff • Cash or Telebirr</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'trips'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bus className="w-4 h-4" /> Available Trips ({trips.length})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-4 h-4" /> My Boarding Passes ({userTickets.length})
          </button>
        </div>

        {activeTab === 'trips' && (
          <div>
            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Destination:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'All Routes' },
                    { id: 'Dire Dawa', label: 'Dire Dawa (~50m)' },
                    { id: 'Harar', label: 'Harar (~30m)' },
                    { id: 'Addis Ababa', label: 'Addis Ababa (Coach)' },
                  ].map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedDestination(dest.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedDestination.toLowerCase() === dest.id.toLowerCase()
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Showing <span className="font-bold text-slate-900">{filteredTrips.length}</span> scheduled departures
              </div>
            </div>

            {/* Trips Grid */}
            {loading ? (
              <div className="text-center py-20 text-slate-500 font-medium">Loading scheduled departures...</div>
            ) : filteredTrips.length === 0 ? (
              <Card className="text-center py-16 text-slate-500">
                <CardContent className="pt-6">
                  <p className="font-medium">No trips scheduled for the selected destination.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSelectedDestination('all')}>
                    View All Destinations
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrips.map((trip) => {
                  const depDate = new Date(trip.departureTime);
                  const isLowSeats = trip.availableSeats <= 3;
                  return (
                    <Card key={trip.id} className="flex flex-col justify-between hover:border-slate-300 transition shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="font-bold">
                            {trip.operator.name}
                          </Badge>
                          <Badge variant={isLowSeats ? 'danger' : 'success'}>
                            {trip.availableSeats} seats left
                          </Badge>
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span>{trip.route.origin}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-indigo-600">{trip.route.destination}</span>
                        </CardTitle>
                        <CardDescription className="text-xs space-y-1 pt-1">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {trip.route.departureStation}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {trip.route.arrivalStation}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> ~{trip.route.estimatedDurationMin} mins {trip.route.distanceKm ? `• ${trip.route.distanceKm} km` : ''}
                          </span>
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="py-2">
                        <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span className="text-slate-500">Vehicle Type</span>
                            <span className="font-semibold text-slate-800">{trip.vehicleType}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span className="text-slate-500">Departure</span>
                            <span className="font-bold text-indigo-700">
                              {depDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fare per seat</div>
                          <div className="text-xl font-black text-slate-900">{formatETB(trip.priceMinor)}</div>
                        </div>
                        <Button
                          disabled={trip.availableSeats === 0}
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
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div>
            {!user ? (
              <Card className="text-center py-16">
                <CardContent>
                  <p className="text-slate-600 font-medium mb-4">Please sign in to view your tickets and boarding passes.</p>
                  <Link href="/login">
                    <Button>Sign In</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : userTickets.length === 0 ? (
              <Card className="text-center py-16 text-slate-500">
                <CardContent>
                  <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-700">You have no booked transport tickets yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Select an upcoming departure above to reserve a campus shuttle seat.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('trips')}>
                    Browse Scheduled Trips
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userTickets.map((ticket) => {
                  const depDate = ticket.trip ? new Date(ticket.trip.departureTime) : null;
                  const isPaid = ticket.paymentStatus === 'paid';
                  const isCancelled = ticket.status === 'cancelled';

                  return (
                    <Card
                      key={ticket.id}
                      className={`shadow-sm transition ${isCancelled ? 'opacity-60 bg-slate-50' : 'bg-white'}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge variant="outline" className="font-bold">
                                {ticket.trip?.operator.name || 'Campus Shuttle'}
                              </Badge>
                              <Badge
                                variant={
                                  isCancelled
                                    ? 'danger'
                                    : ticket.status === 'confirmed'
                                    ? 'success'
                                    : 'warning'
                                }
                              >
                                {ticket.status.toUpperCase()}
                              </Badge>
                              <Badge variant={isPaid ? 'success' : 'secondary'}>
                                {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <span>{ticket.trip?.route.origin}</span>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <span className="text-indigo-600">{ticket.trip?.route.destination}</span>
                            </h3>
                          </div>

                          <div className="text-left md:text-right">
                            <div className="text-2xl font-black text-indigo-600">Seat #{ticket.seatNumber}</div>
                            <div className="text-xs text-slate-400 font-mono tracking-wider">{ticket.qrCode}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-medium">Passenger</span>
                            <span className="font-bold text-slate-800">{ticket.passengerName}</span>
                            <div className="text-[11px] text-slate-500">{ticket.passengerPhone}</div>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Departure Terminal</span>
                            <span className="font-bold text-slate-800">{ticket.trip?.route.departureStation}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Schedule</span>
                            <span className="font-bold text-slate-800">
                              {depDate
                                ? depDate.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Total Fare</span>
                            <span className="font-black text-slate-900 text-sm">{formatETB(ticket.amountMinor)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Boarding Token:</span>
                            <code className="text-xs font-mono font-bold bg-slate-100 text-indigo-700 px-2 py-1 rounded border border-slate-200">
                              {ticket.qrCode}
                            </code>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isPaid && !isCancelled && (
                              <Button
                                size="sm"
                                onClick={() => handleInitiateTicketPayment(ticket)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Smartphone className="w-3.5 h-3.5 mr-1.5" /> Pay with Telebirr
                              </Button>
                            )}
                            {!isCancelled && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelTicket(ticket.id)}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                Cancel Seat
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Seat Picker & Booking Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {confirmedReservation ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Seat Reserved!</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Your seat <span className="font-bold text-indigo-600">#{confirmedReservation.seatNumber}</span> is reserved on {selectedTrip.operator.name}.
                </p>

                {/* Digital Ticket Card */}
                <div className="border-2 border-dashed border-indigo-200 rounded-xl p-5 bg-indigo-50/50 mb-6 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">CampusFlow Boarding Pass</span>
                    <Badge variant="success">SEAT #{confirmedReservation.seatNumber}</Badge>
                  </div>
                  <div className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>{selectedTrip.route.origin}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="text-indigo-600">{selectedTrip.route.destination}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 mb-3">
                    Terminal: <span className="font-semibold text-slate-800">{selectedTrip.route.departureStation}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-indigo-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Verifiable Token</div>
                      <div className="font-mono text-sm font-bold text-indigo-700">{confirmedReservation.qrCode}</div>
                    </div>
                    <div className="text-sm font-black text-slate-900">{formatETB(confirmedReservation.amountMinor)}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedTrip(null);
                      setActiveTab('tickets');
                    }}
                  >
                    View My Tickets
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTrip(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      Select Seat • {selectedTrip.route.destination}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedTrip.vehicleType} • Fare: {formatETB(selectedTrip.priceMinor)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-semibold mb-4">
                    {errorMsg}
                  </div>
                )}

                {/* Seat Map Grid */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block"/> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600 inline-block"/> Selected</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-200 inline-block"/> Occupied</span>
                  </div>

                  {/* Driver Header */}
                  <div className="bg-slate-100 rounded-t-lg p-2 text-center text-xs text-slate-500 font-medium mb-2 border border-slate-200 flex items-center justify-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-slate-500" /> Driver Cabin (Front)
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-4 gap-2.5 bg-slate-50 p-4 rounded-b-lg border border-slate-200 max-h-56 overflow-y-auto">
                    {Array.from({ length: selectedTrip.totalSeats }, (_, i) => i + 1).map((seatNum) => {
                      const isOccupied = tripDetails?.occupiedSeats?.includes(seatNum);
                      const isSelected = selectedSeat === seatNum;

                      return (
                        <button
                          key={seatNum}
                          disabled={isOccupied}
                          onClick={() => setSelectedSeat(seatNum)}
                          className={`h-11 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                            isOccupied
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : isSelected
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                              : 'bg-white border border-slate-300 text-slate-800 hover:border-indigo-500'
                          }`}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Passenger Form */}
                <div className="space-y-3 mb-6">
                  <div>
                    <Label className="text-xs">Passenger Name</Label>
                    <Input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="e.g. Tigist Haile"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Phone Number</Label>
                    <Input
                      type="text"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="+251 9..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Payment Method</Label>
                    <select
                      value={paymentProvider}
                      onChange={(e) => setPaymentProvider(e.target.value as any)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1 font-medium"
                    >
                      <option value="telebirr">Telebirr (Instant mobile payment)</option>
                      <option value="cbe_birr">CBE Birr</option>
                      <option value="cash_at_station">Cash at Campus Departure Gate</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  disabled={bookingLoading}
                  onClick={handleBookSeat}
                  className="w-full py-3 h-auto text-sm font-bold"
                >
                  {bookingLoading
                    ? 'Reserving Seat...'
                    : `Confirm Seat ${selectedSeat ? `#${selectedSeat}` : ''} • ${formatETB(selectedTrip.priceMinor)}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Telebirr Payment Modal */}
      {payModalTicket && payData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  TB
                </span>
                <h3 className="font-bold text-slate-900 text-base">Telebirr Checkout</h3>
              </div>
              <button
                onClick={() => {
                  setPayModalTicket(null);
                  setPayData(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 mb-4">
              <div className="text-xs text-slate-400 uppercase font-semibold">Amount to Pay</div>
              <div className="text-3xl font-black text-slate-900">{formatETB(payData.amountMinor)}</div>
              <div className="text-xs text-slate-500 mt-1">Ref: <code className="font-mono font-bold text-indigo-600">{payData.providerReference}</code></div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 mb-6 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" /> USSD Quick-Dial Instruction:
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-center font-bold text-emerald-700 text-sm">
                {payData.ussdDial}
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Dial the code on your phone to complete payment directly. In this pilot sandbox, click below to simulate instant payment verification.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                disabled={payLoading}
                onClick={() => handleConfirmMockPayment(payData.providerReference)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {payLoading ? 'Verifying...' : 'Simulate Telebirr Payment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPayModalTicket(null);
                  setPayData(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
