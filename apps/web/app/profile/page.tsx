'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TicketStub } from '@/components/ui/ticket-stub';
import { LoadingState, AuthPromptCard } from '@/components/ui/state-views';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { getPrimaryRoleLabel } from '@/lib/roles';
import { formatETB } from '@/lib/utils';
import {
  Mail,
  Phone,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  LogOut,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface StudentProfileData {
  faculty?: string;
  department?: string;
  academicLevel?: string;
  yearOfStudy?: number;
  studentIdNumber?: string;
  campusName?: string;
  gpa?: number | string;
}

interface WalletEntry {
  id: string;
  description?: string;
  amountMinor: number | string;
  type?: string;
  createdAt: string;
}

interface WalletData {
  balanceMinor?: number | string;
  recentLedgerEntries?: WalletEntry[];
}

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'id' | 'wallet' | 'security'>('id');
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    if (user) {
      apiClient<StudentProfileData>('/student/me').then(setStudentProfile).catch(() => null);
      apiClient<WalletData>('/wallet/me').then(setWallet).catch(() => null);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <AppShell maxWidth="5xl">
        <LoadingState label="Verifying campus session..." count={2} />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell maxWidth="5xl">
        <AuthPromptCard
          title="Sign in to view your profile"
          description="Access your Digital Student Pass, Campus Wallet ledger, and account privacy controls."
          returnTo="/profile"
        />
      </AppShell>
    );
  }

  const displayName = user.displayName;
  const email = user.email || 'Not linked';
  const phone = user.phone || 'Not linked';
  const roleLabel = getPrimaryRoleLabel(user.roles);
  const studentIdCode = studentProfile?.studentIdNumber || `HU-${user.id.slice(0, 6).toUpperCase()}`;

  return (
    <AppShell maxWidth="5xl">
      <div className="space-y-6">
        {/* Identity Summary Banner */}
        <section className="rounded-2xl bg-[#11241A] text-stone-100 p-6 sm:p-8 border border-stone-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white font-display font-black text-xl flex items-center justify-center shrink-0">
                {displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl font-black text-white truncate">
                    {displayName}
                  </h1>
                  <Badge variant="success">{roleLabel}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  {studentProfile?.faculty || 'Haramaya University'} &bull;{' '}
                  {studentProfile?.department || 'Main Campus (Bate)'}
                </p>
                <p className="font-mono text-xs text-emerald-300 font-semibold">
                  ID: {studentIdCode}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="border-white/20 bg-white/10 text-white hover:bg-rose-950 hover:text-rose-200 self-start sm:self-center"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
              <div className="text-xs text-stone-300">Campus Wallet</div>
              <div className="font-mono text-lg font-bold text-emerald-300 mt-0.5 tabular-nums">
                {formatETB(wallet?.balanceMinor ?? 0)}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
              <div className="text-xs text-stone-300">Ledger Entries</div>
              <div className="font-mono text-lg font-bold text-white mt-0.5 tabular-nums">
                {wallet?.recentLedgerEntries?.length ?? 0}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
              <div className="text-xs text-stone-300">Cumulative GPA</div>
              <div className="font-mono text-lg font-bold text-white mt-0.5 tabular-nums">
                {studentProfile?.gpa ? `${Number(studentProfile.gpa).toFixed(2)} / 4.00` : 'Not recorded'}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          <Button
            type="button"
            variant={activeTab === 'id' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('id')}
          >
            <QrCode className="w-4 h-4 mr-1.5" /> Digital Student ID
          </Button>
          <Button
            type="button"
            variant={activeTab === 'wallet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('wallet')}
          >
            <CreditCard className="w-4 h-4 mr-1.5" /> Campus Wallet
          </Button>
          <Button
            type="button"
            variant={activeTab === 'security' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('security')}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Security &amp; Privacy
          </Button>
        </div>

        {/* Tab 1: Digital ID */}
        {activeTab === 'id' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7">
              <TicketStub
                accent="ink"
                title="Haramaya University Student Pass"
                subtitle={`${displayName} • ${studentProfile?.campusName || 'Main Campus (Bate)'}`}
                badge={<Badge variant="success">ACTIVE PASS</Badge>}
                code={studentIdCode}
                qrValue={`https://campusflow.haramaya.edu.et/verify/id/${studentIdCode}`}
                meta={[
                  {
                    label: 'Department',
                    value: studentProfile?.department || 'General Studies',
                  },
                  {
                    label: 'Level',
                    value:
                      studentProfile?.academicLevel ||
                      (studentProfile?.yearOfStudy ? `Year ${studentProfile.yearOfStudy}` : 'Enrolled'),
                  },
                ]}
                footerRight={<span className="text-emerald-700 font-semibold">Gate &amp; Library Verified</span>}
              />
            </div>

            <div className="md:col-span-5 space-y-4">
              <Card className="p-5 space-y-3">
                <h2 className="font-display text-sm font-bold text-foreground">Digital ID Privileges</h2>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Main Gate 1, Gate 2 &amp; Harar Health Campus entry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Central Library turnstile &amp; borrowing check-in</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Campus shuttle boarding pass verification</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-5 bg-primary-50/60 border-primary/25 space-y-2">
                <h3 className="font-display text-sm font-bold text-foreground">Orders &amp; Passes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  View active cafeteria pickup passes and bus boarding tickets anytime from your Orders or Transport pages.
                </p>
                <div className="pt-1 flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/orders">
                      View Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/transport">Shuttle Passes</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Wallet */}
        {activeTab === 'wallet' && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">Campus Digital Wallet</h2>
                <p className="text-xs text-muted-foreground">
                  Tracked strictly in integer Ethiopian Birr minor units (cents).
                </p>
              </div>
              <Badge variant="default">Telebirr &bull; CBE Birr</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                <span className="text-xs text-muted-foreground">Available Balance</span>
                <div className="font-mono text-2xl font-black text-foreground tabular-nums">
                  {formatETB(wallet?.balanceMinor ?? 0)}
                </div>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero student transfer fee
                </span>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground">Settlement Actions</span>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    Settle pending cafeteria or shuttle orders directly via USSD.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/orders">Open My Orders</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/transport">Transport Tickets</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground">Recent Ledger Activity</h3>
              {wallet?.recentLedgerEntries && wallet.recentLedgerEntries.length > 0 ? (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden text-xs">
                  {wallet.recentLedgerEntries.map((entry) => (
                    <div key={entry.id} className="p-3.5 flex items-center justify-between bg-card">
                      <div>
                        <div className="font-semibold text-foreground">
                          {entry.description || 'Campus Ledger Transaction'}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-foreground tabular-nums">
                        {formatETB(entry.amountMinor)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/30 p-5 text-center text-xs text-muted-foreground">
                  No wallet ledger entries recorded yet for this session.
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Tab 3: Security & Privacy */}
        {activeTab === 'security' && (
          <Card className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">Account Details &amp; Compliance</h2>
                <p className="text-xs text-muted-foreground">
                  Compliant with Ethiopia Personal Data Protection Proclamation No. 1321/2024.
                </p>
              </div>
              <Badge variant="success">
                <ShieldCheck className="w-3.5 h-3.5" /> Proclamation Compliant
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-border bg-muted/35 space-y-1.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> University Email
                </span>
                <div className="font-mono font-bold text-foreground">{email}</div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/35 space-y-1.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> Mobile Number
                </span>
                <div className="font-mono font-bold text-foreground">{phone}</div>
              </div>
            </div>

            <CardContent className="p-4 rounded-xl border border-border bg-muted/35 space-y-1.5 text-xs">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> Data Governance Notice
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your campus ID, orders, and booking records are retained solely for university service delivery. Banking credentials are never stored on CampusFlow servers.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
