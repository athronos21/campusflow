'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
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

interface WorkOrder {
  id: string;
  category: 'plumbing' | 'electrical' | 'carpentry' | 'network';
  title: string;
  dormBlock: string;
  roomNumber: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  createdAt: string;
}

const INITIAL_ORDERS: WorkOrder[] = [
  {
    id: 'wo-101',
    category: 'plumbing',
    title: 'Shower Faucet Low Pressure & Leakage',
    dormBlock: 'Block 42 (Main Campus)',
    roomNumber: 'Room 312',
    description: 'The bathroom faucet has continuous dripping and low water pressure since Tuesday morning.',
    status: 'in_progress',
    createdAt: '2026-11-19T08:30:00.000Z',
  },
  {
    id: 'wo-102',
    category: 'electrical',
    title: 'Ceiling Fluorescent Tube Flickering',
    dormBlock: 'Block 18 (Freshman Compound)',
    roomNumber: 'Room 104',
    description: 'Main study area tube light turns off intermittently after 10 minutes of usage.',
    status: 'assigned',
    createdAt: '2026-11-19T14:15:00.000Z',
  },
  {
    id: 'wo-103',
    category: 'network',
    title: 'Ethernet Wall Port Disconnected',
    dormBlock: 'Block 5 (Postgraduate Hall)',
    roomNumber: 'Room 205',
    description: 'Physical RJ-45 jack pin 3 is bent. Campus intranet and EthERNet LAN cannot sync.',
    status: 'resolved',
    createdAt: '2026-11-18T11:00:00.000Z',
  },
  {
    id: 'wo-104',
    category: 'carpentry',
    title: 'Study Desk Drawer Track Jammed',
    dormBlock: 'Block 42 (Main Campus)',
    roomNumber: 'Room 218',
    description: 'Wooden runner broke and drawer cannot be pushed in properly.',
    status: 'pending',
    createdAt: '2026-11-20T10:00:00.000Z',
  },
];

export default function MaintenancePage() {
  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadReports() {
      try {
        const reports = await apiClient.get<any[]>('/moderation/reports').catch(() => []);
        if (reports && reports.length > 0) {
          const mapped: WorkOrder[] = reports.map((r) => {
            const isResolved = r.status === 'resolved';
            return {
              id: r.id,
              category: 'plumbing' as const,
              title: r.reason,
              dormBlock: r.entityId || 'Campus Residence',
              roomNumber: 'Dorm Block',
              description: r.details || 'Campus maintenance incident report.',
              status: isResolved ? 'resolved' : 'in_progress',
              createdAt: r.createdAt,
            };
          });
          setOrders([...mapped, ...INITIAL_ORDERS]);
        }
      } catch (err) {
        console.error('Failed to load maintenance reports:', err);
      }
    }
    loadReports();
  }, []);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'plumbing' | 'electrical' | 'carpentry' | 'network'>('plumbing');
  const [dormBlock, setDormBlock] = useState('Block 42 (Main Campus)');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');

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

    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);

    try {
      await apiClient.post('/moderation/reports', {
        entityType: 'maintenance_request',
        entityId: `${dormBlock} - Room ${roomNumber}`,
        reason: `[${category.toUpperCase()}] ${title}`,
        details: description,
      });
    } catch (err) {
      console.warn('Submitted offline/optimistically:', err);
    }

    setTitle('');
    setRoomNumber('');
    setDescription('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'plumbing':
        return <Droplet className="w-4 h-4 text-sky-600" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'carpentry':
        return <Hammer className="w-4 h-4 text-orange-600" />;
      case 'network':
        return <Wifi className="w-4 h-4 text-emerald-600" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-[10px] font-bold">
            <Clock className="w-3 h-3 mr-1" /> Pending Review
          </Badge>
        );
      case 'assigned':
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-50 text-[10px] font-bold">
            Technician Assigned
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="default" className="text-[10px] font-bold">
            <Wrench className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="success" className="text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved & Fixed
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Campus Maintenance & Repairs
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
              Official facility work order tracking for dormitories, classrooms, and labs at Haramaya University.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="font-bold flex items-center gap-2 self-start sm:self-center shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-8 rounded-full text-xs font-bold"
          >
            All Work Orders ({orders.length})
          </Button>
          <Button
            variant={selectedCategory === 'plumbing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('plumbing')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Droplet className="w-3.5 h-3.5 text-sky-600" /> Plumbing
          </Button>
          <Button
            variant={selectedCategory === 'electrical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('electrical')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Electrical
          </Button>
          <Button
            variant={selectedCategory === 'carpentry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('carpentry')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Hammer className="w-3.5 h-3.5 text-orange-600" /> Carpentry
          </Button>
          <Button
            variant={selectedCategory === 'network' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('network')}
            className="h-8 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-600" /> EthERNet LAN
          </Button>
        </div>

        {/* Work Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="border-slate-200 hover:border-slate-300 transition shadow-xs p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    {getCategoryIcon(order.category)}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{order.title}</h3>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">{order.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {order.dormBlock}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {order.roomNumber}
                </span>
                <span className="text-slate-400">
                  Logged: {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* New Work Order Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Submit Facility Work Order
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Direct dispatch to Haramaya University Directorate of Facility Management.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold uppercase text-slate-700">
                Issue Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkOrder['category'])}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="plumbing">Plumbing & Water</option>
                <option value="electrical">Electrical & Lighting</option>
                <option value="carpentry">Carpentry & Furniture</option>
                <option value="network">EthERNet & Network Jack</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold uppercase text-slate-700">
                Issue Summary
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken door latch, leaking pipe"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="block" className="text-xs font-semibold uppercase text-slate-700">
                  Dormitory Block
                </Label>
                <select
                  id="block"
                  value={dormBlock}
                  onChange={(e) => setDormBlock(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Block 42 (Main Campus)">Block 42 (Main)</option>
                  <option value="Block 18 (Freshman Compound)">Block 18 (Freshman)</option>
                  <option value="Block 5 (Postgraduate Hall)">Block 5 (Postgrad)</option>
                  <option value="Block 24 (Health Science)">Block 24 (Health)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room" className="text-xs font-semibold uppercase text-slate-700">
                  Room Number
                </Label>
                <Input
                  id="room"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 204"
                  required
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold uppercase text-slate-700">
                Detailed Description
              </Label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when the issue started and any details to assist the maintenance team..."
                required
                className="w-full p-2.5 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Submit Work Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
