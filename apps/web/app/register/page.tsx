'use client';

import React, { useState, useEffect } from 'react';
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
import { shouldFallbackToBetterAuth } from '@/lib/auth-helpers';
import { hasAdminAccess } from '@/lib/roles';
import { useToast } from '@/components/ui/toast';
import { ShieldCheck, UserPlus, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ApiRegisterResponse {
  accessToken: string;
  user: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    memberships?: { role: string }[];
  };
}

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+2519');
  const [password, setPassword] = useState('');
  const [campusId, setCampusId] = useState('');
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    apiClient<{ id: string; name: string }[]>('/campuses')
      .then((data) => {
        setCampuses(data);
        if (data.length > 0) setCampusId(data[0].id);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusId) {
      setError('Campus list is still loading. Please wait or refresh before creating an account.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const payload: {
        displayName: string;
        password: string;
        campusId: string;
        email?: string;
        phone?: string;
      } = {
        displayName,
        password,
        campusId,
      };
      if (email.trim()) payload.email = email.trim();
      if (phone.trim() && phone !== '+2519') payload.phone = phone.trim();

      try {
        const data = await apiClient<ApiRegisterResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
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
          title: 'Account created',
          description: `Welcome to CampusFlow, ${data.user.displayName}.`,
          variant: 'success',
        });
        router.push(hasAdminAccess(roles) ? '/admin/verifications' : '/directory');
        return;
      } catch (apiErr) {
        if (!email.trim().includes('@') || !shouldFallbackToBetterAuth(apiErr)) {
          throw apiErr;
        }
      }

      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: displayName,
      });

      if (res?.data?.user) {
        const token = (res.data as { token?: string | null })?.token || 'better-auth-session';
        login(token, {
          id: res.data.user.id,
          displayName: res.data.user.name || displayName,
          email: res.data.user.email || null,
          phone: phone.trim() !== '+2519' ? phone.trim() : null,
          roles: ['student'],
        });
        toast({
          title: 'Account created',
          description: `Welcome to CampusFlow, ${displayName}.`,
          variant: 'success',
        });
        router.push('/directory');
        return;
      }

      throw new Error('Registration failed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-12">
      {/* Left Institutional Panel */}
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
              Join your verified campus network in seconds.
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed max-w-md">
              Create your account to pre-order meals, reserve shuttle seats, browse verified off-campus rooms, or apply to register a campus shop.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-stone-200 pt-2">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Instant access to cafeterias, printing centers, and exam archives</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Merchants can submit shop applications for system admin approval</span>
            </li>
          </ul>
        </div>

        <div className="pt-6 border-t border-white/10 text-xs text-stone-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Protected under Ethiopia Personal Data Proclamation No. 1321/2024</span>
        </div>
      </aside>

      {/* Right Form */}
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
              <CardTitle className="text-2xl font-black text-foreground">Create Campus Account</CardTitle>
              <CardDescription>
                Sign up with your Haramaya campus email or Ethiopian mobile number.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="campus" className="text-xs font-semibold text-foreground">
                    Select Campus
                  </Label>
                  <select
                    id="campus"
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {campuses.length === 0 ? (
                      <option value="">Haramaya University (Default)</option>
                    ) : (
                      campuses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-xs font-semibold text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                    Campus Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@haramaya.edu.et"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                    Ethiopian Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251911223344"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                    Password (min 8 characters)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full font-bold gap-2">
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 text-center border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
