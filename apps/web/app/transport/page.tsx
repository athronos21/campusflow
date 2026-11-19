'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatETB } from '@/lib/utils';
import { TripDto, TicketReservationDto } from '@campusflow/contracts';
import { Bus, Ticket, MapPin, Navigation, Clock, Smartphone } from 'lucide-react';

export default function TransportPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trips' | 'tickets'>('trips');
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [userTickets, setUserTickets] = useState<TicketReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  
  // Seat Booking Modal State
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
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
    if (!selectedSeat) {
      setErrorMsg('Please click on an available seat number.');
      return;
    }
    if (!passengerName || !passengerPhone) {
      setErrorMsg('Please enter passenger full name and phone number.');
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
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-8 text-white mb-8 shadow-sm">
          <div className="max-w-3xl">
            <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Service 02 • Transport & Ticketing
            </span>
            <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
              Haramaya Campus & Intercity Bus Shuttles
            </h1>
            <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
              Book scheduled student buses, local minibuses, and intercity coaches departing from Haramaya University to Dire Dawa, Harar, and Addis Ababa. Real-time seat selection with digital QR boarding passes.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'trips'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bus className="w-4 h-4 text-amber-600" /> Available Trips & Schedules
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-4 h-4 text-indigo-600" /> My Boarding Passes ({userTickets.length})
          </button>
        </div>

        {activeTab === 'trips' && (
          <div>
            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Filter Destination:</span>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Destinations</option>
                  <option value="Dire Dawa">Dire Dawa (~50m)</option>
                  <option value="Harar">Harar (~30m)</option>
                  <option value="Addis Ababa">Addis Ababa (Coach)</option>
                </select>
              </div>

              <div className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-800">{filteredTrips.length}</span> scheduled departures
              </div>
            </div>

            {/* Trips Grid */}
            {loading ? (
              <div className="text-center py-16 text-slate-500">Loading scheduled trips...</div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500">
                No trips scheduled for the selected destination.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrips.map((trip) => {
                  const depDate = new Date(trip.departureTime);
                  return (
                    <div
                      key={trip.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Operator & Status */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                            {trip.operator.name}
                          </span>
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {trip.availableSeats} seats left
                          </span>
                        </div>

                        {/* Route Details */}
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-1">
                          <span>{trip.route.origin}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-indigo-600">{trip.route.destination}</span>
                        </div>

                        <div className="text-xs text-slate-500 mb-4 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Departure: <span className="text-slate-700 font-medium">{trip.route.departureStation}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-slate-400" /> Arrival: <span className="text-slate-700 font-medium">{trip.route.arrivalStation}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration: ~{trip.route.estimatedDurationMin} mins {trip.route.distanceKm ? `(${trip.route.distanceKm} km)` : ''}
                          </div>
                        </div>

                        {/* Vehicle Info & Schedule */}
                        <div className="bg-slate-50 rounded-lg p-3 text-xs mb-4">
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Vehicle:</span>
                            <span className="font-semibold text-slate-800">{trip.vehicleType}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Departure Time:</span>
                            <span className="font-semibold text-indigo-700">
                              {depDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fare per seat</div>
                          <div className="text-xl font-black text-slate-900">{formatETB(trip.priceMinor)}</div>
                        </div>
                        <button
                          onClick={() => openSeatPicker(trip)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
                        >
                          Select Seat
                        </button>
                      </div>
                    </div>
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
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-600 mb-4">Please sign in to view your tickets and boarding passes.</p>
                <a href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Sign In</a>
              </div>
            ) : userTickets.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
                You have not booked any transport tickets yet.
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map((ticket) => {
                  const depDate = ticket.trip ? new Date(ticket.trip.departureTime) : null;
                  const isPaid = ticket.paymentStatus === 'paid';
                  const isCancelled = ticket.status === 'cancelled';

                  return (
                    <div
                      key={ticket.id}
                      className={`bg-white rounded-xl border p-6 shadow-sm transition ${
                        isCancelled ? 'border-slate-200 opacity-60' : 'border-indigo-100'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded">
                              {ticket.trip?.operator.name || 'Campus Shuttle'}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isCancelled
                                ? 'bg-rose-100 text-rose-700'
                                : ticket.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {ticket.status.toUpperCase()}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900">
                            {ticket.trip?.route.origin} → {ticket.trip?.route.destination}
                          </h3>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-indigo-700">Seat #{ticket.seatNumber}</div>
                          <div className="text-xs text-slate-400 font-mono tracking-wider">{ticket.qrCode}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 mb-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                          <span className="text-slate-400 block">Passenger</span>
                          <span className="font-semibold text-slate-800">{ticket.passengerName}</span>
                          <div className="text-[11px] text-slate-500">{ticket.passengerPhone}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Departure Station</span>
                          <span className="font-semibold text-slate-800">{ticket.trip?.route.departureStation}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Schedule</span>
                          <span className="font-semibold text-slate-800">
                            {depDate ? depDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Total Fare</span>
                          <span className="font-bold text-slate-900 text-sm">{formatETB(ticket.amountMinor)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Boarding Token:</span>
                          <code className="text-xs font-mono font-bold bg-slate-100 text-indigo-600 px-2 py-1 rounded">
                            {ticket.qrCode}
                          </code>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isPaid && !isCancelled && (
                            <button
                              onClick={() => handleInitiateTicketPayment(ticket)}
                              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5"
                            >
                              <Smartphone className="w-3.5 h-3.5" /> Pay with Telebirr
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelTicket(ticket.id)}
                              className="px-3 py-1.5 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50 transition"
                            >
                              Cancel Seat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Seat Reserved!</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Your seat <span className="font-bold text-indigo-600">#{confirmedReservation.seatNumber}</span> is reserved on {selectedTrip.operator.name}.
                </p>

                {/* Digital Ticket Card */}
                <div className="border-2 border-dashed border-indigo-200 rounded-xl p-5 bg-indigo-50/50 mb-6 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">CampusFlow Boarding Pass</span>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                      SEAT #{confirmedReservation.seatNumber}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {selectedTrip.route.origin} → {selectedTrip.route.destination}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 mb-3">
                    Terminal: <span className="font-semibold text-slate-800">{selectedTrip.route.departureStation}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-indigo-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Verifiable Token</div>
                      <div className="font-mono text-sm font-bold text-indigo-700">{confirmedReservation.qrCode}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{formatETB(confirmedReservation.amountMinor)}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedTrip(null);
                      setActiveTab('tickets');
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition"
                  >
                    View My Tickets
                  </button>
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      Select Seat — {selectedTrip.route.destination}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedTrip.vehicleType} • Fare: {formatETB(selectedTrip.priceMinor)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="text-slate-400 hover:text-slate-600 text-lg"
                  >
                    ✕
                  </button>
                </div>

                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs mb-4">
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passenger Name</label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="e.g. Tigist Haile"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="+251 9..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={paymentProvider}
                      onChange={(e) => setPaymentProvider(e.target.value as any)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="telebirr">Telebirr (Instant mobile payment)</option>
                      <option value="cbe_birr">CBE Birr</option>
                      <option value="cash_at_station">Cash at Campus Departure Gate</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  disabled={bookingLoading}
                  onClick={handleBookSeat}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-md"
                >
                  {bookingLoading ? 'Reserving Seat...' : `Confirm Seat ${selectedSeat ? `#${selectedSeat}` : ''} • ${formatETB(selectedTrip.priceMinor)}`}
                </button>
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
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
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
                ✕
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
              <button
                disabled={payLoading}
                onClick={() => handleConfirmMockPayment(payData.providerReference)}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
              >
                {payLoading ? 'Verifying...' : 'Simulate Telebirr Payment'}
              </button>
              <button
                onClick={() => {
                  setPayModalTicket(null);
                  setPayData(null);
                }}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
