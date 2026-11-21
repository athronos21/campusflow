'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatETB } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Users, Ticket, CheckCircle2, X } from 'lucide-react';

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
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [rsvpingEventId, setRsvpingEventId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<{
    ticketCode: string;
    eventTitle: string;
    venue: string;
    date: string;
  } | null>(null);

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
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyRsvps() {
    try {
      const data = await apiClient.get<EventRsvp[]>('/events/rsvps/my');
      setMyRsvps(data);
    } catch (err) {
      console.error('Failed to load user passes:', err);
    }
  }

  async function handleRsvp(event: CampusEvent) {
    if (!user) {
      alert('Please sign in or create an account to RSVP for campus events.');
      return;
    }

    try {
      setRsvpingEventId(event.id);
      const rsvp = await apiClient.post<EventRsvp>(`/events/${event.id}/rsvp`);
      await fetchMyRsvps();
      setActiveTicket({
        ticketCode: rsvp.ticketCode,
        eventTitle: event.title,
        venue: event.venue,
        date: new Date(event.startsAt).toLocaleString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register for event';
      alert(msg);
    } finally {
      setRsvpingEventId(null);
    }
  }

  const categories = ['All', 'Technology & Hackathons', 'Campus Life', 'Academic', 'Career & Networking'];

  const filteredEvents =
    categoryFilter === 'All'
      ? events
      : events.filter((e) => e.category === categoryFilter);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
              Haramaya Campus Happenings
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Campus Events & Hackathons
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Discover student competitions, academic symposiums, guest lectures, and festivals.
            One-click RSVP with instant verified digital QR entrance passes.
          </p>
        </div>

        {/* Tabs & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'events' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('events')}
              className="h-9 font-bold text-xs"
            >
              All Events ({events.length})
            </Button>
            {user && (
              <Button
                variant={activeTab === 'my-tickets' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('my-tickets')}
                className="h-9 font-bold text-xs"
              >
                My Passes ({myRsvps.length})
              </Button>
            )}
          </div>

          {activeTab === 'events' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-medium">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className="h-7 px-3 whitespace-nowrap text-xs font-medium"
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Events Content */}
        {activeTab === 'events' ? (
          loading ? (
            <div className="py-20 text-center text-slate-500 text-sm font-medium">
              Loading scheduled campus events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="py-16 text-center border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">No events found in this category.</p>
              <p className="text-slate-400 text-xs mt-1">Check other categories or check back soon.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((event) => {
                const isRsvpd = myRsvps.some((r) => r.eventId === event.id);
                return (
                  <Card
                    key={event.id}
                    className="overflow-hidden flex flex-col justify-between border-slate-200 hover:border-purple-400/60 hover:shadow-xs transition"
                  >
                    <div>
                      {event.bannerUrl ? (
                        <div className="h-44 bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-28 bg-slate-100 flex items-center justify-center text-slate-400">
                          <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                      )}

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {event.category}
                          </Badge>
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {Number(event.entryFeeMinor) > 0
                              ? formatETB(event.entryFeeMinor)
                              : 'FREE ENTRY'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-base text-slate-900 leading-snug">{event.title}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {event.venue}
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                          {event.description}
                        </p>

                        <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                          <span className="font-mono text-[11px]">
                            {new Date(event.startsAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Users className="w-3 h-3 text-slate-400" />
                            {event._count?.rsvps || 0} registered
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      {isRsvpd ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const rsvp = myRsvps.find((r) => r.eventId === event.id);
                            if (rsvp) {
                              setActiveTicket({
                                ticketCode: rsvp.ticketCode,
                                eventTitle: event.title,
                                venue: event.venue,
                                date: new Date(event.startsAt).toLocaleString(),
                              });
                            }
                          }}
                          className="w-full h-9 font-bold text-xs border-emerald-300 text-emerald-800 bg-emerald-50/50"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> View Digital Pass
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={rsvpingEventId === event.id}
                          onClick={() => handleRsvp(event)}
                          className="w-full h-9 font-bold text-xs"
                        >
                          {rsvpingEventId === event.id ? 'Securing Pass...' : 'RSVP & Get Pass'}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          /* My Passes Tab */
          myRsvps.length === 0 ? (
            <Card className="py-16 text-center border-slate-200">
              <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">No registered event passes yet.</p>
              <p className="text-slate-400 text-xs mt-1">Browse scheduled events above to register for campus fests and hackathons.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRsvps.map((rsvp) => (
                <Card
                  key={rsvp.id}
                  className="p-5 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900">{rsvp.event.title}</h4>
                      <Badge variant="success" className="text-[10px] font-bold">
                        CONFIRMED PASS
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {rsvp.event.venue} &bull;{' '}
                      <span className="font-mono">{new Date(rsvp.event.startsAt).toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-mono">
                      Pass Code: <strong className="text-slate-900 tracking-wider">{rsvp.ticketCode}</strong>
                    </p>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      onClick={() =>
                        setActiveTicket({
                          ticketCode: rsvp.ticketCode,
                          eventTitle: rsvp.event.title,
                          venue: rsvp.event.venue,
                          date: new Date(rsvp.event.startsAt).toLocaleString(),
                        })
                      }
                      className="h-8 font-bold text-xs"
                    >
                      Show QR Pass
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </main>

      <Footer />

      {/* Ticket Pass Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 bg-white border-slate-200 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setActiveTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Official Campus Event Pass
              </span>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-1">
                {activeTicket.eventTitle}
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="w-36 h-36 mx-auto bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center shadow-xs">
                <QRCodeSVG
                  value={`CAMPUSFLOW:EVENT:${activeTicket.ticketCode}:${activeTicket.eventTitle}`}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="font-mono text-sm font-extrabold tracking-widest text-slate-900 bg-white py-1.5 rounded border border-slate-200">
                {activeTicket.ticketCode}
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p className="flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {activeTicket.venue}
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> {activeTicket.date}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Valid for single entry. Present QR code at the hall entrance.
            </p>

            <Button
              onClick={() => setActiveTicket(null)}
              className="w-full h-9 font-bold text-xs"
            >
              Done
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
