'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { BookOpen, Search, Building2, Download, CheckCircle2, X, PlusCircle } from 'lucide-react';

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
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDept, setUploadDept] = useState('Computer Science');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadType, setUploadType] = useState<'lecture_note' | 'past_exam' | 'syllabus' | 'lab_manual'>('lecture_note');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
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
        prev.map((r) =>
          r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r,
        ),
      );
      window.open(resource.fileUrl, '_blank');
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const campusId = (user as { campusId?: string })?.campusId || 'a1b2c3d4-0000-0000-0000-000000000001';

      await apiClient.post('/learning/resources', {
        campusId,
        title: uploadTitle,
        description: uploadDescription,
        department: uploadDept,
        courseCode: uploadCode,
        resourceType: uploadType,
        fileUrl: uploadFileUrl || 'https://storage.googleapis.com/campusflow-static/notes/document.pdf',
      });

      setSuccessNotice(`"${uploadTitle}" was shared successfully!`);
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadCode('');
      setUploadDescription('');
      setUploadFileUrl('');
      fetchResources();
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to share material';
      alert(msg);
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
        return <Badge variant="warning" className="text-[10px] font-bold">Past Exam</Badge>;
      case 'lecture_note':
        return <Badge variant="default" className="text-[10px] font-bold">Lecture Note</Badge>;
      case 'lab_manual':
        return <Badge variant="secondary" className="text-[10px] font-bold">Lab Manual</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-bold">Syllabus</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                Academic Resource Bank
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Haramaya Academic Vault
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Open community repository of course lecture slides, past final exams, departmental summaries,
              and lab manuals contributed by students and faculty.
            </p>
          </div>

          <div>
            {user ? (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="h-10 font-bold text-xs flex items-center gap-2 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" /> Share Material
              </Button>
            ) : (
              <Button variant="outline" asChild className="h-10 font-bold text-xs border-slate-300">
                <Link href="/login">Sign In to Contribute</Link>
              </Button>
            )}
          </div>
        </div>

        {successNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters & Search */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <Input
              type="text"
              placeholder='Search by course code or title, e.g. "SEng 3122", "Organic Chemistry", "Midterm"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-300 text-sm shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-medium">
              <span className="text-slate-400 font-semibold mr-1">Department:</span>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={departmentFilter === dept ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDepartmentFilter(dept)}
                  className="h-7 px-3 whitespace-nowrap text-xs font-medium"
                >
                  {dept}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="text-slate-400 font-semibold mr-1">Type:</span>
              {resourceTypes.map((t) => (
                <Button
                  key={t.value}
                  variant={typeFilter === t.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(t.value)}
                  className="h-7 px-2.5 text-xs font-medium"
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm font-medium">
            Loading course study materials...
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="py-16 text-center border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold text-sm">No course materials match your filter.</p>
            <p className="text-slate-400 text-xs mt-1">Try another department or be the first to upload materials!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((res) => (
              <Card
                key={res.id}
                className="flex flex-col justify-between border-slate-200 hover:border-sky-400/60 hover:shadow-xs transition p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {res.courseCode}
                    </span>
                    {getBadgeForType(res.resourceType)}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{res.title}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {res.department}
                    </p>
                  </div>

                  {res.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                  <span className="text-[11px] text-slate-400">
                    {res.downloadCount} downloads &bull; {new Date(res.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(res)}
                    className="h-8 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-white border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Share Study Material</CardTitle>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="uploadTitle" className="text-xs font-semibold text-slate-700">
                  Document Title
                </Label>
                <Input
                  id="uploadTitle"
                  type="text"
                  required
                  placeholder="e.g. Operating Systems - Midterm 2025 Solved Exam"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="uploadDept" className="text-xs font-semibold text-slate-700">Department</Label>
                  <select
                    id="uploadDept"
                    value={uploadDept}
                    onChange={(e) => setUploadDept(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Health & Medicine">Health & Medicine</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="uploadCode" className="text-xs font-semibold text-slate-700">Course Code</Label>
                  <Input
                    id="uploadCode"
                    type="text"
                    required
                    placeholder="e.g. CoSc312"
                    value={uploadCode}
                    onChange={(e) => setUploadCode(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="uploadType" className="text-xs font-semibold text-slate-700">Material Type</Label>
                <select
                  id="uploadType"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as 'lecture_note' | 'past_exam' | 'syllabus' | 'lab_manual')}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="lecture_note">Lecture Note / Slides</option>
                  <option value="past_exam">Past Exam / Solution</option>
                  <option value="lab_manual">Lab Manual / Assignment</option>
                  <option value="syllabus">Course Syllabus</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="uploadFileUrl" className="text-xs font-semibold text-slate-700">File URL / Download Link</Label>
                <Input
                  id="uploadFileUrl"
                  type="url"
                  placeholder="https://... or PDF storage link"
                  value={uploadFileUrl}
                  onChange={(e) => setUploadFileUrl(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="uploadDescription" className="text-xs font-semibold text-slate-700">Summary / Note (Optional)</Label>
                <textarea
                  id="uploadDescription"
                  rows={2}
                  placeholder="Key topics included, chapters covered..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md border border-input bg-transparent shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="h-8 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="h-8 text-xs font-bold"
                >
                  {submitting ? 'Sharing...' : 'Publish Material'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
