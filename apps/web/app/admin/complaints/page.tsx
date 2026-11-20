'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient<ReportItem[]>('/moderation/reports');
      setReports(data);
    } catch (e) {
      console.error(e);
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
      await fetchReports();
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complaints & Dispute Moderation</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Investigate reported orders, missing deliveries, and disputes for Haramaya campus marketplace transactions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchReports} className="text-xs">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Reports
        </Button>
      </div>

      {isLoading && reports.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">Checking dispute registry...</div>
      ) : reports.length === 0 ? (
        <Card className="text-center py-16 text-slate-500">
          <CardContent>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-800">No active complaints or disputes filed</p>
            <p className="text-xs text-slate-500 mt-1">Campus marketplace transactions are smooth and verified.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-semibold px-1">
            {reports.length} Report{reports.length > 1 ? 's' : ''} on File
          </div>

          {reports.map((report) => (
            <Card key={report.id} className="p-6 hover:border-slate-300 transition shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">{report.reason}</span>
                    <Badge variant={report.status === 'resolved' ? 'success' : 'danger'}>
                      {report.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Target: {report.entityType}
                    </span>
                  </div>

                  {report.details && (
                    <p className="text-sm text-slate-600 max-w-2xl mt-1">{report.details}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Reported by: {report.reporter?.displayName || 'Student'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {report.reporter?.phone || report.reporter?.email || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Filed: {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {report.status !== 'resolved' ? (
                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      disabled={resolvingId === report.id}
                      onClick={() => handleResolve(report.id)}
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {resolvingId === report.id ? 'Resolving...' : 'Resolve Dispute'}
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full shrink-0">
                    ✓ Resolved by Admin
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
