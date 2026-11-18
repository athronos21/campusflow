'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
      const res = await fetch(`http://localhost:4000/api/v1/moderation/businesses/pending?campusId=${campusId}`, {
        headers: {
          'Authorization': 'Bearer admin-dev-token',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
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
      const res = await fetch(`http://localhost:4000/api/v1/moderation/businesses/${businessId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-dev-token',
        },
      });

      if (res.ok) {
        await fetchPending();
      }
    } catch (e) {
      console.error('Failed to verify:', e);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Merchant Verifications</h1>
          <p className="text-slate-600 mt-1">
            Review and approve campus merchant registrations for Haramaya University.
          </p>
        </div>
        <Link
          href="/merchant/register"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
        >
          + Test Register New Merchant
        </Link>
      </div>

      {isLoading && businesses.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">Checking verification queue...</div>
      ) : businesses.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-600 font-medium">No pending merchant registrations.</p>
          <span className="text-xs text-slate-400 mt-1 block">
            All submitted businesses have been reviewed and verified.
          </span>
        </Card>
      ) : (
        <div className="space-y-4">
          {businesses.map((m) => (
            <Card key={m.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-lg">{m.name}</span>
                  <Badge variant="warning">PENDING REVIEW</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {m.description || 'No description provided.'}
                </p>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-4">
                  <span>Owner: {m.owner?.displayName || 'Registered Merchant'}</span>
                  <span>Contact: {m.owner?.phone || m.owner?.email || 'N/A'}</span>
                  <span>Submitted: {new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={actionId === m.id}
                  onClick={() => handleVerify(m.id)}
                >
                  {actionId === m.id ? 'Verifying...' : 'Verify & Approve'}
                </Button>
                <Button size="sm" variant="outline" disabled={actionId === m.id}>
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
