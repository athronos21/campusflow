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
import { ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';

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
    try {
      setLoading(true);
      setError(null);

      // Attempt Better Auth email sign-up first if email is provided
      if (email.trim().includes('@')) {
        try {
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
            router.push('/directory');
            return;
          }
        } catch {
          // Fall through to API client
        }
      }

      // Backend API registration fallback
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

      const data = await apiClient<{
        accessToken: string;
        user: {
          id: string;
          displayName: string;
          email: string | null;
          phone: string | null;
          memberships?: { role: string }[];
        };
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      login(data.accessToken, {
        id: data.user.id,
        displayName: data.user.displayName,
        email: data.user.email,
        phone: data.user.phone,
        roles: data.user.memberships?.map((m) => m.role) || ['student'],
      });

      router.push('/directory');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-md border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Link
              href="/"
              className="font-extrabold text-2xl tracking-tight text-slate-900 flex items-center gap-1.5"
            >
              Campus<span className="text-primary">Flow</span>
            </Link>
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Create Student Account
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Join the Haramaya University digital campus ecosystem
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="campus"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Select Campus
              </Label>
              <select
                id="campus"
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="displayName"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Full Name
              </Label>
              <Input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Campus Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@haramaya.edu.et"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Ethiopian Phone (Optional)
              </Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251911223344"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Password (min 6 chars)
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 font-bold flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted under Ethiopian Personal Data Proclamation</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
