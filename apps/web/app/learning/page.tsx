'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BookOpen, Search, Building2, Download } from 'lucide-react';

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
      console.error('Failed to load learning resources', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(resource: LearningResource) {
    try {
      const res = await apiClient.post<{ message: string; fileUrl: string; downloadCount: number }>(
        `/learning/resources/${resource.id}/download`,
      );

      // Update local download count
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, downloadCount: res.downloadCount } : r)),
      );

      // Open download URL
      window.open(res.fileUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'Download failed');
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      // Fallback campusId if user.campusId is empty
      const campusId = (user as any)?.campusId || 'a1b2c3d4-0000-0000-0000-000000000001';

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
    } catch (err: any) {
      alert(err.message || 'Failed to share material');
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
    const matchesDept = departmentFilter === 'All' || res.department.toLowerCase().includes(departmentFilter.toLowerCase());
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
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Past Exam</Badge>;
      case 'lecture_note':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Lecture Note</Badge>;
      case 'lab_manual':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Lab Manual</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Course Syllabus</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-950 text-white rounded-2xl p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 mb-3">
            Service 07 • Academic Hub & Course Resource Bank
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Haramaya Academic Study Repository</h1>
          <p className="mt-2 text-cyan-100/90 text-sm leading-relaxed">
            Free open repository of course lecture slides, past final exams, departmental summaries, and lab manuals contributed by senior students and faculty.
          </p>
        </div>

        {user ? (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md whitespace-nowrap"
          >
            + Share Course Material
          </button>
        ) : (
          <Link
            href="/login"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition backdrop-blur-sm whitespace-nowrap"
          >
            Sign In to Contribute
          </Link>
        )}
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" /> {successNotice}
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by course code (e.g. CoSc201, AG-102) or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              {resourceTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading academic materials...</div>
      ) : filteredResources.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-600 font-medium">No learning materials found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <Card key={res.id} className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {res.courseCode}
                  </span>
                  {getBadgeForType(res.resourceType)}
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{res.title}</h3>
                <p className="text-xs text-cyan-800 font-semibold mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-700" /> {res.department}
                </p>
                {res.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Download className="w-3.5 h-3.5 text-slate-500" /> {res.downloadCount} downloads
                  </span>
                  <span className="text-[11px]">By {res.uploader?.displayName || 'Contributor'}</span>
                </div>

                <button
                  onClick={() => handleDownload(res)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Share Study Material</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems - Midterm 2025 Solved Exam"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={uploadDept}
                    onChange={(e) => setUploadDept(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Health & Medicine">Health & Medicine</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CoSc312"
                    value={uploadCode}
                    onChange={(e) => setUploadCode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Material Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="lecture_note">Lecture Note / Slides</option>
                  <option value="past_exam">Past Exam / Solution</option>
                  <option value="lab_manual">Lab Manual / Assignment</option>
                  <option value="syllabus">Course Syllabus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">File URL / Download Link</label>
                <input
                  type="url"
                  placeholder="https://... or PDF storage link"
                  value={uploadFileUrl}
                  onChange={(e) => setUploadFileUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Note (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Key topics included, chapters covered..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Sharing...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
