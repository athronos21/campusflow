'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthPromptCard, LoadingState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { hasAdminAccess } from '@/lib/roles';
import { CheckCircle, ArrowRight, ArrowLeft, Clock } from 'lucide-react';

export default function MerchantRegisterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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
      toast({
        title: 'Application submitted',
        description: `${name} is pending system admin approval.`,
        variant: 'success',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = hasAdminAccess(user?.roles);

  return (
    <AppShell maxWidth="5xl">
      <div className="space-y-6">
        <PageHeader
          title="Register a Campus Shop"
          description="Submit your cafeteria, printing center, or kiosk for verification by the System Administrator."
        />

        {authLoading ? (
          <LoadingState label="Checking your session..." count={1} />
        ) : !user ? (
          <AuthPromptCard
            title="Sign in to register your shop"
            description="Create or sign in to your CampusFlow account before submitting a merchant application for admin approval."
            returnTo="/merchant/register"
          />
        ) : success ? (
          <Card className="mx-auto max-w-lg p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">
                <Clock className="w-3.5 h-3.5" /> Pending System Admin Approval
              </div>
              <h2 className="font-display text-2xl font-black text-foreground pt-1">
                Application Submitted
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your shop <strong className="text-foreground">{name}</strong> has been placed in the System Admin verification queue. Once approved, your storefront will go live in the Campus Directory.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              {isAdmin && (
                <Button asChild>
                  <Link href="/admin/verifications">
                    Open Admin Verification Queue <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/directory">Browse Campus Directory</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle className="text-xl">Shop Application Details</CardTitle>
              <CardDescription>
                Signed in as <span className="font-semibold text-foreground">{user.displayName}</span>
              </CardDescription>
            </CardHeader>

            {error && (
              <div className="mx-6 p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-campus" className="text-xs font-semibold">Campus Location</Label>
                  <select
                    id="reg-campus"
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-xs font-semibold">Business Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="e.g. Eagle Fast Print & Stationery"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-desc" className="text-xs font-semibold">
                    Description &amp; Campus Building
                  </Label>
                  <textarea
                    id="reg-desc"
                    rows={3}
                    required
                    placeholder="e.g. Printing, photocopying, binding, and stationery near Gate 2 Commercial block."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t border-border pt-4">
                <Button type="submit" disabled={loading} className="w-full font-bold">
                  {loading ? 'Submitting Application...' : 'Submit for Admin Approval'}
                </Button>
                <Link
                  href="/directory"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
                </Link>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
