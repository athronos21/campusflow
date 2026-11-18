import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminVerificationsPage() {
  const pendingMerchants = [
    {
      id: 'm-1',
      name: 'Campus Corner Fast Food',
      owner: 'Dawit Bekele',
      phone: '+251911445566',
      submittedAt: 'Today',
    },
    {
      id: 'm-2',
      name: 'Polytechnic Stationery & Binding',
      owner: 'Selamawit Kebede',
      phone: '+251933221100',
      submittedAt: 'Yesterday',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Merchant Verifications</h1>
      <p className="text-slate-600 mb-8">Review business registrations before they appear in the student directory.</p>

      <div className="space-y-4">
        {pendingMerchants.map((m) => (
          <Card key={m.id} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-lg">{m.name}</span>
                <Badge variant="warning">PENDING REVIEW</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Owner: {m.owner} · Contact: {m.phone}
              </p>
              <span className="text-xs text-slate-400 mt-2 block">Submitted {m.submittedAt}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                Verify & Approve
              </Button>
              <Button size="sm" variant="outline">
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
