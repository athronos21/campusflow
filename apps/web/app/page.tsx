'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TicketStub } from '@/components/ui/ticket-stub';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatETB } from '@/lib/utils';
import {
  Bus,
  Coffee,
  Home,
  BookOpen,
  Calendar,
  Wrench,
  Tag,
  Search,
  PhoneCall,
  CreditCard,
  ChevronRight,
  Megaphone,
  Store,
  ShieldCheck,
  GraduationCap,
  Copy,
  LogIn,
  ArrowRight,
  MapPin,
} from 'lucide-react';

interface TripSummary {
  id: string;
  vehicleType: string;
  departureTime: string;
  availableSeats: number;
  priceMinor: number | string;
  operator?: { name: string };
  route: {
    origin: string;
    destination: string;
    departureStation?: string;
    estimatedDurationMin?: number;
  };
}

interface BusinessSummary {
  id: string;
  name: string;
  description: string | null;
  products?: { id: string; name: string; priceMinor: number | string }[];
}

interface AnnouncementSummary {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

interface StudentMe {
  studentIdNumber?: string;
  department?: string;
  yearOfStudy?: number;
}

interface WalletMe {
  balanceMinor?: number | string;
  currency?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentMe | null>(null);
  const [wallet, setWallet] = useState<WalletMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripsFailed, setTripsFailed] = useState(false);
  const [bizFailed, setBizFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPulse() {
      setIsLoading(true);
      try {
        const [campusesRes, tripsRes, bizRes] = await Promise.allSettled([
          apiClient<{ id: string }[]>('/campuses'),
          apiClient<TripSummary[]>('/transport/trips'),
          apiClient<BusinessSummary[]>('/businesses'),
        ]);

        if (!active) return;

        setTripsFailed(tripsRes.status === 'rejected');
        setBizFailed(bizRes.status === 'rejected');

        if (tripsRes.status === 'fulfilled') {
          setTrips(tripsRes.value.slice(0, 3));
        }

        if (bizRes.status === 'fulfilled') {
          setBusinesses(bizRes.value.slice(0, 4));
        }

        if (campusesRes.status === 'fulfilled' && campusesRes.value.length > 0) {
          const campusId = campusesRes.value[0].id;
          const ann = await apiClient<AnnouncementSummary[]>(`/announcements?campusId=${campusId}`).catch(() => []);
          if (active) setAnnouncements(ann.slice(0, 1));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadPulse();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setStudentProfile(null);
      setWallet(null);
      return;
    }
    apiClient<StudentMe>('/student/me').then(setStudentProfile).catch(() => null);
    apiClient<WalletMe>('/wallet/me').then(setWallet).catch(() => null);
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/directory?q=${encodeURIComponent(q)}` : '/directory');
  };

  const copyCredentials = async (label: string, email: string) => {
    try {
      await navigator.clipboard.writeText(`${email}\npassword123`);
      toast({
        title: `${label} credentials copied`,
        description: `${email} (password: password123)`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Copy unavailable',
        description: `Use ${email} / password123 on Sign In.`,
        variant: 'warning',
      });
    }
  };

  const quickModules = [
    { href: '/directory', label: 'Cafes & Shops', icon: Coffee, tone: 'text-primary' },
    { href: '/transport', label: 'Shuttles', icon: Bus, tone: 'text-secondary' },
    { href: '/housing', label: 'Housing', icon: Home, tone: 'text-teal-700' },
    { href: '/learning', label: 'Past Papers', icon: BookOpen, tone: 'text-primary' },
    { href: '/events', label: 'Events', icon: Calendar, tone: 'text-secondary' },
    { href: '/bookings', label: 'Bookings', icon: Wrench, tone: 'text-foreground' },
    { href: '/marketplace', label: 'Marketplace', icon: Tag, tone: 'text-primary' },
    { href: '/maintenance', label: 'Maintenance', icon: ShieldCheck, tone: 'text-secondary' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Daylight Search & Command Strip */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                Haramaya Campus Pulse
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Live cafeteria menus, Dire Dawa &amp; Harar shuttle seats, verified off-campus rooms, and exam archives.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="outline" size="sm">
                <Link href="/merchant/register">
                  <Store className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Open a Campus Shop
                </Link>
              </Button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="pulse-search"
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cafeterias, shuttles, past papers..."
                className="pl-10"
              />
            </div>
            <Button type="submit" className="sm:w-36 font-bold">
              Search Shops
            </Button>
          </form>

          {/* Compact Service Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
            {quickModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="min-h-[44px] flex items-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-accent px-2.5 py-2 text-xs font-semibold text-foreground transition-colors"
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${mod.tone}`} />
                  <span className="truncate">{mod.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Official Campus Notice */}
        {announcements.length > 0 && (
          <section className="rounded-xl border border-primary/25 bg-primary-50/70 p-4 flex items-start gap-3">
            <Megaphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">Campus Notice</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(announcements[0].createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="font-display text-sm font-bold text-foreground mt-1">
                {announcements[0].title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {announcements[0].body}
              </p>
            </div>
          </section>
        )}

        {/* Two-Column Operational Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Shuttles */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 border-b border-border">
                <div>
                  <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <Bus className="h-4 w-4 text-secondary" />
                    Next Departing Shuttles
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time seat availability from Haramaya terminal
                  </p>
                </div>
                <Link
                  href="/transport"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0 whitespace-nowrap ml-2"
                >
                  All Routes <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-5">
                    <LoadingState label="Checking live shuttle departures..." count={2} />
                  </div>
                ) : trips.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon={<Bus className="h-5 w-5" />}
                      title={tripsFailed ? 'Could not load shuttle schedule' : 'No upcoming trips posted yet'}
                      description={
                        tripsFailed
                          ? 'Unable to reach the campus transit server right now. Check back shortly or open Transport.'
                          : 'Operators have not posted departures for this window yet.'
                      }
                      actionLabel="Open Transport Desk"
                      actionHref="/transport"
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {trips.map((trip) => {
                      const depDate = new Date(trip.departureTime);
                      const lowSeats = trip.availableSeats <= 3;
                      return (
                        <div
                          key={trip.id}
                          className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/35 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={lowSeats ? 'danger' : 'success'}>
                                {trip.availableSeats} seats left
                              </Badge>
                              <span className="font-mono text-xs text-muted-foreground">
                                {depDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &bull;{' '}
                                {depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                &bull; {trip.vehicleType}
                              </span>
                            </div>
                            <div className="font-display text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                              <span>{trip.route.origin}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-primary">{trip.route.destination}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {trip.operator?.name || 'Verified Campus Carrier'}
                              {trip.route.estimatedDurationMin ? ` • ~${trip.route.estimatedDurationMin} min` : ''}
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                            <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                              {formatETB(trip.priceMinor)}
                            </span>
                            <Button asChild size="sm" variant="secondary">
                              <Link href="/transport">Select Seat</Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verified Campus Shops */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 border-b border-border">
                <div>
                  <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-primary" />
                    Verified Cafeterias &amp; Campus Shops
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order ahead for pickup without waiting at the counter
                  </p>
                </div>
                <Link
                  href="/directory"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0 whitespace-nowrap ml-2"
                >
                  Browse Directory <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>

              <CardContent className="pt-5">
                {isLoading ? (
                  <LoadingState label="Loading campus shops..." count={2} />
                ) : businesses.length === 0 ? (
                  <EmptyState
                    icon={<Store className="h-5 w-5" />}
                    title={bizFailed ? 'Could not load campus directory' : 'No verified shops listed yet'}
                    description={
                      bizFailed
                        ? 'Unable to reach the directory service right now. Try opening the Directory directly.'
                        : 'Check the full Campus Directory or apply to list a verified campus shop.'
                    }
                    actionLabel="Open Directory"
                    actionHref="/directory"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {businesses.map((biz) => (
                      <div
                        key={biz.id}
                        className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-bold text-sm text-foreground leading-snug">
                              {biz.name}
                            </h3>
                            <Badge variant="success" className="shrink-0">Verified</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {biz.description || 'Verified Haramaya campus merchant serving student meals and essentials.'}
                          </p>
                          {biz.products && biz.products.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {biz.products.slice(0, 3).map((item) => (
                                <span
                                  key={item.id}
                                  className="rounded bg-card border border-border px-2 py-0.5 text-[11px] font-medium text-foreground"
                                >
                                  {item.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3" /> Bate Campus
                          </span>
                          <Button asChild size="sm">
                            <Link href={`/shop/${biz.id}`}>View Menu</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Utility Rail (4 cols) */}
          <aside className="lg:col-span-4 space-y-5">
            {user ? (
              <>
                <TicketStub
                  accent="ink"
                  title="Haramaya Digital ID"
                  subtitle={user.displayName}
                  badge={<Badge variant="success">ACTIVE</Badge>}
                  code={studentProfile?.studentIdNumber || 'HU-VERIFIED-PASS'}
                  qrValue={`https://campusflow.haramaya.edu.et/verify/id/${user.id}`}
                  meta={[
                    {
                      label: 'Department',
                      value: studentProfile?.department || 'Haramaya Campus',
                    },
                    {
                      label: 'Year',
                      value: studentProfile?.yearOfStudy ? `Year ${studentProfile.yearOfStudy}` : 'Enrolled',
                    },
                  ]}
                  footerRight={
                    <Link href="/profile" className="font-semibold text-primary hover:underline">
                      Open Full Pass &rarr;
                    </Link>
                  }
                />

                <Card>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground inline-flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-primary" /> Campus Wallet
                      </span>
                      <Badge variant="success">0% Fee</Badge>
                    </div>
                    <div className="font-display text-2xl font-black text-foreground tabular-nums">
                      {wallet?.balanceMinor !== undefined ? formatETB(wallet.balanceMinor) : '0.00 ETB'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Integer-cent settlement backed by Telebirr and CBE Birr.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button asChild size="sm">
                        <Link href="/orders">My Orders</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/profile">Wallet &amp; ID</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-base font-bold text-foreground">
                        Student &amp; Partner Access
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Sign in to order meals, view your QR ID, or manage a verified shop.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild size="sm">
                      <Link href="/login">
                        <LogIn className="h-3.5 w-3.5 mr-1.5" /> Sign In
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </div>

                  <details className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                    <summary className="cursor-pointer font-semibold text-foreground select-none">
                      Pilot Sandbox Credentials
                    </summary>
                    <div className="mt-2.5 space-y-1.5">
                      {[
                        { label: 'Student', email: 'student@haramaya.edu.et' },
                        { label: 'Merchant', email: 'merchant@haramayacafe.et' },
                        { label: 'System Admin', email: 'admin@campusflow.et' },
                      ].map((acct) => (
                        <button
                          key={acct.email}
                          type="button"
                          onClick={() => copyCredentials(acct.label, acct.email)}
                          className="w-full min-h-[40px] flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-1.5 text-left hover:bg-accent transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground">{acct.label}</div>
                            <div className="font-mono text-[11px] text-muted-foreground truncate">
                              {acct.email}
                            </div>
                          </div>
                          <Copy className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </details>
                </CardContent>
              </Card>
            )}

            {/* Emergency Hotlines */}
            <Card className="border-rose-200 bg-rose-50/60">
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="font-display font-bold text-sm text-rose-950 flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-rose-700" /> Campus Emergency Hotlines
                </div>
                <div className="space-y-1 text-rose-950/90">
                  <div className="flex items-center justify-between min-h-[44px]">
                    <span>Campus Clinic (24/7)</span>
                    <a href="tel:0255530112" className="min-h-[44px] flex items-center font-mono font-bold text-rose-800 hover:underline tabular-nums">
                      025-553-0112
                    </a>
                  </div>
                  <div className="flex items-center justify-between min-h-[44px]">
                    <span>Security Patrol</span>
                    <a href="tel:0255530333" className="min-h-[44px] flex items-center font-mono font-bold text-rose-800 hover:underline tabular-nums">
                      025-553-0333
                    </a>
                  </div>
                  <div className="flex items-center justify-between min-h-[44px]">
                    <span>Bate Police Station</span>
                    <a href="tel:0255530991" className="min-h-[44px] flex items-center font-mono font-bold text-rose-950 hover:underline tabular-nums">
                      025-553-0991
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
