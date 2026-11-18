'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MerchantRegisterPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [campusId, setCampusId] = useState('');
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/campuses')
      .then((r) => r.json())
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

      const res = await fetch('http://localhost:4000/api/v1/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer merchant-dev-token',
        },
        body: JSON.stringify({
          campusId,
          name,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your business <strong>{name}</strong> is now in the verification queue. Once approved by campus administration, it will be visible in the student directory.
          </p>
          <div className="space-y-3">
            <Link
              href="/admin/verifications"
              className="block w-full py-2.5 rounded-lg bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 transition"
            >
              Go to Admin Verification Queue →
            </Link>
            <Link
              href="/directory"
              className="block w-full py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
            >
              Back to Campus Directory
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-sm">
        <div className="text-center mb-6">
          <Link href="/" className="font-extrabold text-2xl tracking-tight text-slate-900">
            Campus<span className="text-indigo-600">Flow</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-3">Register Campus Business</h2>
          <p className="text-sm text-slate-500">Partner with CampusFlow at Haramaya University</p>
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
                  🏛️ {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Business Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Eagle Fast Print & Stationery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description & Campus Location
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Printing, photocopying, binding, and stationery near Gate 2 Commercial block."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Submitting Registration...' : 'Submit for Verification'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link href="/directory" className="hover:underline">
            ← Cancel and return to Directory
          </Link>
        </p>
      </Card>
    </div>
  );
}
