import Gallery, { GALLERY_CATEGORIES } from '../models/gallery.model.js';
import AuditLog from '../models/auditlog.model.js';
import catchAsync from '../utils/catchAsync.js';
import { getAuthParameters, deleteImageKitFile } from '../utils/imagekit.util.js';

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

/**
 * Parses a program date string (e.g., "2026-08-18" or "August 18, 2026")
 * into { rawDate, formattedDate, year } without timezone drift.
 */
const parseDateAndYear = (programDateInput, yearInput) => {
  const raw = String(programDateInput || '').trim();
  const explicitYear = String(yearInput || '').trim();

  if (!raw) {
    return {
      programDate: '',
      formattedDate: '',
      year: explicitYear,
    };
  }

  // Handle YYYY-MM-DD from <input type="date" />
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const monthName = MONTHS[parseInt(m, 10) - 1] || '';
    const dayNum = String(parseInt(d, 10)).padStart(2, '0');
    return {
      programDate: raw,
      formattedDate: `${monthName} ${dayNum}, ${y}`,
      year: explicitYear || y,
    };
  }

  // Try native Date parsing or regex year extraction for human-readable dates like "August 18, 2026"
  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  const extractedYear = explicitYear || (yearMatch ? yearMatch[0] : '');

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime()) && !raw.includes(',')) {
    const y = String(parsed.getFullYear());
    const monthName = MONTHS[parsed.getMonth()];
    const dayNum = String(parsed.getDate()).padStart(2, '0');
    return {
      programDate: raw,
      formattedDate: `${monthName} ${dayNum}, ${y}`,
      year: extractedYear || y,
    };
  }

  return {
    programDate: raw,
    formattedDate: raw,
    year: extractedYear,
  };
};

const ASPECTS = ['vertical', 'horizontal', 'square'];

// =========================================
// 1. IMAGEKIT DIRECT UPLOAD AUTHENTICATION
// =========================================
export const getGalleryUploadAuth = catchAsync(async (req, res) => {
  const authParams = getAuthParameters();
  res.status(200).json({
    status: 'success',
    ...authParams,
  });
});

// =========================================
// 2. PUBLIC: GET GALLERY ITEMS BY CATEGORY
// =========================================
export const getPublicGallery = catchAsync(async (req, res) => {
  const category = req.params.category || req.query.category;
  const filter = { isActive: true };

  if (category) {
    filter.category = String(category).trim().toLowerCase();
  }

  const items = await Gallery.find(filter)
    .sort({ order: 1, programDate: -1, createdAt: -1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    status: 'success',
    results: items.length,
    items,
  });
});

// =========================================
// 3. ADMIN: GET ALL GALLERY ITEMS
// =========================================
export const getAllGalleryAdmin = catchAsync(async (req, res) => {
  const { category } = req.query;
  const filter = {};

  if (category && category !== 'ALL') {
    filter.category = String(category).trim().toLowerCase();
  }

  const items = await Gallery.find(filter)
    .sort({ order: 1, programDate: -1, createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: items.length,
    items,
  });
});

// =========================================
// 4. ADMIN: CREATE GALLERY ENTRY / POST
// =========================================
export const createGalleryItem = catchAsync(async (req, res) => {
  const {
    category,
    programDate,
    year,
    title,
    description,
    images,
    order,
    isActive,
  } = req.body;

  const normalizedCategory = String(category || '').trim().toLowerCase();
  if (!GALLERY_CATEGORIES.includes(normalizedCategory)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid gallery category. Allowed categories: ${GALLERY_CATEGORIES.join(', ')}`,
    });
  }

  const normalizedImages = Array.isArray(images)
    ? images
        .filter((img) => img && (img.url || img.src))
        .map((img, idx) => ({
          url: String(img.url || img.src).trim(),
          fileId: img.fileId ? String(img.fileId).trim() : null,
          alt: img.alt
            ? String(img.alt).trim()
            : title
            ? String(title).trim()
            : 'SIHM Gallery Capture',
          aspect: ASPECTS.includes(img.aspect)
            ? img.aspect
            : ASPECTS[idx % ASPECTS.length],
        }))
    : [];

  if (normalizedImages.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please upload at least one image.',
    });
  }

  const dateInfo = parseDateAndYear(programDate, year);

  const highestOrderDoc = await Gallery.findOne({ category: normalizedCategory })
    .sort({ order: -1 })
    .select('order');
  const nextOrder =
    order !== undefined ? Number(order) : (highestOrderDoc?.order || 0) + 1;

  const newItem = await Gallery.create({
    category: normalizedCategory,
    programDate: dateInfo.programDate,
    formattedDate: dateInfo.formattedDate,
    year: dateInfo.year,
    title: title ? String(title).trim() : '',
    description: description ? String(description).trim() : '',
    images: normalizedImages,
    order: nextOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'GALLERY_CREATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      galleryId: newItem._id,
      category: newItem.category,
      programDate: newItem.formattedDate || newItem.programDate,
      year: newItem.year,
      imageCount: newItem.images.length,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Gallery entry published successfully.',
    item: newItem,
  });
});

// =========================================
// 5. ADMIN: UPDATE GALLERY ENTRY / POST
// =========================================
export const updateGalleryItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    category,
    programDate,
    year,
    title,
    description,
    images,
    order,
    isActive,
  } = req.body;

  const item = await Gallery.findById(id);

  if (!item) {
    return res.status(404).json({
      status: 'fail',
      message: 'Gallery entry not found.',
    });
  }

  if (category !== undefined) {
    const normalizedCategory = String(category).trim().toLowerCase();
    if (!GALLERY_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid gallery category.',
      });
    }
    item.category = normalizedCategory;
  }

  if (programDate !== undefined || year !== undefined) {
    const dateInfo = parseDateAndYear(
      programDate !== undefined ? programDate : item.programDate,
      year !== undefined ? year : item.year
    );
    item.programDate = dateInfo.programDate;
    item.formattedDate = dateInfo.formattedDate;
    item.year = dateInfo.year;
  }

  if (title !== undefined) item.title = String(title).trim();
  if (description !== undefined) item.description = String(description).trim();
  if (order !== undefined) item.order = Number(order);
  if (isActive !== undefined) item.isActive = Boolean(isActive);

  if (Array.isArray(images)) {
    const normalizedImages = images
      .filter((img) => img && (img.url || img.src))
      .map((img, idx) => ({
        url: String(img.url || img.src).trim(),
        fileId: img.fileId ? String(img.fileId).trim() : null,
        alt: img.alt
          ? String(img.alt).trim()
          : item.title || 'SIHM Gallery Capture',
        aspect: ASPECTS.includes(img.aspect)
          ? img.aspect
          : ASPECTS[idx % ASPECTS.length],
      }));

    if (normalizedImages.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'A gallery entry must retain at least one image.',
      });
    }

    const retainedFileIds = new Set(
      normalizedImages.map((img) => img.fileId).filter(Boolean)
    );
    for (const oldImg of item.images) {
      if (oldImg.fileId && !retainedFileIds.has(oldImg.fileId)) {
        await deleteImageKitFile(oldImg.fileId);
      }
    }

    item.images = normalizedImages;
  }

  await item.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'GALLERY_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      galleryId: item._id,
      category: item.category,
      programDate: item.formattedDate || item.programDate,
      imageCount: item.images.length,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Gallery entry updated successfully.',
    item,
  });
});

// =========================================
// 6. ADMIN: DELETE GALLERY ENTRY / POST
// =========================================
export const deleteGalleryItem = catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Gallery.findByIdAndDelete(id);

  if (!item) {
    return res.status(404).json({
      status: 'fail',
      message: 'Gallery entry not found.',
    });
  }

  if (Array.isArray(item.images)) {
    for (const img of item.images) {
      if (img.fileId) {
        await deleteImageKitFile(img.fileId);
      }
    }
  }

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'GALLERY_DELETED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      galleryId: item._id,
      category: item.category,
      purgedImagesCount: item.images?.length || 0,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Gallery entry and associated ImageKit media assets were deleted.',
  });
});
