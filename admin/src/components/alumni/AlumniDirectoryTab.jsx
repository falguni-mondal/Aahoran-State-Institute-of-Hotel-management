import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Sparkles,
  Edit3,
  Trash2,
  Upload,
  X,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import apiClient from '../../api/axios.js';
import { uploadToImageKit } from '../../utils/imagekitUpload.js';

export const ALUMNI_SECTORS = [
  'Hotel Operations',
  'Food Production & Culinary Arts',
  'Food & Beverage Service',
  'Front Office Operations',
  'Housekeeping Operations',
  'Cruise Line Industry',
  'Airline & Airport Hospitality',
  'Tourism & Travel Management',
  'Entrepreneurship',
  'Hospitality Education',
  'International Hospitality Industry',
];

export const ALUMNI_COURSES = [
  'B.Sc. in Hospitality & Hotel Administration (HHA)',
  'Craftsmanship Course in Food Production & Patisserie',
  'Craftsmanship Course in Food & Beverage Service',
  'Certificate Course in Front Office Operations',
  'Certificate Course in Housekeeping Operations',
  'Certificate Course in Bakery & Confectionery',
  'Hunar Se Rozgar Tak (HSRT)',
];

export default function AlumniDirectoryTab({
  alumni = [],
  setAlumni,
  onRefresh,
}) {
  // Search, Multi-Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [highlightFilter, setHighlightFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt_desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlum, setEditingAlum] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/alumni-bg.webp');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    registrationId: '',
    fullName: '',
    yearOfAdmission: 2020,
    yearOfPassing: 2023,
    courseCompleted: ALUMNI_COURSES[0],
    industrySector: ALUMNI_SECTORS[0],
    currentDesignation: '',
    organisation: '',
    currentLocation: '',
    email: '',
    contactNumber: '',
    linkedInProfile: '',
    achievements: '',
    publicConsent: true,
    showEmailPublicly: false,
    showPhonePublicly: false,
    status: 'Approved',
    isDistinguished: false,
    distinguishedCitation: '',
    isSuccessStory: false,
    successStoryTitle: '',
    successStoryContent: '',
    order: 0,
  });

  // Extract unique Passing Years & Courses from database records
  const uniqueBatches = useMemo(() => {
    const years = Array.from(
      new Set(alumni.map((a) => String(a.yearOfPassing)).filter(Boolean))
    ).sort((a, b) => Number(b) - Number(a));
    return ['ALL', ...years];
  }, [alumni]);

  const uniqueCourses = useMemo(() => {
    const courses = Array.from(
      new Set(alumni.map((a) => a.courseCompleted).filter(Boolean))
    );
    return ['ALL', ...courses];
  }, [alumni]);

  // Comprehensive Searching, Filtering & Sorting across ALL Alumni details
  const filteredAndSortedAlumni = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return alumni
      .filter((alum) => {
        const matchesStatus =
          statusFilter === 'ALL' || alum.status === statusFilter;
        const matchesBatch =
          batchFilter === 'ALL' || String(alum.yearOfPassing) === batchFilter;
        const matchesCourse =
          courseFilter === 'ALL' || alum.courseCompleted === courseFilter;
        const matchesSector =
          sectorFilter === 'ALL' || alum.industrySector === sectorFilter;

        let matchesHighlight = true;
        if (highlightFilter === 'DISTINGUISHED') {
          matchesHighlight = Boolean(alum.isDistinguished);
        } else if (highlightFilter === 'SUCCESS_STORY') {
          matchesHighlight = Boolean(alum.isSuccessStory);
        } else if (highlightFilter === 'PUBLIC_CONSENT') {
          matchesHighlight = Boolean(alum.publicConsent);
        }

        const searchableBlob = [
          alum.registrationId,
          alum.fullName,
          alum.email,
          alum.contactNumber,
          alum.organisation,
          alum.currentDesignation,
          alum.currentLocation,
          alum.courseCompleted,
          alum.industrySector,
          alum.yearOfAdmission,
          alum.yearOfPassing,
          alum.achievements,
          alum.distinguishedCitation,
          alum.successStoryTitle,
          alum.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch = !q || searchableBlob.includes(q);

        return (
          matchesStatus &&
          matchesBatch &&
          matchesCourse &&
          matchesSector &&
          matchesHighlight &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'createdAt_desc':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'createdAt_asc':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case 'passing_desc':
            return (b.yearOfPassing || 0) - (a.yearOfPassing || 0);
          case 'passing_asc':
            return (a.yearOfPassing || 0) - (b.yearOfPassing || 0);
          case 'admission_desc':
            return (b.yearOfAdmission || 0) - (a.yearOfAdmission || 0);
          case 'name_asc':
            return (a.fullName || '').localeCompare(b.fullName || '');
          case 'name_desc':
            return (b.fullName || '').localeCompare(a.fullName || '');
          case 'org_asc':
            return (a.organisation || '').localeCompare(b.organisation || '');
          default:
            return 0;
        }
      });
  }, [
    alumni,
    searchQuery,
    statusFilter,
    batchFilter,
    courseFilter,
    sectorFilter,
    highlightFilter,
    sortBy,
  ]);

  const handleOpenModal = (alum = null) => {
    setFormError(null);
    setSelectedFile(null);

    if (alum) {
      setEditingAlum(alum);
      setFormData({
        registrationId: alum.registrationId || '',
        fullName: alum.fullName || '',
        yearOfAdmission: alum.yearOfAdmission || 2020,
        yearOfPassing: alum.yearOfPassing || 2023,
        courseCompleted: alum.courseCompleted || ALUMNI_COURSES[0],
        industrySector: alum.industrySector || ALUMNI_SECTORS[0],
        currentDesignation: alum.currentDesignation || '',
        organisation: alum.organisation || '',
        currentLocation: alum.currentLocation || '',
        email: alum.email || '',
        contactNumber: alum.contactNumber || '',
        linkedInProfile: alum.linkedInProfile || '',
        achievements: alum.achievements || '',
        publicConsent: alum.publicConsent !== false,
        showEmailPublicly: Boolean(alum.showEmailPublicly),
        showPhonePublicly: Boolean(alum.showPhonePublicly),
        status: alum.status || 'Approved',
        isDistinguished: Boolean(alum.isDistinguished),
        distinguishedCitation: alum.distinguishedCitation || '',
        isSuccessStory: Boolean(alum.isSuccessStory),
        successStoryTitle: alum.successStoryTitle || '',
        successStoryContent: alum.successStoryContent || '',
        order: alum.order || 0,
      });
      setPreviewUrl(alum.photograph || '/alumni-bg.webp');
    } else {
      setEditingAlum(null);
      setFormData({
        registrationId: '',
        fullName: '',
        yearOfAdmission: 2020,
        yearOfPassing: 2023,
        courseCompleted: ALUMNI_COURSES[0],
        industrySector: ALUMNI_SECTORS[0],
        currentDesignation: '',
        organisation: '',
        currentLocation: '',
        email: '',
        contactNumber: '',
        linkedInProfile: '',
        achievements: '',
        publicConsent: true,
        showEmailPublicly: false,
        showPhonePublicly: false,
        status: 'Approved',
        isDistinguished: false,
        distinguishedCitation: '',
        isSuccessStory: false,
        successStoryTitle: '',
        successStoryContent: '',
        order: alumni.length + 1,
      });
      setPreviewUrl('/alumni-bg.webp');
    }

    setIsModalOpen(true);
  };

  const handleQuickStatusUpdate = async (alum, newStatus) => {
    try {
      const { data } = await apiClient.put(`/alumni/admin/records/${alum._id}`, {
        status: newStatus,
      });
      if (data?.alumni) {
        setAlumni((prev) =>
          prev.map((item) => (item._id === alum._id ? data.alumni : item))
        );
        onRefresh?.();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleQuickToggleFlag = async (alum, field) => {
    try {
      const { data } = await apiClient.put(`/alumni/admin/records/${alum._id}`, {
        [field]: !alum[field],
      });
      if (data?.alumni) {
        setAlumni((prev) =>
          prev.map((item) => (item._id === alum._id ? data.alumni : item))
        );
        onRefresh?.();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle attribute.');
    }
  };

  const handleDeleteAlum = async (alum) => {
    const confirmed = window.confirm(
      `Permanently remove "${alum.fullName}" (${alum.registrationId}) from the Alumni database?`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/alumni/admin/records/${alum._id}`);
      setAlumni((prev) => prev.filter((item) => item._id !== alum._id));
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleSaveAlum = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      let photograph = editingAlum ? editingAlum.photograph : '/alumni-bg.webp';
      let photoFileId = editingAlum ? editingAlum.photoFileId : null;

      if (selectedFile) {
        const uploaded = await uploadToImageKit(
          selectedFile,
          '/alumni/portraits'
        );
        photograph = uploaded.url;
        photoFileId = uploaded.fileId;
      }

      const payload = {
        ...formData,
        yearOfAdmission: Number(formData.yearOfAdmission),
        yearOfPassing: Number(formData.yearOfPassing),
        photograph,
        photoFileId,
      };

      if (editingAlum) {
        const { data } = await apiClient.put(
          `/alumni/admin/records/${editingAlum._id}`,
          payload
        );
        if (data?.alumni) {
          setAlumni((prev) =>
            prev.map((item) =>
              item._id === editingAlum._id ? data.alumni : item
            )
          );
        }
      } else {
        const { data } = await apiClient.post('/alumni/admin/records', payload);
        if (data?.alumni) {
          setAlumni((prev) => [data.alumni, ...prev]);
        }
      }

      setIsModalOpen(false);
      onRefresh?.();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save alumni record.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Advanced Search, Multi-Filter & Sort Bar */}
      <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Deep Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707884]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any alumni by Name, Reg ID (SIHM-...), Email, Phone, Hotel, Role, City, Batch, or Course..."
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 py-2.5 pl-10 pr-4 font-sans text-xs sm:text-sm text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal(null)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#303030] px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#F7F5F0] transition-colors hover:bg-[#E85D04]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Alumnus Record</span>
          </button>
        </div>

        {/* Filter & Sort Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-[#E6E2D8]/70">
          {/* 1. Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
              Approval Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved (Live)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* 2. Batch Passing Year */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
              Passing Batch
            </label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
            >
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All Batches' : `Batch of ${b}`}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Course Completed */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
              Course Completed
            </label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
            >
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Courses' : c}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sector Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
              Industry Sector
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
            >
              <option value="ALL">All 11 Sectors</option>
              {ALUMNI_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Spotlight Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
              Feature Filter
            </label>
            <select
              value={highlightFilter}
              onChange={(e) => setHighlightFilter(e.target.value)}
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
            >
              <option value="ALL">All Profiles</option>
              <option value="DISTINGUISHED">Distinguished Alumni</option>
              <option value="SUCCESS_STORY">Success Stories</option>
              <option value="PUBLIC_CONSENT">Public Consent Given</option>
            </select>
          </div>

          {/* 6. Sort Order */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#707884] mb-1">
              Sort Records By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/60 px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
            >
              <option value="createdAt_desc">Newest Registered</option>
              <option value="createdAt_asc">Oldest Registered</option>
              <option value="passing_desc">Batch Year (Newest)</option>
              <option value="passing_asc">Batch Year (Oldest)</option>
              <option value="admission_desc">Admission Year (Newest)</option>
              <option value="name_asc">Full Name (A → Z)</option>
              <option value="name_desc">Full Name (Z → A)</option>
              <option value="org_asc">Organisation (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alumni Roster Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left font-sans text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E6E2D8] bg-[#F7F5F0]/80 text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                <th className="py-4 pl-6 pr-3">Alumnus &amp; Reg ID</th>
                <th className="py-4 px-3">Batch &amp; Course</th>
                <th className="py-4 px-3">Designation &amp; Hotel</th>
                <th className="py-4 px-3">Contact &amp; Consent</th>
                <th className="py-4 px-3">Highlights</th>
                <th className="py-4 px-3">Approval Status</th>
                <th className="py-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2D8]/60 text-[#303030]">
              {filteredAndSortedAlumni.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#707884]">
                    <span className="block font-serif text-lg text-[#303030]">
                      No Matching Alumni Records Found
                    </span>
                    <span className="mt-1 block text-xs">
                      Adjust your search query or filters above, or click &ldquo;Add Alumnus Record&rdquo;.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredAndSortedAlumni.map((alum) => (
                  <tr
                    key={alum._id}
                    className="transition-colors hover:bg-[#F7F5F0]/50"
                  >
                    {/* Alumnus & Reg ID */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={alum.photograph || '/alumni-bg.webp'}
                          alt={alum.fullName}
                          className="h-12 w-10 rounded-lg object-cover border border-[#E6E2D8] shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-[#303030]">
                            {alum.fullName}
                          </div>
                          <div className="font-mono text-[11px] text-[#E85D04] font-medium">
                            {alum.registrationId}
                          </div>
                          <div className="text-[11px] text-[#707884]">
                            📍 {alum.currentLocation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Batch & Course */}
                    <td className="py-4 px-3">
                      <span className="inline-block rounded-md bg-[#F7F5F0] border border-[#E6E2D8] px-2 py-0.5 font-mono text-[11px] font-semibold">
                        {alum.yearOfAdmission} - {alum.yearOfPassing}
                      </span>
                      <div className="mt-1 text-xs text-[#303030] max-w-[200px] truncate" title={alum.courseCompleted}>
                        {alum.courseCompleted}
                      </div>
                      <div className="text-[11px] text-[#707884]">
                        {alum.industrySector}
                      </div>
                    </td>

                    {/* Designation & Hotel */}
                    <td className="py-4 px-3">
                      <div className="font-semibold text-[#303030]">
                        {alum.organisation}
                      </div>
                      <div className="text-xs text-[#707884]">
                        {alum.currentDesignation}
                      </div>
                      {alum.linkedInProfile && (
                        <a
                          href={alum.linkedInProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#E85D04] hover:underline"
                        >
                          <span>LinkedIn</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>

                    {/* Contact & Consent */}
                    <td className="py-4 px-3 text-xs">
                      <div className="font-mono text-[11px]">{alum.email}</div>
                      <div className="font-mono text-[11px] text-[#707884]">
                        {alum.contactNumber}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px]">
                        <ShieldCheck
                          className={`h-3 w-3 ${
                            alum.publicConsent
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        />
                        <span className="text-[#707884]">
                          {alum.publicConsent
                            ? 'Directory Consent'
                            : 'Private Record'}
                        </span>
                      </div>
                    </td>

                    {/* Highlights: Distinguished & Success Story */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickToggleFlag(alum, 'isDistinguished')
                          }
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all ${
                            alum.isDistinguished
                              ? 'bg-[#E85D04]/15 text-[#E85D04] border border-[#E85D04]/30'
                              : 'bg-[#F7F5F0] text-[#707884] border border-[#E6E2D8]'
                          }`}
                        >
                          <Award className="h-3 w-3" />
                          <span>
                            {alum.isDistinguished
                              ? 'Distinguished ✓'
                              : 'Mark Distinguished'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuickToggleFlag(alum, 'isSuccessStory')
                          }
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all ${
                            alum.isSuccessStory
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-[#F7F5F0] text-[#707884] border border-[#E6E2D8]'
                          }`}
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>
                            {alum.isSuccessStory
                              ? 'Success Story ✓'
                              : 'Mark Success Story'}
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* Approval Status */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            alum.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : alum.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {alum.status === 'Approved' && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          )}
                          {alum.status === 'Pending' && (
                            <Clock className="h-3 w-3 text-amber-600" />
                          )}
                          {alum.status === 'Rejected' && (
                            <XCircle className="h-3 w-3 text-rose-600" />
                          )}
                          <span>{alum.status}</span>
                        </span>

                        {alum.status !== 'Approved' ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStatusUpdate(alum, 'Approved')
                            }
                            className="text-[10px] font-semibold text-emerald-700 hover:underline"
                          >
                            Approve for Public →
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStatusUpdate(alum, 'Pending')
                            }
                            className="text-[10px] text-[#707884] hover:underline"
                          >
                            Move to Pending
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(alum)}
                          className="rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#303030] hover:border-[#E85D04] hover:text-[#E85D04]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlum(alum)}
                          className="rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#707884] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Alumnus Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#303030]/50 backdrop-blur-xs">
          <div
            data-lenis-prevent="true"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#E6E2D8] pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#303030]">
                  {editingAlum
                    ? `Edit Alumnus (${editingAlum.registrationId})`
                    : 'Create Verified Alumnus Record'}
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#707884]">
                  Alumni Directory, Distinguished &amp; Success Story CMS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-[#707884] hover:bg-[#F7F5F0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveAlum} className="mt-5 space-y-4 text-xs">
              {/* Portrait Upload + Name */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-4 flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-16 w-14 rounded-xl object-cover border border-[#E6E2D8]"
                  />
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E2D8] px-3 py-1.5 font-medium text-[#303030] hover:bg-[#F7F5F0]"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#E85D04]" />
                      <span>Photo</span>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-8">
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-[#303030] outline-none focus:border-[#E85D04]"
                  />
                </div>
              </div>

              {/* Admission, Passing, Course */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Admission Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.yearOfAdmission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearOfAdmission: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Passing Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.yearOfPassing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearOfPassing: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  >
                    <option value="Approved">Approved (Live)</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Course Completed *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseCompleted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        courseCompleted: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Industry Sector *
                  </label>
                  <select
                    value={formData.industrySector}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        industrySector: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  >
                    {ALUMNI_SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Current Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currentDesignation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentDesignation: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Organisation / Hotel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organisation}
                    onChange={(e) =>
                      setFormData({ ...formData, organisation: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currentLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentLocation: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={formData.linkedInProfile}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        linkedInProfile: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 outline-none focus:border-[#E85D04]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                  Achievements / Professional Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.achievements}
                  onChange={(e) =>
                    setFormData({ ...formData, achievements: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3 outline-none focus:border-[#E85D04]"
                />
              </div>

              {/* Distinguished & Success Story Spotlights */}
              <div className="rounded-2xl border border-[#E6E2D8] bg-[#F7F5F0]/60 p-4 space-y-3">
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 font-semibold text-[#303030]">
                    <input
                      type="checkbox"
                      checked={formData.isDistinguished}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDistinguished: e.target.checked,
                        })
                      }
                    />
                    <span>Feature in &ldquo;Distinguished Alumni&rdquo;</span>
                  </label>

                  <label className="flex items-center gap-2 font-semibold text-[#303030]">
                    <input
                      type="checkbox"
                      checked={formData.isSuccessStory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSuccessStory: e.target.checked,
                        })
                      }
                    />
                    <span>Feature in &ldquo;Alumni Success Stories&rdquo;</span>
                  </label>

                  <label className="flex items-center gap-2 font-semibold text-[#303030]">
                    <input
                      type="checkbox"
                      checked={formData.publicConsent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          publicConsent: e.target.checked,
                        })
                      }
                    />
                    <span>Public Directory Consent</span>
                  </label>
                </div>

                {formData.isDistinguished && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#707884] mb-1">
                      Distinguished Citation / Award Note
                    </label>
                    <input
                      type="text"
                      value={formData.distinguishedCitation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          distinguishedCitation: e.target.value,
                        })
                      }
                      placeholder="e.g. Recipient of National Culinary Excellence Award..."
                      className="w-full rounded-xl border border-[#E6E2D8] bg-white px-3 py-2 outline-none focus:border-[#E85D04]"
                    />
                  </div>
                )}

                {formData.isSuccessStory && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.successStoryTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successStoryTitle: e.target.value,
                        })
                      }
                      placeholder="Success Story Headline..."
                      className="w-full rounded-xl border border-[#E6E2D8] bg-white px-3 py-2 outline-none focus:border-[#E85D04]"
                    />
                    <textarea
                      rows={2}
                      value={formData.successStoryContent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successStoryContent: e.target.value,
                        })
                      }
                      placeholder="Full inspiring narrative for existing students..."
                      className="w-full rounded-xl border border-[#E6E2D8] bg-white p-3 outline-none focus:border-[#E85D04]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E6E2D8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E6E2D8] px-4 py-2 text-[#707884]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#303030] px-5 py-2 font-semibold uppercase tracking-wider text-white hover:bg-[#E85D04]"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingAlum ? 'Save Changes' : 'Create Alumnus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}