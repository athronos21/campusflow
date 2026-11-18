'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      const res = await fetch('http://localhost:4000/api/v1/moderation/reports', {
        headers: { 'Authorization': 'Bearer admin-dev-token' },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
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
      const res = await fetch(`http://localhost:4000/api/v1/moderation/reports/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer admin-dev-token' },
      });
      if (res.ok) {
        await fetchReports();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Complaints & Moderation</h1>
          <p className="text-slate-600 mt-1">
            Investigate reported orders, missing items, and dispute resolutions for Haramaya campus users.
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          ↻ Refresh Reports
        </button>
      </div>

      {isLoading && reports.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">Checking dispute registry...</div>
      ) : reports.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-600 font-medium">No active disputes or complaints filed.</p>
          <span className="text-xs text-slate-400 mt-1 block">Campus marketplace transactions are healthy.</span>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-base">{report.reason}</span>
                  <Badge variant={report.status === 'resolved' ? 'success' : 'danger'}>
                    {report.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400">Target: {report.entityType}</span>
                </div>
                {report.details && (
                  <p className="text-sm text-slate-600 mt-1">{report.details}</p>
                )}
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-4">
                  <span>Reported by: {report.reporter?.displayName || 'Student'}</span>
                  <span>Contact: {report.reporter?.phone || report.reporter?.email || 'N/A'}</span>
                  <span>Filed: {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {report.status !== 'resolved' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={resolvingId === report.id}
                    onClick={() => handleResolve(report.id)}
                  >
                    {resolvingId === report.id ? 'Resolving...' : 'Resolve Dispute'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
