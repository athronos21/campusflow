'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import { resolveLoginRedirect, shouldFallbackToBetterAuth } from '@/lib/auth-helpers';
import { useToast } from '@/components/ui/toast';
import {
  ShieldCheck,
  LogIn,
  AlertCircle,
  GraduationCap,
  Store,
  Shield,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface ApiLoginResponse {
  accessToken: string;
  user: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    memberships?: { role: string }[];
  };
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('student@haramaya.edu.et');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const resolveDestination = (roles: string[]) => {
    const next =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next')
        : null;
    return resolveLoginRedirect(next, roles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Try backend /auth/login first so campus_admin / merchant memberships are preserved accurately
      try {
        const data = await apiClient<ApiLoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password }),
        });

        await authClient.signOut().catch(() => null);
        const roles = data.user.memberships?.map((m) => m.role) || ['student'];
        login(data.accessToken, {
          id: data.user.id,
          displayName: data.user.displayName,
          email: data.user.email,
          phone: data.user.phone,
          roles,
        });

        toast({
          title: `Welcome back, ${data.user.displayName}`,
          variant: 'success',
        });
        router.push(resolveDestination(roles));
        return;
      } catch (apiErr) {
        if (!identifier.includes('@') || !shouldFallbackToBetterAuth(apiErr)) {
          throw apiErr;
        }
      }

      const res = await authClient.signIn.email({
        email: identifier,
        password,
      });

      if (res?.data?.user) {
        const fallbackRoles = ['student'];
        login(res.data.token || 'better-auth-session', {
          id: res.data.user.id,
          displayName: res.data.user.name || 'Campus Student',
          email: res.data.user.email || null,
          phone: (res.data.user as { phone?: string }).phone || null,
          roles: fallbackRoles,
        });
        toast({
          title: `Welcome back, ${res.data.user.name || 'Campus Student'}`,
          variant: 'success',
        });
        router.push(resolveDestination(fallbackRoles));
        return;
      }

      throw new Error('Invalid campus credentials');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const prefillAccount = (email: string) => {
    setIdentifier(email);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-12">
      {/* Left Institutional Ledger Panel */}
      <aside className="hidden lg:flex lg:col-span-5 bg-[#11241A] text-stone-100 p-10 flex-col justify-between border-r border-stone-800">
        <div className="space-y-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-black text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-black">
              CF
            </span>
            <span>CampusFlow</span>
          </Link>

          <div className="space-y-3 pt-4">
            <h1 className="font-display text-3xl font-black leading-tight text-white">
              One campus ledger for meals, shuttles, rooms, and study passes.
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed max-w-md">
              Built for Haramaya University Main Campus (Bate), Dire Dawa, and Harar routes with integer-cent Telebirr &amp; CBE Birr settlement.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-stone-200 pt-2">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Real-time cafeteria pickup passes and kitchen queue status</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Verified coach &amp; minibus seat booking with QR boarding stubs</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Role-gated portals for verified merchants and campus moderators</span>
            </li>
          </ul>
        </div>

        <div className="pt-6 border-t border-white/10 text-xs text-stone-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Compliant with Ethiopia Personal Data Protection Proclamation No. 1321/2024</span>
        </div>
      </aside>

      {/* Right Auth Form */}
      <main className="lg:col-span-7 flex flex-col justify-center px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-md space-y-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Campus Hub
            </Link>
            <Link href="/" className="lg:hidden font-display text-base font-black text-foreground">
              Campus<span className="text-primary">Flow</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-black text-foreground">Sign in to CampusFlow</CardTitle>
              <CardDescription>
                Use your student email, phone number, merchant, or system admin credentials.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="identifier" className="text-xs font-semibold text-foreground">
                    Email or Ethiopian Phone
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="+2519... or student@haramaya.edu.et"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full font-bold gap-2">
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Compact Pilot Quick-Fill */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground">
                  Pilot Quick-Fill (Password: <span className="font-mono text-foreground">password123</span>)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => prefillAccount('student@haramaya.edu.et')}
                    className="min-h-[40px] rounded-lg border border-border bg-muted/60 hover:bg-accent px-2 py-1.5 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => prefillAccount('merchant@haramayacafe.et')}
                    className="min-h-[40px] rounded-lg border border-border bg-muted/60 hover:bg-accent px-2 py-1.5 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Store className="h-3.5 w-3.5 text-secondary" />
                    Merchant
                  </button>
                  <button
                    type="button"
                    onClick={() => prefillAccount('admin@campusflow.et')}
                    className="min-h-[40px] rounded-lg border border-border bg-muted/60 hover:bg-accent px-2 py-1.5 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5 text-emerald-700" />
                    Admin
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                New to CampusFlow?{' '}
                <Link href="/register" className="font-bold text-primary hover:underline">
                  Create account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
