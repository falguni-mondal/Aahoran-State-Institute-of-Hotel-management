import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Building,
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
  Images,
  FolderOpen,
} from 'lucide-react';
import apiClient from '../api/axios.js';
import { uploadMultipleToImageKit } from '../utils/imagekitUpload.js';
import { useLenis } from '../providers/SmoothScrollProvider.jsx';

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function ManageCampusFacilities() {
  const lenis = useLenis();

  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [formError, setFormError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    order: 0,
    isActive: true,
  });

  // Existing saved images (when editing) + newly queued files
  const [existingImages, setExistingImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchFacilities = useCallback(async (manualSync = false) => {
    if (manualSync) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await apiClient.get('/campus-facilities/admin');
      if (
        response.data?.status === 'success' &&
        Array.isArray(response.data.facilities)
      ) {
        setFacilities(response.data.facilities);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to synchronize campus facilities from CMS registry.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities(false);
  }, [fetchFacilities]);

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

  const handleOpenModal = (facility = null) => {
    setFormError(null);
    setUploadProgressText('');
    setPendingFiles([]);

    if (facility) {
      setEditingFacility(facility);
      setFormData({
        title: facility.title || '',
        slug: facility.slug || toSlug(facility.title),
        order: facility.order ?? 0,
        isActive: facility.isActive !== false,
      });
      setExistingImages(
        Array.isArray(facility.images)
          ? facility.images.map((img) => ({
              url: img.url || img.src,
              fileId: img.fileId || null,
              alt: img.alt || facility.title || '',
            }))
          : []
      );
    } else {
      setEditingFacility(null);
      setFormData({
        title: '',
        slug: '',
        order: facilities.length + 1,
        isActive: true,
      });
      setExistingImages([]);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    pendingFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setPendingFiles([]);
    setIsModalOpen(false);
    setEditingFacility(null);
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setFormError('Some files were skipped. Only PNG, JPG, and WEBP images are allowed.');
    } else {
      setFormError(null);
    }

    const mapped = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      alt:
        formData.title.trim() ||
        file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
    }));

    setPendingFiles((prev) => [...prev, ...mapped]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePendingFile = (index) => {
    setPendingFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = formData.title.trim();
    if (!cleanTitle) {
      setFormError('Facility title is required.');
      return;
    }

    if (existingImages.length === 0 && pendingFiles.length === 0) {
      setFormError('Please upload at least one image for this campus facility.');
      return;
    }

    const targetSlug = toSlug(formData.slug || cleanTitle) || 'general';
    const imagekitFolder = `/campus-facilities/${targetSlug}`;

    setIsSubmitting(true);

    try {
      let newlyUploadedImages = [];

      if (pendingFiles.length > 0) {
        const uploadedResults = await uploadMultipleToImageKit(
          pendingFiles.map((item) => item.file),
          imagekitFolder,
          (current, total) => {
            setUploadProgressText(
              `Uploading image ${current} of ${total} to ImageKit (${imagekitFolder})...`
            );
          }
        );

        newlyUploadedImages = uploadedResults.map((res, idx) => ({
          url: res.url,
          fileId: res.fileId,
          alt: pendingFiles[idx]?.alt?.trim() || cleanTitle,
        }));
      }

      setUploadProgressText('Saving campus facility...');

      const finalImages = [...existingImages, ...newlyUploadedImages];

      const payload = {
        title: cleanTitle,
        slug: targetSlug,
        images: finalImages,
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      if (editingFacility) {
        const response = await apiClient.put(
          `/campus-facilities/${editingFacility._id}`,
          payload
        );
        if (response.data?.status === 'success') {
          setFacilities((prev) =>
            prev.map((item) =>
              item._id === editingFacility._id ? response.data.facility : item
            )
          );
          handleCloseModal();
        }
      } else {
        const response = await apiClient.post('/campus-facilities', payload);
        if (response.data?.status === 'success') {
          setFacilities((prev) => [...prev, response.data.facility]);
          handleCloseModal();
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save campus facility. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  const handleDeleteFacility = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? All associated ImageKit images will be permanently removed.`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/campus-facilities/${id}`);
      setFacilities((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete facility.');
    }
  };

  const handleToggleActive = async (facility) => {
    try {
      const response = await apiClient.put(
        `/campus-facilities/${facility._id}`,
        {
          isActive: !facility.isActive,
        }
      );
      if (response.data?.status === 'success') {
        setFacilities((prev) =>
          prev.map((item) =>
            item._id === facility._id ? response.data.facility : item
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle visibility.');
    }
  };

  const previewSlug = toSlug(formData.slug || formData.title) || 'facility-name';

  return (
    <div ref={containerRef} className="space-y-6 2xl:space-y-8">
      {/* Top Header Strip */}
      <div
        ref={headerRef}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="font-serif text-2xl font-normal tracking-tight text-[#303030] sm:text-2xl md:text-3xl 2xl:text-4xl">
            Campus <span className="italic text-[#E85D04]">Facilities</span>
          </h2>
          <p className="mt-1 font-sans text-xs text-[#707884] sm:text-xs md:text-sm 2xl:text-base">
            Add and manage campus facility sections and multi-image galleries stored in ImageKit (delivered at 1600w on desktop &amp; 1200w on mobile).
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={() => fetchFacilities(true)}
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
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 sm:text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Facilities Cards Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:gap-6"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`facility-skeleton-${index}`}
              className="animate-pulse rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)]"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-[#E6E2D8]/60" />
              <div className="mt-4 h-5 w-2/3 rounded bg-[#E6E2D8]/70" />
              <div className="mt-2 h-4 w-1/3 rounded bg-[#E6E2D8]/50" />
            </div>
          ))
        ) : facilities.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-12 text-center text-[#707884] sm:p-16">
            <Building className="mx-auto h-9 w-9 text-[#D5CEBF] 2xl:h-11 2xl:w-11" />
            <span className="mt-3 block font-serif text-lg text-[#303030] sm:text-xl">
              No Custom Campus Facilities Added Yet
            </span>
            <span className="mt-1 block text-xs sm:text-sm">
              Click &quot;Add Facility&quot; above to create a facility section (e.g., Library, Activities, Smart Classrooms) with ImageKit photos.
            </span>
          </div>
        ) : (
          facilities.map((facility, idx) => {
            const coverImg = facility.images?.[0]?.url || '/facilities_hero.webp';
            const imgCount = facility.images?.length || 0;

            return (
              <div
                key={facility._id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] transition-all hover:shadow-[0_15px_35px_rgba(48,48,48,0.06)] ${
                  facility.isActive
                    ? 'border-[#E6E2D8]'
                    : 'border-[#E6E2D8]/60 opacity-60'
                }`}
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F7F5F0]">
                    <img
                      src={coverImg}
                      alt={facility.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleActive(facility)}
                      className="absolute top-2.5 right-2.5 rounded-lg border border-[#E6E2D8] bg-[#FFFFFF]/90 p-1.5 text-xs text-[#303030] backdrop-blur-sm transition-colors hover:bg-[#FFFFFF]"
                      title={
                        facility.isActive
                          ? 'Published on Campus Facilities page'
                          : 'Hidden'
                      }
                    >
                      {facility.isActive ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-[#707884]" />
                      )}
                    </button>

                    <span className="absolute bottom-2.5 left-2.5 rounded-md border border-[#E6E2D8] bg-[#FFFFFF]/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#707884] backdrop-blur-sm">
                      Facility 0{idx + 1} • Seq #{facility.order ?? 0}
                    </span>

                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md border border-[#E6E2D8] bg-[#FFFFFF]/90 px-2 py-0.5 font-sans text-[10px] font-semibold text-[#303030] backdrop-blur-sm">
                      <Images className="h-3 w-3 text-[#E85D04]" />
                      {imgCount} {imgCount === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>

                  {/* Thumbnail strip */}
                  {facility.images?.length > 1 && (
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                      {facility.images.slice(0, 5).map((img, i) => (
                        <img
                          key={img._id || i}
                          src={img.url}
                          alt={img.alt || facility.title}
                          className="h-10 w-14 shrink-0 rounded-lg border border-[#E6E2D8] object-cover"
                        />
                      ))}
                      {facility.images.length > 5 && (
                        <span className="text-[11px] font-medium text-[#707884]">
                          +{facility.images.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <h3 className="font-serif text-xl font-normal text-[#303030] 2xl:text-2xl">
                      {facility.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#707884]">
                      <span className="inline-flex items-center gap-1 font-mono text-[#E85D04]">
                        <FolderOpen className="h-3 w-3" />
                        /campus-facilities/{facility.slug}
                      </span>
                      <span>•</span>
                      <span className="font-mono">#{facility.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#E6E2D8] pt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                      facility.isActive ? 'text-emerald-700' : 'text-[#707884]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        facility.isActive ? 'bg-emerald-600' : 'bg-[#707884]'
                      }`}
                    />
                    {facility.isActive ? 'Published' : 'Hidden'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(facility)}
                      className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] transition-colors hover:bg-[#F7F5F0] hover:text-[#303030]"
                      title="Edit facility"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteFacility(facility._id, facility.title)
                      }
                      className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      title="Delete facility"
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

      {/* Add / Edit Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 bg-[#303030]/50 backdrop-blur-sm"
          />

          <div
            ref={modalRef}
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#E6E2D8] bg-[#FFFFFF] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#303030] sm:text-2xl">
                  {editingFacility
                    ? 'Edit Campus Facility'
                    : 'Add Campus Facility'}
                </h3>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#707884]">
                  ImageKit Folder: /campus-facilities/{previewSlug}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Facility Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title: nextTitle,
                        slug: editingFacility ? prev.slug : toSlug(nextTitle),
                      }));
                    }}
                    placeholder="e.g. Library, Activities, Training Kitchen"
                    required
                    disabled={isSubmitting}
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Display Sequence
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

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                  Section Anchor ID / ImageKit Subfolder
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: toSlug(e.target.value) })
                  }
                  placeholder="library"
                  disabled={isSubmitting}
                  className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2 font-mono text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF]"
                />
                <p className="mt-1 text-[11px] text-[#707884]">
                  Used for hash scrolling (<code>/campus-facilities#{previewSlug}</code>) and ImageKit storage path (<code>/campus-facilities/{previewSlug}</code>).
                </p>
              </div>

              {/* Multi-Image Upload Box */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Facility Gallery Images (ImageKit CDN) *
                  </label>
                  <span className="text-[11px] text-[#707884]">
                    {existingImages.length + pendingFiles.length} total image(s)
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D5CEBF] bg-[#F7F5F0]/50 p-5 text-center transition-colors hover:border-[#E85D04] hover:bg-[#F7F5F0]"
                >
                  <Upload className="h-5 w-5 text-[#E85D04]" />
                  <span className="text-xs font-medium text-[#303030] sm:text-sm">
                    Click to select one or multiple facility photos
                  </span>
                  <span className="text-[11px] text-[#707884]">
                    Automatically stored in ImageKit under /campus-facilities/{previewSlug} and rendered at 1600w (desktop) &amp; 1200w (mobile)
                  </span>
                </button>

                {/* Existing Images List */}
                {existingImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                      Uploaded Images ({existingImages.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {existingImages.map((img, idx) => (
                        <div
                          key={`existing-${idx}`}
                          className="flex items-center gap-3 rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/40 p-2"
                        >
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="h-14 w-20 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <input
                              type="text"
                              value={img.alt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExistingImages((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, alt: val } : item
                                  )
                                );
                              }}
                              placeholder="Image alt description"
                              className="w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            disabled={isSubmitting}
                            className="rounded-lg p-1.5 text-[#707884] hover:bg-rose-50 hover:text-rose-600"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Files List */}
                {pendingFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#E85D04]">
                      New Images Queued for Upload ({pendingFiles.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {pendingFiles.map((item, idx) => (
                        <div
                          key={`pending-${idx}`}
                          className="flex items-center gap-3 rounded-xl border border-[#E85D04]/30 bg-[#E85D04]/5 p-2"
                        >
                          <img
                            src={item.previewUrl}
                            alt={item.alt}
                            className="h-14 w-20 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <input
                              type="text"
                              value={item.alt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPendingFiles((prev) =>
                                  prev.map((entry, i) =>
                                    i === idx ? { ...entry, alt: val } : entry
                                  )
                                );
                              }}
                              placeholder="Image alt description"
                              className="w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(idx)}
                            disabled={isSubmitting}
                            className="rounded-lg p-1.5 text-[#707884] hover:bg-rose-50 hover:text-rose-600"
                            title="Remove queued file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="facilityActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-[#E6E2D8] text-[#E85D04] focus:ring-[#E85D04]"
                />
                <label
                  htmlFor="facilityActiveToggle"
                  className="text-xs font-medium text-[#303030]"
                >
                  Publish live to Campus Facilities page
                </label>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 flex flex-col gap-3 border-t border-[#E6E2D8] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-[#707884]">
                  {uploadProgressText}
                </span>

                <div className="flex items-center justify-end gap-3">
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
                        {editingFacility ? 'Save Changes' : 'Publish Facility'}
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