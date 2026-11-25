'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingState, EmptyState } from '@/components/ui/state-views';
import { useToast } from '@/components/ui/toast';
import { BookOpen, Search, Building2, Download, PlusCircle } from 'lucide-react';

interface LearningResource {
  id: string;
  campusId: string;
  uploaderId: string;
  title: string;
  description?: string | null;
  department: string;
  courseCode: string;
  resourceType: 'lecture_note' | 'past_exam' | 'syllabus' | 'lab_manual';
  fileUrl: string;
  downloadCount: number;
  isApproved: boolean;
  createdAt: string;
  uploader?: {
    displayName: string;
  };
}

export default function LearningPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [activeCampusId, setActiveCampusId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDept, setUploadDept] = useState('Computer Science');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadType, setUploadType] = useState<'lecture_note' | 'past_exam' | 'syllabus' | 'lab_manual'>('lecture_note');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResources();
    apiClient<{ id: string }[]>('/campuses')
      .then((list) => {
        if (list.length > 0) setActiveCampusId(list[0].id);
      })
      .catch(() => null);
  }, []);

  async function fetchResources() {
    try {
      setLoading(true);
      const data = await apiClient.get<LearningResource[]>('/learning/resources');
      setResources(data);
    } catch (err) {
      console.error('Failed to load study resources:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(resource: LearningResource) {
    try {
      await apiClient.post(`/learning/resources/${resource.id}/download`);
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r)),
      );
    } catch {
      // Proceed to open file even if counter increment fails
    }
    window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      let campusId = activeCampusId;
      if (!campusId) {
        const list = await apiClient<{ id: string }[]>('/campuses').catch(() => []);
        campusId = list[0]?.id || '';
      }
      if (!campusId) {
        throw new Error('Campus directory unavailable right now.');
      }

      await apiClient.post('/learning/resources', {
        campusId,
        title: uploadTitle,
        description: uploadDescription,
        department: uploadDept,
        courseCode: uploadCode,
        resourceType: uploadType,
        fileUrl: uploadFileUrl || 'https://storage.googleapis.com/campusflow-static/notes/document.pdf',
      });

      toast({
        title: 'Material shared',
        description: `"${uploadTitle}" added to the academic vault.`,
        variant: 'success',
      });
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadCode('');
      setUploadDescription('');
      setUploadFileUrl('');
      fetchResources();
    } catch (err: unknown) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to share material',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const departments = ['All', 'Computer Science', 'Agriculture', 'Engineering', 'Health & Medicine', 'Business'];
  const resourceTypes = [
    { label: 'All Types', value: 'All' },
    { label: 'Lecture Notes', value: 'lecture_note' },
    { label: 'Past Exams', value: 'past_exam' },
    { label: 'Lab Manuals', value: 'lab_manual' },
    { label: 'Syllabi', value: 'syllabus' },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesDept =
      departmentFilter === 'All' ||
      res.department.toLowerCase().includes(departmentFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || res.resourceType === typeFilter;
    const matchesSearch =
      searchQuery === '' ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesType && matchesSearch;
  });

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'past_exam':
        return <Badge variant="warning">Past Exam</Badge>;
      case 'lecture_note':
        return <Badge variant="default">Lecture Note</Badge>;
      case 'lab_manual':
        return <Badge variant="secondary">Lab Manual</Badge>;
      default:
        return <Badge variant="outline">Syllabus</Badge>;
    }
  };

  return (
    <AppShell maxWidth="6xl">
      <div className="space-y-6">
        <PageHeader
          title="Haramaya Academic Vault"
          description="Open student repository of course lecture slides, past final exams, departmental summaries, and lab manuals."
          action={
            user ? (
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-1.5" /> Share Material
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login?next=/learning">Sign In to Contribute</Link>
              </Button>
            )
          }
        />

        {/* Search & Filters */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
            <Input
              id="learning-search"
              name="q"
              type="text"
              placeholder='Search by course code or title, e.g. "SEng 3122", "Soil Fertility", "Midterm"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground mr-1">Department:</span>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  type="button"
                  variant={departmentFilter === dept ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDepartmentFilter(dept)}
                  className="rounded-full"
                >
                  {dept}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground mr-1">Type:</span>
              {resourceTypes.map((t) => (
                <Button
                  key={t.value}
                  type="button"
                  variant={typeFilter === t.value ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(t.value)}
                  className="rounded-full"
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <LoadingState label="Loading course study materials..." count={4} />
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-5 h-5" />}
            title="No course materials match your filter"
            description="Reset your search or switch departments to explore available past papers and lecture notes."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setDepartmentFilter('All');
              setTypeFilter('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((res) => (
              <Card key={res.id} className="flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-foreground bg-muted px-2.5 py-0.5 rounded border border-border">
                      {res.courseCode}
                    </span>
                    {getBadgeForType(res.resourceType)}
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-base text-foreground leading-snug">{res.title}</h2>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" /> {res.department}
                    </p>
                  </div>

                  {res.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between mt-4 gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    {res.downloadCount} downloads &bull; {new Date(res.createdAt).toLocaleDateString()}
                  </span>
                  <Button size="sm" onClick={() => handleDownload(res)}>
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Study Material</DialogTitle>
            <DialogDescription>
              Contribute lecture slides, past exams, or lab manuals for fellow Haramaya students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="uploadTitle" className="text-xs font-semibold">
                Document Title
              </Label>
              <Input
                id="uploadTitle"
                type="text"
                required
                placeholder="e.g. Operating Systems - Midterm 2025 Solved Exam"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="uploadDept" className="text-xs font-semibold">Department</Label>
                <select
                  id="uploadDept"
                  value={uploadDept}
                  onChange={(e) => setUploadDept(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Health & Medicine">Health &amp; Medicine</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="uploadCode" className="text-xs font-semibold">Course Code</Label>
                <Input
                  id="uploadCode"
                  type="text"
                  required
                  placeholder="e.g. CoSc312"
                  value={uploadCode}
                  onChange={(e) => setUploadCode(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uploadType" className="text-xs font-semibold">Material Type</Label>
              <select
                id="uploadType"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as LearningResource['resourceType'])}
                className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="lecture_note">Lecture Note / Slides</option>
                <option value="past_exam">Past Exam / Solution</option>
                <option value="lab_manual">Lab Manual / Assignment</option>
                <option value="syllabus">Course Syllabus</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uploadFileUrl" className="text-xs font-semibold">File URL / Download Link</Label>
              <Input
                id="uploadFileUrl"
                type="url"
                placeholder="https://... or PDF storage link"
                value={uploadFileUrl}
                onChange={(e) => setUploadFileUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uploadDescription" className="text-xs font-semibold">Summary (Optional)</Label>
              <textarea
                id="uploadDescription"
                rows={2}
                placeholder="Key topics included, chapters covered..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="w-full text-sm p-3 rounded-lg border border-input bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Sharing...' : 'Publish Material'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
