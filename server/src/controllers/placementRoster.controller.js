import PlacementRoster from '../models/placementRoster.model.js';
import AuditLog from '../models/auditlog.model.js';
import catchAsync from '../utils/catchAsync.js';
import { getAuthParameters, deleteImageKitFile } from '../utils/imagekit.util.js';

// =========================================
// 1. IMAGEKIT DIRECT UPLOAD AUTHENTICATION
// =========================================
export const getPlacementUploadAuth = catchAsync(async (req, res) => {
  const authParams = getAuthParameters();
  res.status(200).json({
    status: 'success',
    ...authParams,
  });
});

// =========================================
// 2. PUBLIC: GET ACTIVE EXECUTIVE ROSTER
// =========================================
export const getPublicPlacements = catchAsync(async (req, res) => {
  const placements = await PlacementRoster.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    status: 'success',
    results: placements.length,
    placements,
  });
});

// =========================================
// 3. ADMIN: GET ALL EXECUTIVE ROSTER ITEMS
// =========================================
export const getAllPlacementsAdmin = catchAsync(async (req, res) => {
  const placements = await PlacementRoster.find()
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: placements.length,
    placements,
  });
});

// =========================================
// 4. ADMIN: CREATE EXECUTIVE ROSTER ITEM
// =========================================
export const createPlacement = catchAsync(async (req, res) => {
  const { name, batch, role, company, image, imageFileId, order, isActive } =
    req.body;

  if (!name || !batch || !role || !company) {
    return res.status(400).json({
      status: 'fail',
      message: 'Candidate name, batch, appointed role, and company are required.',
    });
  }

  const highestOrderDoc = await PlacementRoster.findOne()
    .sort({ order: -1 })
    .select('order');
  const nextOrder =
    order !== undefined ? Number(order) : (highestOrderDoc?.order || 0) + 1;

  const newPlacement = await PlacementRoster.create({
    name: String(name).trim(),
    batch: String(batch).trim(),
    role: String(role).trim(),
    company: String(company).trim(),
    image: image?.trim() || '/nchmct-bg.webp',
    imageFileId: imageFileId?.trim() || null,
    order: nextOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'PLACEMENT_CREATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      placementId: newPlacement._id,
      name: newPlacement.name,
      company: newPlacement.company,
      role: newPlacement.role,
      imageFileId: newPlacement.imageFileId,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Executive Roster item created successfully.',
    placement: newPlacement,
  });
});

// =========================================
// 5. ADMIN: UPDATE EXECUTIVE ROSTER ITEM
// =========================================
export const updatePlacement = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, batch, role, company, image, imageFileId, order, isActive } =
    req.body;

  const placement = await PlacementRoster.findById(id);

  if (!placement) {
    return res.status(404).json({
      status: 'fail',
      message: 'Executive Roster item not found.',
    });
  }

  if (imageFileId && placement.imageFileId && placement.imageFileId !== imageFileId) {
    await deleteImageKitFile(placement.imageFileId);
    placement.imageFileId = imageFileId.trim();
  } else if (imageFileId !== undefined) {
    placement.imageFileId = imageFileId ? imageFileId.trim() : null;
  }

  if (name !== undefined) placement.name = String(name).trim();
  if (batch !== undefined) placement.batch = String(batch).trim();
  if (role !== undefined) placement.role = String(role).trim();
  if (company !== undefined) placement.company = String(company).trim();
  if (image !== undefined) placement.image = String(image).trim();
  if (order !== undefined) placement.order = Number(order);
  if (isActive !== undefined) placement.isActive = Boolean(isActive);

  await placement.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'PLACEMENT_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      placementId: placement._id,
      updatedName: placement.name,
      company: placement.company,
      newImageFileId: placement.imageFileId,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Executive Roster item updated successfully.',
    placement,
  });
});

// =========================================
// 6. ADMIN: DELETE EXECUTIVE ROSTER ITEM
// =========================================
export const deletePlacement = catchAsync(async (req, res) => {
  const { id } = req.params;

  const placement = await PlacementRoster.findByIdAndDelete(id);

  if (!placement) {
    return res.status(404).json({
      status: 'fail',
      message: 'Executive Roster item not found.',
    });
  }

  if (placement.imageFileId) {
    await deleteImageKitFile(placement.imageFileId);
  }

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'PLACEMENT_DELETED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      placementId: placement._id,
      deletedName: placement.name,
      company: placement.company,
      purgedImageFileId: placement.imageFileId,
    },
  });

  res.status(200).json({
    status: 'success',
    message: `Executive Roster entry for "${placement.name}" and its media asset were removed.`,
  });
});