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
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('student@haramaya.edu.et');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Attempt Better Auth email sign-in first if it looks like an email
      if (identifier.includes('@')) {
        try {
          const res = await authClient.signIn.email({
            email: identifier,
            password,
          });
          if (res?.data?.user) {
            login(res.data.token || 'better-auth-session', {
              id: res.data.user.id,
              displayName: res.data.user.name || 'Campus Student',
              email: res.data.user.email || null,
              phone: (res.data.user as { phone?: string }).phone || null,
              roles: ['student'],
            });
            router.push('/directory');
            return;
          }
        } catch {
          // Fall through to API client
        }
      }

      // Backend API client fallback (supports phone + email)
      const data = await apiClient<{
        accessToken: string;
        user: {
          id: string;
          displayName: string;
          email: string | null;
          phone: string | null;
          memberships?: { role: string }[];
        };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
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
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
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
            Welcome back
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Sign in to your Haramaya University campus account
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
                htmlFor="identifier"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Email or Ethiopian Phone
              </Label>
              <Input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+2519... or student@haramaya.edu.et"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
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
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected by Ethiopia Data Proclamation No. 1321/2024</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
