'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TicketStub } from '@/components/ui/ticket-stub';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { formatETB } from '@/lib/utils';
import { Calendar, MapPin, Users, Ticket, CheckCircle2 } from 'lucide-react';

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
  const { toast } = useToast();

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

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<CampusEvent[]>('/events');
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyRsvps = useCallback(async () => {
    try {
      const data = await apiClient.get<EventRsvp[]>('/events/rsvps/my');
      setMyRsvps(data);
    } catch (err) {
      console.error('Failed to load user passes:', err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchMyRsvps();
    }
  }, [user, fetchEvents, fetchMyRsvps]);

  async function handleRsvp(event: CampusEvent) {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to RSVP for campus events.',
        variant: 'warning',
      });
      return;
    }

    try {
      setRsvpingEventId(event.id);
      const rsvp = await apiClient.post<EventRsvp>(`/events/${event.id}/rsvp`);
      await fetchMyRsvps();
      toast({
        title: 'RSVP confirmed',
        description: `Digital pass issued for ${event.title}.`,
        variant: 'success',
      });
      setActiveTicket({
        ticketCode: rsvp.ticketCode,
        eventTitle: event.title,
        venue: event.venue,
        date: new Date(event.startsAt).toLocaleString(),
      });
    } catch (err: unknown) {
      toast({
        title: 'RSVP failed',
        description: err instanceof Error ? err.message : 'Failed to register for event',
        variant: 'error',
      });
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
    <AppShell maxWidth="6xl">
      <div className="space-y-6">
        <PageHeader
          title="Campus Events & Hackathons"
          description="Student competitions, academic symposiums, guest lectures, and festivals with instant QR entrance passes."
          badge={<Badge variant="secondary">Haramaya Happenings</Badge>}
        />

        {/* Tabs & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={activeTab === 'events' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('events')}
            >
              All Events ({events.length})
            </Button>
            {user && (
              <Button
                type="button"
                variant={activeTab === 'my-tickets' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('my-tickets')}
              >
                My Passes ({myRsvps.length})
              </Button>
            )}
          </div>

          {activeTab === 'events' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={categoryFilter === cat ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'events' ? (
          loading ? (
            <LoadingState label="Loading scheduled campus events..." count={3} />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-5 h-5" />}
              title="No events in this category"
              description="Try switching categories or check back soon for upcoming campus programs."
              actionLabel="Show All Events"
              onAction={() => setCategoryFilter('All')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((event) => {
                const isRsvpd = myRsvps.some((r) => r.eventId === event.id);
                const startsDate = new Date(event.startsAt);
                const monthLabel = startsDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                const dayLabel = startsDate.getDate();

                return (
                  <Card key={event.id} className="overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative h-40 bg-muted border-b border-border overflow-hidden">
                        {event.bannerUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Calendar className="w-9 h-9" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 rounded-lg border border-border bg-card px-2.5 py-1 text-center">
                          <div className="font-mono text-[10px] font-bold text-secondary">{monthLabel}</div>
                          <div className="font-display text-base font-black text-foreground leading-none">{dayLabel}</div>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">{event.category}</Badge>
                          <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                            {Number(event.entryFeeMinor) > 0 ? formatETB(event.entryFeeMinor) : 'FREE ENTRY'}
                          </span>
                        </div>

                        <div>
                          <h2 className="font-display font-bold text-base text-foreground leading-snug">
                            {event.title}
                          </h2>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" /> {event.venue}
                          </p>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {event.description}
                        </p>

                        <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between border-t border-border">
                          <span className="font-mono text-[11px]">
                            {startsDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Users className="w-3.5 h-3.5" /> {event._count?.rsvps || 0} registered
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      {isRsvpd ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const rsvp = myRsvps.find((r) => r.eventId === event.id);
                            if (rsvp) {
                              setActiveTicket({
                                ticketCode: rsvp.ticketCode,
                                eventTitle: event.title,
                                venue: event.venue,
                                date: startsDate.toLocaleString(),
                              });
                            }
                          }}
                          className="w-full border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> View Digital Pass
                        </Button>
                      ) : (
                        <Button
                          disabled={rsvpingEventId === event.id}
                          onClick={() => handleRsvp(event)}
                          className="w-full"
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
        ) : myRsvps.length === 0 ? (
          <EmptyState
            icon={<Ticket className="w-5 h-5" />}
            title="No event passes yet"
            description="RSVP to any campus event or hackathon to generate your verified QR pass."
            actionLabel="Browse Events"
            onAction={() => setActiveTab('events')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {myRsvps.map((rsvp) => (
              <TicketStub
                key={rsvp.id}
                accent="ink"
                title={rsvp.event.title}
                subtitle={rsvp.event.venue}
                badge={<Badge variant="success">CONFIRMED PASS</Badge>}
                code={rsvp.ticketCode}
                qrValue={`CAMPUSFLOW:EVENT:${rsvp.ticketCode}:${rsvp.event.title}`}
                meta={[
                  {
                    label: 'Date',
                    value: new Date(rsvp.event.startsAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }),
                  },
                  {
                    label: 'Time',
                    value: new Date(rsvp.event.startsAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  },
                ]}
                footerRight={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setActiveTicket({
                        ticketCode: rsvp.ticketCode,
                        eventTitle: rsvp.event.title,
                        venue: rsvp.event.venue,
                        date: new Date(rsvp.event.startsAt).toLocaleString(),
                      })
                    }
                  >
                    Expand QR Pass
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Ticket Pass Dialog */}
      <Dialog
        open={Boolean(activeTicket)}
        onOpenChange={(open) => {
          if (!open) setActiveTicket(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Campus Event Entrance Pass</DialogTitle>
            <DialogDescription>Valid for single entry at the event hall.</DialogDescription>
          </DialogHeader>

          {activeTicket && (
            <TicketStub
              accent="primary"
              title={activeTicket.eventTitle}
              subtitle={activeTicket.venue}
              badge={<Badge variant="success">CONFIRMED</Badge>}
              code={activeTicket.ticketCode}
              qrValue={`CAMPUSFLOW:EVENT:${activeTicket.ticketCode}:${activeTicket.eventTitle}`}
              meta={[
                { label: 'Venue', value: activeTicket.venue },
                { label: 'Schedule', value: activeTicket.date },
              ]}
            />
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setActiveTicket(null)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
