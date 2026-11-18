import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminComplaintsPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Complaints & Moderation</h1>
      <p className="text-slate-600 mb-8">Investigate reported transactions, missing orders, and content disputes.</p>

      <Card className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">Order Discrepancy #ord-189</span>
            <Badge variant="danger">OPEN REPORT</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Student reported item marked ready but shop was closed during lunch break.
          </p>
          <span className="text-xs text-slate-400 mt-2 block">Reported by student@haramaya.edu.et</span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary">
            Resolve Dispute
          </Button>
          <Button size="sm" variant="outline">
            Dismiss
          </Button>
        </div>
      </Card>
    </div>
  );
}
