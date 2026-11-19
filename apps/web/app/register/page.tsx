'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

      const payload: any = {
        displayName,
        password,
        campusId,
      };
      if (email.trim()) payload.email = email.trim();
      if (phone.trim() && phone !== '+2519') payload.phone = phone.trim();

      const data = await apiClient<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
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
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-sm">
        <div className="text-center mb-6">
          <Link href="/" className="font-extrabold text-2xl tracking-tight text-slate-900">
            Campus<span className="text-indigo-600">Flow</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-3">Create Student Account</h2>
          <p className="text-sm text-slate-500">Join the Haramaya University digital campus</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Campus
            </label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tigist Haile"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ethiopian Phone (e.g. +251911223344)
            </label>
            <input
              type="text"
              placeholder="+2519..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="student@haramaya.edu.et"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password (Min 8 characters)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Creating Account...' : 'Register Account'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
