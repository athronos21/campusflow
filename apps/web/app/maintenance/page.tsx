'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { hasAdminAccess } from '@/lib/roles';
import { parseMaintenanceReport, type ParsedWorkOrder } from '@/lib/maintenance-helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Wrench,
  Zap,
  Droplet,
  Hammer,
  Wifi,
  CheckCircle2,
  Clock,
  Plus,
  Building,
  MapPin,
} from 'lucide-react';

type WorkOrder = ParsedWorkOrder;
const STORAGE_KEY = 'campusflow_maintenance_orders';

export default function MaintenancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkOrder['category']>('plumbing');
  const [dormBlock, setDormBlock] = useState('Block 42 (Main Campus)');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    }

    if (!hasAdminAccess(user?.roles)) return;

    async function loadAdminReports() {
      try {
        const reports = await apiClient.get<
          { id: string; status: string; reason: string; entityId?: string; details?: string; createdAt: string }[]
        >('/moderation/reports');
        if (reports && reports.length > 0) {
          setOrders(reports.map(parseMaintenanceReport));
        }
      } catch (err) {
        console.error('Failed to load maintenance reports:', err);
      }
    }
    loadAdminReports();
  }, [user?.roles]);

  const filteredOrders = orders.filter((o) => {
    if (selectedCategory === 'all') return true;
    return o.category === selectedCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !roomNumber || !description) return;

    const newOrder: WorkOrder = {
      id: `wo-${Date.now().toString().slice(-4)}`,
      category,
      title,
      dormBlock,
      roomNumber,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOrders));
    } catch {
      // ignore storage errors
    }
    setIsModalOpen(false);

    try {
      await apiClient.post('/moderation/reports', {
        entityType: 'maintenance_request',
        entityId: `${dormBlock} - Room ${roomNumber}`,
        reason: `[${category.toUpperCase()}] ${title}`,
        details: description,
      });
      toast({
        title: 'Work order logged',
        description: `Submitted for ${dormBlock}, ${roomNumber}.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Saved locally',
        description: 'Work order queued in your session view.',
        variant: 'warning',
      });
    }

    setTitle('');
    setRoomNumber('');
    setDescription('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'plumbing':
        return <Droplet className="w-4 h-4 text-teal-700" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-700" />;
      case 'carpentry':
        return <Hammer className="w-4 h-4 text-secondary" />;
      case 'network':
        return <Wifi className="w-4 h-4 text-primary" />;
      default:
        return <Wrench className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="warning">
            <Clock className="w-3 h-3" /> Pending Review
          </Badge>
        );
      case 'assigned':
        return <Badge variant="info">Technician Assigned</Badge>;
      case 'in_progress':
        return (
          <Badge variant="default">
            <Wrench className="w-3 h-3" /> In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </Badge>
        );
    }
  };

  return (
    <AppShell maxWidth="5xl">
      <div className="space-y-6">
        <PageHeader
          title="Campus Maintenance & Repairs"
          description="Facility work order tracking for dormitories, classrooms, and labs at Haramaya University."
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> New Work Order
            </Button>
          }
        />

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All (${orders.length})`, icon: null },
            { id: 'plumbing', label: 'Plumbing', icon: Droplet },
            { id: 'electrical', label: 'Electrical', icon: Zap },
            { id: 'carpentry', label: 'Carpentry', icon: Hammer },
            { id: 'network', label: 'EthERNet LAN', icon: Wifi },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                type="button"
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-full"
              >
                {Icon && <Icon className="w-3.5 h-3.5 mr-1.5" />}
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Work Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-5 h-5" />}
            title="No maintenance work orders found"
            description="No active issues logged in this category. Submit a work order to notify campus facilities."
            actionLabel="Submit Work Order"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-2 rounded-lg bg-muted border border-border shrink-0">
                      {getCategoryIcon(order.category)}
                    </span>
                    <h2 className="font-display font-bold text-base text-foreground truncate">{order.title}</h2>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{order.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> {order.dormBlock}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {order.roomNumber}
                  </span>
                  <span className="font-mono text-[11px]">
                    Logged {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Facility Work Order</DialogTitle>
            <DialogDescription>
              Direct dispatch to Haramaya University Directorate of Facility Management.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold">
                Issue Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkOrder['category'])}
                className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="plumbing">Plumbing &amp; Water</option>
                <option value="electrical">Electrical &amp; Lighting</option>
                <option value="carpentry">Carpentry &amp; Furniture</option>
                <option value="network">EthERNet &amp; Network Jack</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Issue Summary
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken door latch, leaking pipe"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="block" className="text-xs font-semibold">
                  Dormitory Block
                </Label>
                <select
                  id="block"
                  value={dormBlock}
                  onChange={(e) => setDormBlock(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Block 42 (Main Campus)">Block 42 (Main)</option>
                  <option value="Block 18 (Freshman Compound)">Block 18 (Freshman)</option>
                  <option value="Block 5 (Postgraduate Hall)">Block 5 (Postgrad)</option>
                  <option value="Block 24 (Health Science)">Block 24 (Health)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room" className="text-xs font-semibold">
                  Room Number
                </Label>
                <Input
                  id="room"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 204"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Detailed Description
              </Label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when the issue started and details for the maintenance crew..."
                required
                className="w-full p-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Work Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
