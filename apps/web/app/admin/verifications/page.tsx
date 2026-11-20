'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, User, Phone, Calendar, RefreshCw, Plus } from 'lucide-react';

interface PendingBusiness {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  owner?: {
    displayName: string;
    email: string | null;
    phone: string | null;
  };
}

export default function AdminVerificationsPage() {
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Default Haramaya Campus ID
  const campusId = '1c271dbc-bfa3-48fe-b184-5b35211e4076';

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient<PendingBusiness[]>(`/moderation/businesses/pending?campusId=${campusId}`);
      setBusinesses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (businessId: string) => {
    try {
      setActionId(businessId);
      await apiClient(`/moderation/businesses/${businessId}/verify`, {
        method: 'PATCH',
      });
      await fetchPending();
    } catch (e) {
      console.error('Failed to verify:', e);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Merchant Verifications</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Review and approve campus merchant licenses for Haramaya University shops and kiosks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPending} className="text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
          <Link href="/merchant/register">
            <Button size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Test Register
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && businesses.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">Checking verification queue...</div>
      ) : businesses.length === 0 ? (
        <Card className="text-center py-16 text-slate-500">
          <CardContent>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-800">No pending merchant registrations</p>
            <p className="text-xs text-slate-500 mt-1">
              All submitted campus businesses have been verified and activated.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-semibold px-1">
            {businesses.length} Business{businesses.length > 1 ? 'es' : ''} Awaiting Moderator Review
          </div>

          {businesses.map((m) => (
            <Card key={m.id} className="p-6 hover:border-slate-300 transition shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="font-bold text-slate-900 text-lg">{m.name}</span>
                    <Badge variant="warning">PENDING REVIEW</Badge>
                  </div>
                  <p className="text-sm text-slate-600 max-w-2xl">
                    {m.description || 'No business description provided by registrant.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {m.owner?.displayName || 'Registered Merchant'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {m.owner?.phone || m.owner?.email || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Submitted: {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    disabled={actionId === m.id}
                    onClick={() => handleVerify(m.id)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    {actionId === m.id ? 'Verifying...' : 'Approve & Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionId === m.id}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
