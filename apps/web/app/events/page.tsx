'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatETB } from '@/lib/utils';
import Link from 'next/link';

interface Organizer {
  displayName: string;
  email?: string | null;
}

interface CampusEvent {
  id: string;
  campusId: string;
  organizerId: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  endsAt?: string | null;
  category: string;
  entryFeeMinor: string;
  currency: string;
  maxAttendees?: number | null;
  bannerUrl?: string | null;
  createdAt: string;
  organizer?: Organizer;
  _count?: {
    rsvps: number;
  };
}

interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  ticketCode: string;
  status: string;
  createdAt: string;
  event: CampusEvent;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [myRsvps, setMyRsvps] = useState<EventRsvp[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'my-tickets'>('events');
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Active Ticket Modal
  const [activeTicket, setActiveTicket] = useState<{ ticketCode: string; eventTitle: string; venue: string; date: string } | null>(null);
  const [rsvpLoadingId, setRsvpLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchMyRsvps();
    }
  }, [user]);

  async function fetchEvents() {
    try {
      setLoading(true);
      const data = await apiClient.get<CampusEvent[]>('/events');
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyRsvps() {
    try {
      const data = await apiClient.get<EventRsvp[]>('/events/rsvps/my');
      setMyRsvps(data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    }
  }

  const isRsvpd = (eventId: string) => {
    return myRsvps.some(r => r.eventId === eventId);
  };

  const getRsvpTicketCode = (eventId: string) => {
    const r = myRsvps.find(r => r.eventId === eventId);
    return r ? r.ticketCode : null;
  };

  async function handleRsvp(event: CampusEvent) {
    if (!user) {
      alert('Please sign in to register for campus events');
      return;
    }

    try {
      setRsvpLoadingId(event.id);
      const res = await apiClient.post<EventRsvp>(`/events/${event.id}/rsvp`);
      
      setActiveTicket({
        ticketCode: res.ticketCode,
        eventTitle: event.title,
        venue: event.venue,
        date: new Date(event.startsAt).toLocaleString(),
      });

      fetchMyRsvps();
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to RSVP for event');
    } finally {
      setRsvpLoadingId(null);
    }
  }

  const categories = ['All', 'Technology & Hackathons', 'Campus Life', 'Academic', 'Career & Networking'];

  const filteredEvents = categoryFilter === 'All'
    ? events
    : events.filter(e => e.category === categoryFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-lg">
        <div className="max-w-2xl">
          <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 mb-3">
            Service 06 • Campus Events & Hackathons
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Haramaya Campus Events & Passes</h1>
          <p className="mt-2 text-indigo-100/90 text-sm leading-relaxed">
            Discover hackathons, academic workshops, guest lectures, and cultural fests. Instant RSVP passes with QR validation.
          </p>
        </div>
      </div>

      {/* Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'events'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events ({events.length})
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'my-tickets'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              My Passes ({myRsvps.length})
            </button>
          )}
        </div>

        {activeTab === 'events' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-medium">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-md whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'events' ? (
        loading ? (
          <div className="py-20 text-center text-slate-500">Loading campus events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-600 font-medium">No upcoming events scheduled in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const booked = isRsvpd(evt.id);
              const ticketCode = getRsvpTicketCode(evt.id);
              const rsvpCount = evt._count?.rsvps || 0;

              return (
                <Card key={evt.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="relative h-44 bg-slate-100 w-full overflow-hidden rounded-lg mb-4">
                      {evt.bannerUrl ? (
                        <img
                          src={evt.bannerUrl}
                          alt={evt.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-tr from-indigo-100 to-violet-200">
                          🎯
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-slate-900/80 text-white text-[10px] font-semibold backdrop-blur-sm border-none">
                          {evt.category}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={Number(evt.entryFeeMinor) === 0 ? 'success' : 'warning'}
                          className="font-bold shadow-sm"
                        >
                          {Number(evt.entryFeeMinor) === 0 ? 'FREE ENTRY' : formatETB(evt.entryFeeMinor)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{evt.title}</h3>
                      <p className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                        <span>🗓️</span> {new Date(evt.startsAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span>📍</span> {evt.venue}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                        {evt.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                      <span>👥 Attendees: <strong>{rsvpCount}</strong> {evt.maxAttendees ? `/ ${evt.maxAttendees}` : ''}</span>
                      <span>By: {evt.organizer?.displayName || 'Campus Council'}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {booked ? (
                      <button
                        onClick={() => setActiveTicket({
                          ticketCode: ticketCode!,
                          eventTitle: evt.title,
                          venue: evt.venue,
                          date: new Date(evt.startsAt).toLocaleString(),
                        })}
                        className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
                      >
                        <span>🎟️</span> View Boarding Pass ({ticketCode})
                      </button>
                    ) : user ? (
                      <button
                        disabled={rsvpLoadingId === evt.id}
                        onClick={() => handleRsvp(evt)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        {rsvpLoadingId === evt.id ? 'Registering...' : 'Get Instant RSVP Pass'}
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="w-full text-center py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                      >
                        Sign In to RSVP
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* My Tickets Tab */
        <div className="space-y-4">
          {myRsvps.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-600 font-medium">You haven&apos;t registered for any campus events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRsvps.map((rsvp) => (
                <Card key={rsvp.id} className="p-6 border-l-4 border-l-indigo-600 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                        {rsvp.ticketCode}
                      </span>
                      <Badge variant="success">CONFIRMED PASS</Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{rsvp.event?.title}</h4>
                    <p className="text-xs text-indigo-700 font-semibold mt-1">
                      🗓️ {new Date(rsvp.event?.startsAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      📍 {rsvp.event?.venue}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Show code at entrance gate
                    </span>
                    <button
                      onClick={() => setActiveTicket({
                        ticketCode: rsvp.ticketCode,
                        eventTitle: rsvp.event.title,
                        venue: rsvp.event.venue,
                        date: new Date(rsvp.event.startsAt).toLocaleString(),
                      })}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Show Full Digital Pass
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Pass Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setActiveTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              🎟️
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Official Campus Event Pass
              </span>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-1">
                {activeTicket.eventTitle}
              </h3>
            </div>

            {/* QR Simulation Card */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-xl space-y-3">
              <div className="w-36 h-36 mx-auto bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                  <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                  <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                  <rect x="40" y="10" width="10" height="20" />
                  <rect x="55" y="10" width="10" height="10" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="70" y="45" width="20" height="10" />
                  <rect x="10" y="45" width="15" height="10" />
                  <rect x="70" y="70" width="15" height="20" />
                  <rect x="45" y="75" width="15" height="15" />
                </svg>
              </div>

              <div className="font-mono text-base font-extrabold tracking-widest text-slate-900 bg-white py-1.5 rounded border border-slate-200">
                {activeTicket.ticketCode}
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p>📍 {activeTicket.venue}</p>
                <p>🗓️ {activeTicket.date}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Valid for single attendee entry. Present to gate marshal upon arrival.
            </p>

            <button
              onClick={() => setActiveTicket(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
