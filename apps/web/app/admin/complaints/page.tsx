'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
import { CheckCircle2, RefreshCw, User, Phone, Calendar, Check } from 'lucide-react';

interface ReportItem {
  id: string;
  entityType: string;
  entityId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter?: { displayName: string; email: string | null; phone: string | null };
}

export default function AdminComplaintsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await apiClient<ReportItem[]>('/moderation/reports');
      setReports(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Unable to load dispute registry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      setResolvingId(id);
      await apiClient(`/moderation/reports/${id}/resolve`, {
        method: 'PATCH',
      });
      toast({ title: 'Report marked resolved', variant: 'success' });
      await fetchReports();
    } catch (e: unknown) {
      toast({
        title: 'Resolution failed',
        description: e instanceof Error ? e.message : 'Could not resolve report',
        variant: 'error',
      });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints & Dispute Moderation"
        description="Investigate reported orders, facility work orders, and marketplace disputes across Haramaya campus."
        action={
          <Button variant="outline" size="sm" onClick={fetchReports}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Reports
          </Button>
        }
      />

      {isLoading && reports.length === 0 ? (
        <LoadingState label="Checking dispute registry..." count={2} />
      ) : fetchError ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-destructive" />}
          title="Could not load dispute registry"
          description={fetchError}
          actionLabel="Retry"
          onAction={fetchReports}
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-700" />}
          title="No active complaints or disputes"
          description="Campus marketplace transactions and service orders are clear."
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-muted-foreground">
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} on File
          </div>

          {reports.map((report) => (
            <Card key={report.id} className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-foreground text-base">{report.reason}</h2>
                    <Badge variant={report.status === 'resolved' ? 'success' : 'danger'}>
                      {report.status.toUpperCase()}
                    </Badge>
                    <Badge variant="muted">{report.entityType}</Badge>
                  </div>

                  {report.details && (
                    <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{report.details}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <User className="w-3.5 h-3.5" />
                      {report.reporter?.displayName || 'Student'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5" />
                      {report.reporter?.phone || report.reporter?.email || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      Filed {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {report.status !== 'resolved' ? (
                  <Button
                    disabled={resolvingId === report.id}
                    onClick={() => handleResolve(report.id)}
                    className="shrink-0"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {resolvingId === report.id ? 'Resolving...' : 'Resolve Dispute'}
                  </Button>
                ) : (
                  <Badge variant="success" className="shrink-0">
                    Resolved by Admin
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
