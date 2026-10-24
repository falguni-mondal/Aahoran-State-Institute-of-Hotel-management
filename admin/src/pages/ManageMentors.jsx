import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Users,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Upload,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import apiClient from '../api/axios.js';
import { uploadToImageKit } from '../utils/imagekitUpload.js';
import { useLenis } from '../providers/SmoothScrollProvider.jsx';

const isPrincipalRole = (role) => /principal/i.test(String(role || '').trim());

export default function ManageMentors() {
  const lenis = useLenis();

  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [formError, setFormError] = useState(null);

  // Form Fields & File Upload States
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    achievementsText: '',
    order: 0,
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('/nchmct-bg.webp');

  // Animation References
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch verified mentor records from backend CMS
  const fetchMentors = useCallback(async (manualSync = false) => {
    if (manualSync) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await apiClient.get('/mentors/admin');
      if (response.data?.status === 'success' && Array.isArray(response.data.mentors)) {
        setMentors(response.data.mentors);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to synchronize mentors from CMS registry.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors(false);
  }, [fetchMentors]);

  // Page Entrance Animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.38 }
      ).fromTo(
        gridRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.38 },
        '-=0.15'
      );
    },
    { scope: containerRef }
  );

  // Modal Scroll-Lock & Animation
  useEffect(() => {
    if (isModalOpen) {
      if (lenis) lenis.stop();
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.96, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }
        );
      }
    } else {
      if (lenis) lenis.start();
    }
  }, [isModalOpen, lenis]);

  const handleOpenModal = (mentor = null) => {
    setFormError(null);
    setUploadProgressText('');
    setSelectedFile(null);

    if (mentor) {
      setEditingMentor(mentor);
      setFormData({
        name: mentor.name || '',
        role: mentor.role || '',
        achievementsText: Array.isArray(mentor.achievements)
          ? mentor.achievements.join('\n')
          : '',
        order: mentor.order ?? 0,
        isActive: mentor.isActive !== false,
      });
      setPreviewImageUrl(mentor.image || '/nchmct-bg.webp');
    } else {
      setEditingMentor(null);
      setFormData({
        name: '',
        role: '',
        achievementsText: '',
        order: mentors.length + 1,
        isActive: true,
      });
      setPreviewImageUrl('/nchmct-bg.webp');
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingMentor(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setSelectedFile(file);
    setFormError(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewImageUrl(objectUrl);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.role.trim()) {
      setFormError('Mentor name and official designation are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = editingMentor ? editingMentor.image : '/nchmct-bg.webp';
      let finalImageFileId = editingMentor ? editingMentor.imageFileId : null;

      // Upload file to ImageKit if the user selected a new image
      if (selectedFile) {
        setUploadProgressText('Uploading portrait to ImageKit CDN...');
        const uploadResult = await uploadToImageKit(selectedFile, '/mentors');
        finalImageUrl = uploadResult.url;
        finalImageFileId = uploadResult.fileId;
      }

      setUploadProgressText('Saving mentor profile...');

      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        image: finalImageUrl,
        imageFileId: finalImageFileId,
        achievements: formData.achievementsText
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      if (editingMentor) {
        const response = await apiClient.put(
          `/mentors/${editingMentor._id}`,
          payload
        );
        if (response.data?.status === 'success') {
          setMentors((prev) =>
            prev.map((item) =>
              item._id === editingMentor._id ? response.data.mentor : item
            )
          );
          handleCloseModal();
        }
      } else {
        const response = await apiClient.post('/mentors', payload);
        if (response.data?.status === 'success') {
          setMentors((prev) => [...prev, response.data.mentor]);
          handleCloseModal();
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Failed to persist mentor record. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  const handleDeleteMentor = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${name}"? The profile and its ImageKit asset will be permanently deleted.`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/mentors/${id}`);
      setMentors((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove mentor record.');
    }
  };

  const handleToggleActive = async (mentor) => {
    try {
      const response = await apiClient.put(`/mentors/${mentor._id}`, {
        isActive: !mentor.isActive,
      });
      if (response.data?.status === 'success') {
        setMentors((prev) =>
          prev.map((item) =>
            item._id === mentor._id ? response.data.mentor : item
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visibility state.');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 2xl:space-y-8">
      {/* Top Header Strip */}
      <div
        ref={headerRef}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="font-serif text-2xl font-normal tracking-tight text-[#303030] sm:text-2xl md:text-3xl 2xl:text-4xl">
            Mentors <span className="italic text-[#E85D04]">Directory</span>
          </h2>
          <p className="mt-1 font-sans text-xs text-[#707884] sm:text-xs md:text-sm 2xl:text-base">
            Manage academic mentors, portrait assets, and directory ordering. Any mentor with designation &ldquo;Principal&rdquo; is automatically featured on the Homepage (even if hidden from the About page).
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto sm:gap-3">
          <button
            onClick={() => fetchMentors(true)}
            disabled={isRefreshing || isLoading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-3.5 py-2 font-sans text-xs text-[#707884] transition-all hover:border-[#D5CEBF] hover:bg-[#F7F5F0] hover:text-[#303030] disabled:opacity-50 sm:flex-initial sm:text-xs md:text-sm 2xl:px-4 2xl:py-2.5 2xl:text-base"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshing ? 'animate-spin text-[#E85D04]' : ''
              }`}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Sync CMS'}</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#303030] px-4 py-2 font-sans text-xs font-medium uppercase tracking-wider text-[#F7F5F0] transition-all hover:bg-[#E85D04] sm:flex-initial sm:text-xs md:text-sm 2xl:px-5 2xl:py-2.5 2xl:text-base"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-110 2xl:h-5 2xl:w-5" />
            <span>Add Mentor</span>
          </button>
        </div>
      </div>

      {/* Network Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 sm:text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mentors Cards Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-6"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`mentor-skeleton-${index}`}
              className="animate-pulse rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)]"
            >
              <div className="aspect-[3/4] w-full rounded-xl bg-[#E6E2D8]/60" />
              <div className="mt-4 h-5 w-3/4 rounded bg-[#E6E2D8]/70" />
              <div className="mt-2 h-4 w-1/2 rounded bg-[#E6E2D8]/50" />
            </div>
          ))
        ) : mentors.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-16 text-center text-[#707884]">
            <Users className="mx-auto h-9 w-9 text-[#D5CEBF] 2xl:h-11 2xl:w-11" />
            <span className="mt-3 block font-serif text-lg text-[#303030] sm:text-xl">
              No Mentors Registered Yet
            </span>
            <span className="mt-1 block text-xs sm:text-sm">
              Click &quot;Add Mentor&quot; above to publish your first academic profile.
            </span>
          </div>
        ) : (
          mentors.map((mentor) => {
            const isPrincipal = isPrincipalRole(mentor.role);

            return (
              <div
                key={mentor._id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] transition-all hover:shadow-[0_15px_35px_rgba(48,48,48,0.06)] ${
                  mentor.isActive ? 'border-[#E6E2D8]' : 'border-[#E6E2D8]/60 opacity-75'
                }`}
              >
                <div>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F7F5F0]">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleActive(mentor)}
                      className="absolute top-2.5 right-2.5 rounded-lg border border-[#E6E2D8] bg-[#FFFFFF]/90 p-1.5 text-xs text-[#303030] backdrop-blur-sm transition-colors hover:bg-[#FFFFFF]"
                      title={mentor.isActive ? 'Published on About page' : 'Hidden from About page'}
                    >
                      {mentor.isActive ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-[#707884]" />
                      )}
                    </button>

                    {isPrincipal && (
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-[#E85D04] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#FFFFFF] shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        Homepage Principal
                      </span>
                    )}

                    <span className="absolute bottom-2.5 left-2.5 rounded-md border border-[#E6E2D8] bg-[#FFFFFF]/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#707884] backdrop-blur-sm">
                      Seq #{mentor.order ?? 0}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-serif text-lg font-normal text-[#303030] 2xl:text-xl">
                      {mentor.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-[#E85D04] 2xl:text-sm">
                      {mentor.role}
                    </p>
                    <p className="mt-2 text-[11px] text-[#707884] line-clamp-2 2xl:text-xs">
                      {mentor.achievements?.join(' • ') || 'No achievements listed'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#E6E2D8] pt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                      mentor.isActive ? 'text-emerald-700' : 'text-[#707884]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        mentor.isActive ? 'bg-emerald-600' : 'bg-[#707884]'
                      }`}
                    />
                    {mentor.isActive ? 'Published on About' : 'Hidden on About'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(mentor)}
                      className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] transition-colors hover:bg-[#F7F5F0] hover:text-[#303030]"
                      title="Edit mentor profile"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMentor(mentor._id, mentor.name)}
                      className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      title="Delete mentor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 bg-[#303030]/50 backdrop-blur-sm"
          />

          <div
            ref={modalRef}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-2xl sm:p-8 2xl:max-w-xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#303030] sm:text-2xl">
                  {editingMentor ? 'Edit Mentor Profile' : 'Register New Mentor'}
                </h3>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#707884]">
                  Academic Mentorship Registry
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="rounded-xl p-1.5 text-[#707884] hover:bg-[#F7F5F0] hover:text-[#303030]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {/* Image Upload & Preview Section */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Portrait Asset (ImageKit CDN)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]">
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-3.5 py-2 text-xs font-medium text-[#303030] transition-colors hover:bg-[#F7F5F0]"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#E85D04]" />
                      <span>{selectedFile ? 'Replace Selected Image' : 'Upload New Photo'}</span>
                    </button>
                    <p className="mt-1 text-[11px] text-[#707884]">
                      {selectedFile ? selectedFile.name : 'PNG, JPG, or WEBP up to 5MB'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Full Name &amp; Honors
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Santanu Dasgupta"
                  required
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>

              {/* Official Role */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Official Designation / Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Principal / Senior Lecturer"
                  required
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
                {isPrincipalRole(formData.role) && (
                  <p className="mt-1 text-[11px] font-medium text-[#E85D04]">
                    This mentor will automatically be displayed in the Principal Message section on the Homepage (even if hidden from the About page).
                  </p>
                )}
              </div>

              {/* Display Order Sequence */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Display Order Sequence
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>

              {/* Achievements */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Achievements &amp; Credentials (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.achievementsText}
                  onChange={(e) =>
                    setFormData({ ...formData, achievementsText: e.target.value })
                  }
                  placeholder="Ph.D. in Hospitality Administration&#10;25+ Years of Academic Leadership&#10;Published 15+ Research Papers"
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 p-3 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mentorActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-[#E6E2D8] text-[#E85D04] focus:ring-[#E85D04]"
                />
                <label
                  htmlFor="mentorActiveToggle"
                  className="text-xs font-medium text-[#303030]"
                >
                  Publish live to About Us page (Principal is always shown on Homepage)
                </label>
              </div>

              {/* Actions & Status */}
              <div className="mt-6 flex items-center justify-between border-t border-[#E6E2D8] pt-4">
                <span className="text-xs text-[#707884]">{uploadProgressText}</span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="rounded-xl border border-[#E6E2D8] px-4 py-2 text-xs text-[#707884] hover:bg-[#F7F5F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-[#303030] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#F7F5F0] hover:bg-[#E85D04] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingMentor ? 'Save Changes' : 'Publish Mentor'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}