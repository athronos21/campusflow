'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
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
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const defaultCampusId = '1c271dbc-bfa3-48fe-b184-5b35211e4076';

  const fetchPending = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const campuses = await apiClient<{ id: string }[]>('/campuses').catch(() => []);
      const activeCampusId = campuses[0]?.id || defaultCampusId;
      const data = await apiClient<PendingBusiness[]>(
        `/moderation/businesses/pending?campusId=${activeCampusId}`,
      );
      setBusinesses(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Unable to load pending merchant queue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleVerify = async (biz: PendingBusiness) => {
    try {
      setActionId(biz.id);
      await apiClient(`/moderation/businesses/${biz.id}/verify`, {
        method: 'PATCH',
      });
      toast({
        title: `${biz.name} approved`,
        description: 'Merchant storefront is now verified in the Campus Directory.',
        variant: 'success',
      });
      await fetchPending();
    } catch (e: unknown) {
      toast({
        title: 'Verification failed',
        description: e instanceof Error ? e.message : 'Could not verify business',
        variant: 'error',
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchant Verifications"
        description="Review and approve campus merchant applications for Haramaya University shops and kiosks."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchPending}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/merchant/register">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Shop Form
              </Link>
            </Button>
          </div>
        }
      />

      {isLoading && businesses.length === 0 ? (
        <LoadingState label="Checking verification queue..." count={2} />
      ) : fetchError ? (
        <EmptyState
          icon={<ShieldCheck className="w-6 h-6 text-destructive" />}
          title="Could not load verification queue"
          description={fetchError}
          actionLabel="Retry"
          onAction={fetchPending}
        />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-700" />}
          title="No pending merchant registrations"
          description="All submitted campus businesses have been verified and activated."
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-muted-foreground">
            {businesses.length} {businesses.length === 1 ? 'Business' : 'Businesses'} Awaiting Review
          </div>

          {businesses.map((m) => (
            <Card key={m.id} className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-bold text-foreground text-lg">{m.name}</h2>
                    <Badge variant="warning">PENDING REVIEW</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    {m.description || 'No business description provided by applicant.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <User className="w-3.5 h-3.5" />
                      {m.owner?.displayName || 'Registered Applicant'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5" />
                      {m.owner?.phone || m.owner?.email || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    disabled={actionId === m.id}
                    onClick={() => handleVerify(m)}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    {actionId === m.id ? 'Verifying...' : 'Approve & Activate'}
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
