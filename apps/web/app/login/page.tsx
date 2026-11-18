'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

      const data = await apiClient<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      login(data.accessToken, {
        id: data.user.id,
        displayName: data.user.displayName,
        email: data.user.email,
        phone: data.user.phone,
        roles: data.user.memberships?.map((m: any) => m.role) || ['student'],
      });

      router.push('/directory');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-8 shadow-sm">
        <div className="text-center mb-6">
          <Link href="/" className="font-extrabold text-2xl tracking-tight text-slate-900">
            Campus<span className="text-indigo-600">Flow</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-3">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in to your Haramaya campus account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email or Ethiopian Phone
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+2519... or student@haramaya.edu.et"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
