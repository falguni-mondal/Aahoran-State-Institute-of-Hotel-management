import CampusFacility from '../models/campusFacility.model.js';
import AuditLog from '../models/auditlog.model.js';
import catchAsync from '../utils/catchAsync.js';
import { getAuthParameters, deleteImageKitFile } from '../utils/imagekit.util.js';

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `facility-${Date.now()}`;

// =========================================
// 1. IMAGEKIT DIRECT UPLOAD AUTHENTICATION
// =========================================
export const getFacilityUploadAuth = catchAsync(async (req, res) => {
  const authParams = getAuthParameters();
  res.status(200).json({
    status: 'success',
    ...authParams,
  });
});

// =========================================
// 2. PUBLIC: GET ACTIVE FACILITIES
// =========================================
export const getPublicFacilities = catchAsync(async (req, res) => {
  const facilities = await CampusFacility.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    status: 'success',
    results: facilities.length,
    facilities,
  });
});

// =========================================
// 3. ADMIN: GET ALL FACILITIES
// =========================================
export const getAllFacilitiesAdmin = catchAsync(async (req, res) => {
  const facilities = await CampusFacility.find()
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: facilities.length,
    facilities,
  });
});

// =========================================
// 4. ADMIN: CREATE FACILITY
// =========================================
export const createFacility = catchAsync(async (req, res) => {
  const { title, slug, images, order, isActive } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Facility title is required.',
    });
  }

  const normalizedImages = Array.isArray(images)
    ? images
        .filter((img) => img && (img.url || img.src))
        .map((img) => ({
          url: String(img.url || img.src).trim(),
          fileId: img.fileId ? String(img.fileId).trim() : null,
          alt: img.alt ? String(img.alt).trim() : String(title).trim(),
        }))
    : [];

  if (normalizedImages.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please upload at least one image for the facility.',
    });
  }

  const highestOrderDoc = await CampusFacility.findOne()
    .sort({ order: -1 })
    .select('order');
  const nextOrder =
    order !== undefined ? Number(order) : (highestOrderDoc?.order || 0) + 1;

  const newFacility = await CampusFacility.create({
    title: String(title).trim(),
    slug: slug ? slugify(slug) : slugify(title),
    images: normalizedImages,
    order: nextOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'FACILITY_CREATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      facilityId: newFacility._id,
      title: newFacility.title,
      slug: newFacility.slug,
      imageCount: newFacility.images.length,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Campus facility created successfully.',
    facility: newFacility,
  });
});

// =========================================
// 5. ADMIN: UPDATE FACILITY
// =========================================
export const updateFacility = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, slug, images, order, isActive } = req.body;

  const facility = await CampusFacility.findById(id);

  if (!facility) {
    return res.status(404).json({
      status: 'fail',
      message: 'Campus facility not found.',
    });
  }

  if (title !== undefined) {
    facility.title = String(title).trim();
    if (!slug) {
      facility.slug = slugify(title);
    }
  }
  if (slug !== undefined && String(slug).trim()) {
    facility.slug = slugify(slug);
  }
  if (order !== undefined) facility.order = Number(order);
  if (isActive !== undefined) facility.isActive = Boolean(isActive);

  if (Array.isArray(images)) {
    const normalizedImages = images
      .filter((img) => img && (img.url || img.src))
      .map((img) => ({
        url: String(img.url || img.src).trim(),
        fileId: img.fileId ? String(img.fileId).trim() : null,
        alt: img.alt ? String(img.alt).trim() : facility.title,
      }));

    if (normalizedImages.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'A facility must have at least one image.',
      });
    }

    // Purge any removed ImageKit assets
    const retainedFileIds = new Set(
      normalizedImages.map((img) => img.fileId).filter(Boolean)
    );
    for (const oldImg of facility.images) {
      if (oldImg.fileId && !retainedFileIds.has(oldImg.fileId)) {
        await deleteImageKitFile(oldImg.fileId);
      }
    }

    facility.images = normalizedImages;
  }

  await facility.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'FACILITY_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      facilityId: facility._id,
      title: facility.title,
      imageCount: facility.images.length,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Campus facility updated successfully.',
    facility,
  });
});

// =========================================
// 6. ADMIN: DELETE FACILITY
// =========================================
export const deleteFacility = catchAsync(async (req, res) => {
  const { id } = req.params;

  const facility = await CampusFacility.findByIdAndDelete(id);

  if (!facility) {
    return res.status(404).json({
      status: 'fail',
      message: 'Campus facility not found.',
    });
  }

  // Purge all associated ImageKit files
  if (Array.isArray(facility.images)) {
    for (const img of facility.images) {
      if (img.fileId) {
        await deleteImageKitFile(img.fileId);
      }
    }
  }

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'FACILITY_DELETED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      facilityId: facility._id,
      deletedTitle: facility.title,
      purgedImagesCount: facility.images?.length || 0,
    },
  });

  res.status(200).json({
    status: 'success',
    message: `Campus facility "${facility.title}" and its media assets were deleted.`,
  });
});