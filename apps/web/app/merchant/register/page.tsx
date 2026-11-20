'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function MerchantRegisterPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [campusId, setCampusId] = useState('');
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await apiClient('/businesses', {
        method: 'POST',
        body: JSON.stringify({
          campusId,
          name,
          description,
        }),
      });

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
        <Card className="w-full max-w-md p-8 text-center shadow-lg border-slate-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your business <strong className="text-slate-900">{name}</strong> is in the verification queue. Once approved by campus administration, it will be visible to all students in the campus directory.
          </p>
          <div className="space-y-3">
            <Link href="/admin/verifications">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Go to Admin Verification Queue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" className="w-full font-semibold">
                Back to Campus Directory
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="font-black text-2xl tracking-tight text-slate-900 inline-block">
            Campus<span className="text-indigo-600">Flow</span>
          </Link>
          <CardTitle className="text-xl font-black text-slate-900 mt-2">
            Register Campus Merchant
          </CardTitle>
          <CardDescription className="text-xs">
            Open a digital storefront for your shop or service at Haramaya University
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="mx-6 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label className="text-xs">Campus Location</Label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Business Name</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Eagle Fast Print & Stationery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Description & Campus Building</Label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Printing, photocopying, binding, and stationery near Gate 2 Commercial block."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={loading} className="w-full font-bold">
              {loading ? 'Submitting Registration...' : 'Submit for Verification'}
            </Button>
            <Link
              href="/directory"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
