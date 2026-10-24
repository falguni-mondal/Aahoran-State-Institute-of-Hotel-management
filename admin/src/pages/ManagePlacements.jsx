import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Briefcase,
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
} from 'lucide-react';
import apiClient from '../api/axios.js';
import { uploadToImageKit } from '../utils/imagekitUpload.js';
import { useLenis } from '../providers/SmoothScrollProvider.jsx';

export default function ManagePlacements() {
  const lenis = useLenis();

  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    role: '',
    company: '',
    order: 0,
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('/nchmct-bg.webp');

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchPlacements = useCallback(async (manualSync = false) => {
    if (manualSync) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await apiClient.get('/placements/admin');
      if (
        response.data?.status === 'success' &&
        Array.isArray(response.data.placements)
      ) {
        setPlacements(response.data.placements);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to synchronize Executive Roster records from CMS.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacements(false);
  }, [fetchPlacements]);

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

  const handleOpenModal = (item = null) => {
    setFormError(null);
    setUploadProgressText('');
    setSelectedFile(null);

    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        batch: item.batch || '',
        role: item.role || '',
        company: item.company || '',
        order: item.order ?? 0,
        isActive: item.isActive !== false,
      });
      setPreviewImageUrl(item.image || '/nchmct-bg.webp');
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        batch: 'B.Sc. HHA (2022-2025)',
        role: '',
        company: '',
        order: placements.length + 1,
        isActive: true,
      });
      setPreviewImageUrl('/nchmct-bg.webp');
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingItem(null);
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
    setPreviewImageUrl(URL.createObjectURL(file));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (
      !formData.name.trim() ||
      !formData.batch.trim() ||
      !formData.role.trim() ||
      !formData.company.trim()
    ) {
      setFormError(
        'Candidate name, batch, appointed role, and hiring organization are required.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = editingItem ? editingItem.image : '/nchmct-bg.webp';
      let finalImageFileId = editingItem ? editingItem.imageFileId : null;

      if (selectedFile) {
        setUploadProgressText(
          'Uploading candidate portrait to ImageKit (/placements/executive-roster)...'
        );
        const uploadResult = await uploadToImageKit(
          selectedFile,
          '/placements/executive-roster'
        );
        finalImageUrl = uploadResult.url;
        finalImageFileId = uploadResult.fileId;
      }

      setUploadProgressText('Saving Executive Roster record...');

      const payload = {
        name: formData.name.trim(),
        batch: formData.batch.trim(),
        role: formData.role.trim(),
        company: formData.company.trim(),
        image: finalImageUrl,
        imageFileId: finalImageFileId,
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      if (editingItem) {
        const response = await apiClient.put(
          `/placements/${editingItem._id}`,
          payload
        );
        if (response.data?.status === 'success') {
          setPlacements((prev) =>
            prev.map((item) =>
              item._id === editingItem._id ? response.data.placement : item
            )
          );
          handleCloseModal();
        }
      } else {
        const response = await apiClient.post('/placements', payload);
        if (response.data?.status === 'success') {
          setPlacements((prev) => [...prev, response.data.placement]);
          handleCloseModal();
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save Executive Roster record. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  const handleDeletePlacement = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${name}" from the Executive Roster? Its ImageKit asset will also be deleted.`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/placements/${id}`);
      setPlacements((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await apiClient.put(`/placements/${item._id}`, {
        isActive: !item.isActive,
      });
      if (response.data?.status === 'success') {
        setPlacements((prev) =>
          prev.map((entry) =>
            entry._id === item._id ? response.data.placement : entry
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visibility.');
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
            Executive <span className="italic text-[#E85D04]">Roster</span>
          </h2>
          <p className="mt-1 font-sans text-xs text-[#707884] sm:text-xs md:text-sm 2xl:text-base">
            Manage Placement Page alumni outcomes. Images are stored in ImageKit (<code>/placements/executive-roster</code>) and served at 1200w on desktop &amp; 800w on mobile.
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={() => fetchPlacements(true)}
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
            type="button"
            onClick={() => handleOpenModal()}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#303030] px-4 py-2 font-sans text-xs font-medium uppercase tracking-wider text-[#F7F5F0] transition-all hover:bg-[#E85D04] sm:flex-initial sm:text-xs md:text-sm 2xl:px-5 2xl:py-2.5 2xl:text-base"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-110 2xl:h-5 2xl:w-5" />
            <span>Add Roster Item</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 sm:text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Roster Cards Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-6"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`placement-skeleton-${index}`}
              className="animate-pulse rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)]"
            >
              <div className="aspect-[3/4] w-full rounded-xl bg-[#E6E2D8]/60" />
              <div className="mt-4 h-5 w-3/4 rounded bg-[#E6E2D8]/70" />
              <div className="mt-2 h-4 w-1/2 rounded bg-[#E6E2D8]/50" />
            </div>
          ))
        ) : placements.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-12 text-center text-[#707884] sm:p-16">
            <Briefcase className="mx-auto h-9 w-9 text-[#D5CEBF] 2xl:h-11 2xl:w-11" />
            <span className="mt-3 block font-serif text-lg text-[#303030] sm:text-xl">
              No Custom Executive Roster Records in Database
            </span>
            <span className="mt-1 mx-auto block max-w-lg text-xs sm:text-sm">
              The public Placement page is currently showing the default placeholder Executive Roster. Click &quot;Add Roster Item&quot; above to publish live alumni placement records.
            </span>
          </div>
        ) : (
          placements.map((item) => (
            <div
              key={item._id}
              className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] transition-all hover:shadow-[0_15px_35px_rgba(48,48,48,0.06)] ${
                item.isActive
                  ? 'border-[#E6E2D8]'
                  : 'border-[#E6E2D8]/60 opacity-60'
              }`}
            >
              <div>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F7F5F0]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className="absolute top-2.5 right-2.5 rounded-lg border border-[#E6E2D8] bg-[#FFFFFF]/90 p-1.5 text-xs text-[#303030] backdrop-blur-sm transition-colors hover:bg-[#FFFFFF]"
                    title={item.isActive ? 'Published' : 'Hidden'}
                  >
                    {item.isActive ? (
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-[#707884]" />
                    )}
                  </button>

                  <span className="absolute bottom-2.5 left-2.5 rounded-md border border-[#E6E2D8] bg-[#FFFFFF]/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#707884] backdrop-blur-sm">
                    Seq #{item.order ?? 0}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#F7F5F0] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#E85D04]">
                      {item.company}
                    </span>
                    <span className="font-mono text-[10px] text-[#707884]">
                      {item.batch}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-normal text-[#303030] 2xl:text-xl">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#707884] 2xl:text-sm">
                    {item.role}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#E6E2D8] pt-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                    item.isActive ? 'text-emerald-700' : 'text-[#707884]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.isActive ? 'bg-emerald-600' : 'bg-[#707884]'
                    }`}
                  />
                  {item.isActive ? 'Published' : 'Hidden'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(item)}
                    className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] transition-colors hover:bg-[#F7F5F0] hover:text-[#303030]"
                    title="Edit roster item"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlacement(item._id, item.name)}
                    className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    title="Delete roster item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
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
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#303030] sm:text-2xl">
                  {editingItem
                    ? 'Edit Executive Roster Entry'
                    : 'Add Executive Roster Entry'}
                </h3>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#707884]">
                  Placement Page • /placements/executive-roster
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

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Candidate Portrait (ImageKit CDN)
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
                      <span>
                        {selectedFile ? 'Replace Selected Photo' : 'Upload Photo'}
                      </span>
                    </button>
                    <p className="mt-1 text-[11px] text-[#707884]">
                      {selectedFile
                        ? selectedFile.name
                        : 'Delivered at 1200w on desktop & 800w on mobile'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Candidate Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Nikhil Raj"
                  required
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>

              {/* Academic Batch */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Course &amp; Academic Batch *
                </label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                  placeholder="e.g. B.Sc. HHA (2018-2021)"
                  required
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>

              {/* Appointed Role */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Appointed Role / Designation *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="e.g. Guest Service Associate (F&B)"
                  required
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                />
              </div>

              {/* Hiring Organization & Order */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Hiring Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="e.g. Courtyard by Marriott"
                    required
                    disabled={isSubmitting}
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="placementActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-[#E6E2D8] text-[#E85D04] focus:ring-[#E85D04]"
                />
                <label
                  htmlFor="placementActiveToggle"
                  className="text-xs font-medium text-[#303030]"
                >
                  Publish live to Executive Roster on Placement page
                </label>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#E6E2D8] pt-4">
                <span className="text-xs text-[#707884]">
                  {uploadProgressText}
                </span>

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
                      <span>
                        {editingItem ? 'Save Changes' : 'Publish Roster Item'}
                      </span>
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