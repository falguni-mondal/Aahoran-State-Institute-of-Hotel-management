import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Images,
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
  Calendar,
  FolderOpen,
} from 'lucide-react';
import apiClient from '../api/axios.js';
import { uploadMultipleToImageKit } from '../utils/imagekitUpload.js';
import { useLenis } from '../providers/SmoothScrollProvider.jsx';

export const GALLERY_SUBNAVS = [
  {
    key: 'our-campus',
    label: 'Our Campus',
    route: '/our-campus',
    hasDate: false,
    description: 'Campus architecture & infrastructure photos (images only).',
  },
  {
    key: 'inaugural-programme',
    label: 'Inaugural Programme',
    route: '/inaugural-programme',
    hasDate: false,
    description: 'Grand opening & inaugural ceremony captures (images only).',
  },
  {
    key: 'freshers-welcome',
    label: "Nabayon (Fresher's Welcome)",
    route: '/freshers-welcome',
    hasDate: true,
    description: 'Orientation posts with Program Date & Year + event photos.',
  },
  {
    key: 'farewell',
    label: 'Anujñā (Farewell)',
    route: '/farewell',
    hasDate: true,
    description: 'Farewell posts with Program Date & Year + event photos.',
  },
  {
    key: 'krida',
    label: 'Krīḍā (Annual Sports)',
    route: '/krida',
    hasDate: true,
    description: 'Annual sports meet posts with Program Date & Year + photos.',
  },
  {
    key: 'stcp',
    label: 'STCP & Skill Development',
    route: '/stcp',
    hasDate: true,
    description: 'Skill development program posts with Program Date & Year + photos.',
  },
  {
    key: 'programme-and-events',
    label: 'Programme and Events',
    route: '/programme-and-events',
    hasDate: true,
    description: 'Campus event posts with Program Date & Year + photos.',
  },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatPreviewDate = (rawDate) => {
  if (!rawDate) return { formattedDate: '', year: '' };
  const isoMatch = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const monthName = MONTHS[parseInt(m, 10) - 1] || '';
    return {
      formattedDate: `${monthName} ${String(parseInt(d, 10)).padStart(2, '0')}, ${y}`,
      year: y,
    };
  }
  const yearMatch = String(rawDate).match(/\b(19|20)\d{2}\b/);
  return {
    formattedDate: rawDate,
    year: yearMatch ? yearMatch[0] : '',
  };
};

export default function ManageGallery() {
  const lenis = useLenis();

  const [activeCategory, setActiveCategory] = useState(GALLERY_SUBNAVS[0].key);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [formError, setFormError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: GALLERY_SUBNAVS[0].key,
    programDate: '',
    year: '',
    title: '',
    description: '',
    order: 0,
    isActive: true,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentSubnav =
    GALLERY_SUBNAVS.find((s) => s.key === activeCategory) || GALLERY_SUBNAVS[0];

  const fetchGalleryItems = useCallback(
    async (manualSync = false) => {
      if (manualSync) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const response = await apiClient.get(
          `/gallery/admin?category=${activeCategory}`
        );
        if (
          response.data?.status === 'success' &&
          Array.isArray(response.data.items)
        ) {
          setItems(response.data.items);
        }
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message ||
            'Failed to synchronize gallery entries from CMS.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeCategory]
  );

  useEffect(() => {
    fetchGalleryItems(false);
  }, [fetchGalleryItems]);

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
    setPendingFiles([]);

    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category || activeCategory,
        programDate: item.programDate || '',
        year: item.year || '',
        title: item.title || '',
        description: item.description || '',
        order: item.order ?? 0,
        isActive: item.isActive !== false,
      });
      setExistingImages(
        Array.isArray(item.images)
          ? item.images.map((img) => ({
              url: img.url,
              fileId: img.fileId || null,
              alt: img.alt || '',
              aspect: img.aspect || 'horizontal',
            }))
          : []
      );
    } else {
      setEditingItem(null);
      const todayIso = new Date().toISOString().slice(0, 10);
      setFormData({
        category: activeCategory,
        programDate: currentSubnav.hasDate ? todayIso : '',
        year: currentSubnav.hasDate ? todayIso.slice(0, 4) : '',
        title: '',
        description: '',
        order: items.length + 1,
        isActive: true,
      });
      setExistingImages([]);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    pendingFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setPendingFiles([]);
    setIsModalOpen(false);
    setEditingItem(null);
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

    const aspects = ['vertical', 'horizontal', 'square'];
    const baseIdx = existingImages.length + pendingFiles.length;

    const mapped = validFiles.map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      alt:
        formData.title.trim() ||
        currentSubnav.label ||
        file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
      aspect: aspects[(baseIdx + idx) % aspects.length],
    }));

    setPendingFiles((prev) => [...prev, ...mapped]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemovePendingFile = (idx) => {
    setPendingFiles((prev) => {
      const target = prev[idx];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const modalSubnav =
    GALLERY_SUBNAVS.find((s) => s.key === formData.category) || currentSubnav;

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (modalSubnav.hasDate && !formData.programDate.trim()) {
      setFormError(
        `Please select the Date of the Program for ${modalSubnav.label}.`
      );
      return;
    }

    if (existingImages.length === 0 && pendingFiles.length === 0) {
      setFormError('Please select at least one image to upload.');
      return;
    }

    const imagekitFolder = `/gallery/${formData.category}`;
    setIsSubmitting(true);

    try {
      let newlyUploadedImages = [];

      if (pendingFiles.length > 0) {
        const uploadedResults = await uploadMultipleToImageKit(
          pendingFiles.map((item) => item.file),
          imagekitFolder,
          (current, total) => {
            setUploadProgressText(
              `Uploading photo ${current} of ${total} to ImageKit (${imagekitFolder})...`
            );
          }
        );

        newlyUploadedImages = uploadedResults.map((res, idx) => ({
          url: res.url,
          fileId: res.fileId,
          alt:
            pendingFiles[idx]?.alt?.trim() ||
            formData.title.trim() ||
            modalSubnav.label,
          aspect: pendingFiles[idx]?.aspect || 'horizontal',
        }));
      }

      setUploadProgressText('Saving gallery post...');

      const finalImages = [...existingImages, ...newlyUploadedImages];
      const datePreview = formatPreviewDate(formData.programDate);

      const payload = {
        category: formData.category,
        programDate: modalSubnav.hasDate ? formData.programDate.trim() : '',
        year: modalSubnav.hasDate
          ? formData.year.trim() || datePreview.year
          : '',
        title: formData.title.trim(),
        description: formData.description.trim(),
        images: finalImages,
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      if (editingItem) {
        const response = await apiClient.put(
          `/gallery/${editingItem._id}`,
          payload
        );
        if (response.data?.status === 'success') {
          if (payload.category === activeCategory) {
            setItems((prev) =>
              prev.map((entry) =>
                entry._id === editingItem._id ? response.data.item : entry
              )
            );
          } else {
            setItems((prev) =>
              prev.filter((entry) => entry._id !== editingItem._id)
            );
          }
          handleCloseModal();
        }
      } else {
        const response = await apiClient.post('/gallery', payload);
        if (response.data?.status === 'success') {
          if (payload.category === activeCategory) {
            setItems((prev) => [response.data.item, ...prev]);
          }
          handleCloseModal();
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save gallery post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  const handleDeleteItem = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this gallery entry and purge all its photos from ImageKit?'
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/gallery/${id}`);
      setItems((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete gallery entry.');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await apiClient.put(`/gallery/${item._id}`, {
        isActive: !item.isActive,
      });
      if (response.data?.status === 'success') {
        setItems((prev) =>
          prev.map((entry) =>
            entry._id === item._id ? response.data.item : entry
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visibility.');
    }
  };

  const datePreviewInfo = formatPreviewDate(formData.programDate);

  return (
    <div ref={containerRef} className="space-y-6 2xl:space-y-8">
      {/* Top Header Strip */}
      <div
        ref={headerRef}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="font-serif text-2xl font-normal tracking-tight text-[#303030] sm:text-2xl md:text-3xl 2xl:text-4xl">
            Gallery <span className="italic text-[#E85D04]">Subnavs CMS</span>
          </h2>
          <p className="mt-1 font-sans text-xs text-[#707884] sm:text-xs md:text-sm 2xl:text-base">
            Perform CRUD operations across all 7 Gallery navigation sub-pages with ImageKit storage and Facebook-post style program date &amp; year grouping.
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={() => fetchGalleryItems(true)}
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
            <span>
              {currentSubnav.hasDate ? 'Add Program Post' : 'Upload Photos'}
            </span>
          </button>
        </div>
      </div>

      {/* Subnav Category Selector Tabs */}
      <div className="rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-3 shadow-[0_10px_30px_rgba(48,48,48,0.03)] sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {GALLERY_SUBNAVS.map((subnav) => {
            const isSelected = activeCategory === subnav.key;
            return (
              <button
                key={subnav.key}
                type="button"
                onClick={() => setActiveCategory(subnav.key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 font-sans text-xs font-medium transition-all sm:text-xs md:text-sm ${
                  isSelected
                    ? 'bg-[#303030] text-[#F7F5F0] shadow-sm'
                    : 'border border-[#E6E2D8] bg-[#F7F5F0]/60 text-[#707884] hover:bg-[#F7F5F0] hover:text-[#303030]'
                }`}
              >
                <span>{subnav.label}</span>
                {subnav.hasDate && (
                  <Calendar
                    className={`h-3 w-3 ${
                      isSelected ? 'text-[#E85D04]' : 'text-[#707884]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col justify-between gap-2 border-t border-[#E6E2D8]/80 pt-3 text-xs text-[#707884] sm:flex-row sm:items-center">
          <span>{currentSubnav.description}</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#E85D04]">
            <FolderOpen className="h-3.5 w-3.5" />
            ImageKit Folder: /gallery/{currentSubnav.key}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 sm:text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Gallery Posts / Albums Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:gap-6"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`gallery-skeleton-${index}`}
              className="animate-pulse rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)]"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-[#E6E2D8]/60" />
              <div className="mt-4 h-5 w-2/3 rounded bg-[#E6E2D8]/70" />
              <div className="mt-2 h-4 w-1/2 rounded bg-[#E6E2D8]/50" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#E6E2D8] bg-[#FFFFFF] p-12 text-center text-[#707884] sm:p-16">
            <Images className="mx-auto h-9 w-9 text-[#D5CEBF] 2xl:h-11 2xl:w-11" />
            <span className="mt-3 block font-serif text-lg text-[#303030] sm:text-xl">
              No Custom Entries in &ldquo;{currentSubnav.label}&rdquo; Yet
            </span>
            <span className="mt-1 mx-auto block max-w-lg text-xs sm:text-sm">
              The public page ({currentSubnav.route}) currently shows default placeholder photos until you publish your first entry above.
            </span>
          </div>
        ) : (
          items.map((item) => {
            const coverImg = item.images?.[0]?.url || '/campus_hero.webp';
            const imgCount = item.images?.length || 0;

            return (
              <div
                key={item._id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(48,48,48,0.03)] transition-all hover:shadow-[0_15px_35px_rgba(48,48,48,0.06)] ${
                  item.isActive
                    ? 'border-[#E6E2D8]'
                    : 'border-[#E6E2D8]/60 opacity-60'
                }`}
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F7F5F0]">
                    <img
                      src={coverImg}
                      alt={item.title || currentSubnav.label}
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

                    {item.year && (
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-[#303030]/90 px-2.5 py-1 font-sans text-[11px] font-bold tracking-wider text-[#F7F5F0] backdrop-blur-sm">
                        {item.year}
                      </span>
                    )}

                    <span className="absolute bottom-2.5 left-2.5 rounded-md border border-[#E6E2D8] bg-[#FFFFFF]/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#707884] backdrop-blur-sm">
                      Seq #{item.order ?? 0}
                    </span>

                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md border border-[#E6E2D8] bg-[#FFFFFF]/90 px-2 py-0.5 font-sans text-[10px] font-semibold text-[#303030] backdrop-blur-sm">
                      <Images className="h-3 w-3 text-[#E85D04]" />
                      {imgCount} {imgCount === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>

                  {/* Thumbnail strip */}
                  {item.images?.length > 1 && (
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                      {item.images.slice(0, 5).map((img, i) => (
                        <img
                          key={img._id || i}
                          src={img.url}
                          alt={img.alt || currentSubnav.label}
                          className="h-10 w-14 shrink-0 rounded-lg border border-[#E6E2D8] object-cover"
                        />
                      ))}
                      {item.images.length > 5 && (
                        <span className="text-[11px] font-medium text-[#707884]">
                          +{item.images.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    {(item.formattedDate || item.programDate) && (
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#E85D04]">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{item.formattedDate || item.programDate}</span>
                      </div>
                    )}

                    <h3 className="font-serif text-lg font-normal text-[#303030] 2xl:text-xl">
                      {item.title ||
                        item.formattedDate ||
                        `${currentSubnav.label} Capture Set`}
                    </h3>

                    {item.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-[#707884]">
                        {item.description}
                      </p>
                    )}
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
                      title="Edit gallery post"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item._id)}
                      className="rounded-lg border border-[#E6E2D8] p-1.5 text-[#707884] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      title="Delete gallery post"
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

      {/* Add / Edit Gallery Modal */}
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
                  {editingItem
                    ? `Edit ${modalSubnav.label} Entry`
                    : `New ${modalSubnav.label} Entry`}
                </h3>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#707884]">
                  ImageKit Folder: /gallery/{formData.category}
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
              {/* Subnav Selector & Sequence Order */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Gallery Subnav Page *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#F7F5F0]/50 px-3.5 py-2.5 text-xs text-[#303030] outline-none focus:border-[#E85D04] focus:bg-[#FFFFFF] sm:text-sm"
                  >
                    {GALLERY_SUBNAVS.map((sub) => (
                      <option key={sub.key} value={sub.key}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
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

              {/* Program Date & Year (Shown for Date-based Subnavs) */}
              {modalSubnav.hasDate && (
                <div className="rounded-2xl border border-[#E6E2D8] bg-[#F7F5F0]/40 p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                        Date of the Program *
                      </label>
                      <input
                        type="date"
                        value={
                          /^\d{4}-\d{2}-\d{2}$/.test(formData.programDate)
                            ? formData.programDate
                            : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const info = formatPreviewDate(val);
                          setFormData({
                            ...formData,
                            programDate: val,
                            year: info.year,
                          });
                        }}
                        required={modalSubnav.hasDate && !formData.programDate}
                        disabled={isSubmitting}
                        className="mt-1.5 w-full rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-3.5 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04] sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                        Display Date / Year Preview
                      </label>
                      <div className="mt-1.5 flex items-center justify-between rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-3.5 py-2 text-xs">
                        <span className="font-medium text-[#303030]">
                          {datePreviewInfo.formattedDate || 'Select a date'}
                        </span>
                        {datePreviewInfo.year && (
                          <span className="rounded bg-[#E85D04]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#E85D04]">
                            Year: {datePreviewInfo.year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Title & Description for Program Post */}
                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                        Program / Batch Heading (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g. Batch of 2026-29 / Krida 2026"
                        disabled={isSubmitting}
                        className="mt-1 w-full rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                        Short Post Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Optional description shown above photos"
                        disabled={isSubmitting}
                        className="mt-1 w-full rounded-xl border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Image Upload Dropzone */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                    Gallery Photos (ImageKit CDN) *
                  </label>
                  <span className="text-[11px] text-[#707884]">
                    {existingImages.length + pendingFiles.length} photo(s)
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
                    Select one or multiple photos to upload
                  </span>
                  <span className="text-[11px] text-[#707884]">
                    Stored in ImageKit under <code>/gallery/{formData.category}</code>
                  </span>
                </button>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#707884]">
                      Uploaded Photos ({existingImages.length})
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
                            className="h-14 w-16 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <input
                              type="text"
                              value={img.alt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExistingImages((prev) =>
                                  prev.map((entry, i) =>
                                    i === idx ? { ...entry, alt: val } : entry
                                  )
                                );
                              }}
                              placeholder="Caption / Alt text"
                              className="w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-2 py-1 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                            />
                            <select
                              value={img.aspect || 'horizontal'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExistingImages((prev) =>
                                  prev.map((entry, i) =>
                                    i === idx ? { ...entry, aspect: val } : entry
                                  )
                                );
                              }}
                              className="w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-2 py-1 text-[11px] text-[#707884] outline-none"
                            >
                              <option value="horizontal">Horizontal</option>
                              <option value="vertical">Vertical</option>
                              <option value="square">Square</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            disabled={isSubmitting}
                            className="rounded-lg p-1.5 text-[#707884] hover:bg-rose-50 hover:text-rose-600"
                            title="Remove photo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Uploads */}
                {pendingFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#E85D04]">
                      Queued for Upload ({pendingFiles.length})
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
                            className="h-14 w-16 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
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
                              placeholder="Caption / Alt text"
                              className="w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-2 py-1 text-xs text-[#303030] outline-none focus:border-[#E85D04]"
                            />
                            <select
                              value={item.aspect || 'horizontal'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPendingFiles((prev) =>
                                  prev.map((entry, i) =>
                                    i === idx ? { ...entry, aspect: val } : entry
                                  )
                                );
                              }}
                              className="w-full rounded-lg border border-[#E6E2D8] bg-[#FFFFFF] px-2 py-1 text-[11px] text-[#707884] outline-none"
                            >
                              <option value="horizontal">Horizontal</option>
                              <option value="vertical">Vertical</option>
                              <option value="square">Square</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(idx)}
                            disabled={isSubmitting}
                            className="rounded-lg p-1.5 text-[#707884] hover:bg-rose-50 hover:text-rose-600"
                            title="Remove queued photo"
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
                  id="galleryActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-[#E6E2D8] text-[#E85D04] focus:ring-[#E85D04]"
                />
                <label
                  htmlFor="galleryActiveToggle"
                  className="text-xs font-medium text-[#303030]"
                >
                  Publish live to {modalSubnav.label} page
                </label>
              </div>

              {/* Footer Buttons */}
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
                        {editingItem ? 'Save Changes' : 'Publish to Gallery'}
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