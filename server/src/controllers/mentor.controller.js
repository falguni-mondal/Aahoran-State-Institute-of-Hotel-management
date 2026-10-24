import Mentor from '../models/mentor.model.js';
import AuditLog from '../models/auditlog.model.js';
import catchAsync from '../utils/catchAsync.js';
import { getAuthParameters, deleteImageKitFile } from '../utils/imagekit.util.js';

// =========================================
// 1. IMAGEKIT DIRECT UPLOAD AUTHENTICATION
// =========================================
export const getMentorUploadAuth = catchAsync(async (req, res, next) => {
  const authParams = getAuthParameters();
  res.status(200).json({
    status: 'success',
    ...authParams,
  });
});

// =========================================
// 2. PUBLIC: GET ACTIVE MENTORS (Client Website)
// =========================================
export const getPublicMentors = catchAsync(async (req, res, next) => {
  const mentors = await Mentor.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    status: 'success',
    results: mentors.length,
    mentors,
  });
});

// =========================================
// 2B. PUBLIC: GET PRINCIPAL MENTOR (Homepage)
// Fetches mentor with designation "principal" regardless of isActive status
// =========================================
export const getPrincipalMentor = catchAsync(async (req, res, next) => {
  // Prefer exact case-insensitive "principal" match first, regardless of isActive
  let principal = await Mentor.findOne({
    role: { $regex: /^\s*principal\s*$/i },
  })
    .sort({ updatedAt: -1, order: 1, createdAt: -1 })
    .select('-__v')
    .lean();

  // Fallback to any designation containing "principal" (e.g. "Principal, SIHM Durgapur")
  if (!principal) {
    principal = await Mentor.findOne({
      role: { $regex: /principal/i },
    })
      .sort({ updatedAt: -1, order: 1, createdAt: -1 })
      .select('-__v')
      .lean();
  }

  res.status(200).json({
    status: 'success',
    principal: principal || null,
  });
});

// =========================================
// 3. ADMIN: GET ALL MENTORS (Admin CMS)
// =========================================
export const getAllMentorsAdmin = catchAsync(async (req, res, next) => {
  const mentors = await Mentor.find()
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: mentors.length,
    mentors,
  });
});

// =========================================
// 4. ADMIN: CREATE MENTOR RECORD
// =========================================
export const createMentor = catchAsync(async (req, res, next) => {
  const { name, role, image, imageFileId, achievements, order, isActive } = req.body;

  if (!name || !role) {
    return res.status(400).json({
      status: 'fail',
      message: 'Mentor name and official designation are required.',
    });
  }

  // Parse achievements into a clean string array
  let parsedAchievements = [];
  if (Array.isArray(achievements)) {
    parsedAchievements = achievements.filter((item) => String(item).trim().length > 0);
  } else if (typeof achievements === 'string') {
    parsedAchievements = achievements
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const highestOrderDoc = await Mentor.findOne().sort({ order: -1 }).select('order');
  const nextOrder = order !== undefined ? Number(order) : (highestOrderDoc?.order || 0) + 1;

  const newMentor = await Mentor.create({
    name: name.trim(),
    role: role.trim(),
    image: image?.trim() || '/nchmct-bg.webp',
    imageFileId: imageFileId?.trim() || null,
    achievements: parsedAchievements,
    order: nextOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'MENTOR_CREATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      mentorId: newMentor._id,
      name: newMentor.name,
      role: newMentor.role,
      imageFileId: newMentor.imageFileId,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Mentor profile registered successfully.',
    mentor: newMentor,
  });
});

// =========================================
// 5. ADMIN: UPDATE MENTOR RECORD
// =========================================
export const updateMentor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, role, image, imageFileId, achievements, order, isActive } = req.body;

  const mentor = await Mentor.findById(id);

  if (!mentor) {
    return res.status(404).json({
      status: 'fail',
      message: 'Mentor profile not found.',
    });
  }

  // If a new image was uploaded to ImageKit, purge the previous file
  if (imageFileId && mentor.imageFileId && mentor.imageFileId !== imageFileId) {
    await deleteImageKitFile(mentor.imageFileId);
    mentor.imageFileId = imageFileId.trim();
  } else if (imageFileId !== undefined) {
    mentor.imageFileId = imageFileId ? imageFileId.trim() : null;
  }

  if (name !== undefined) mentor.name = name.trim();
  if (role !== undefined) mentor.role = role.trim();
  if (image !== undefined) mentor.image = image.trim();
  if (order !== undefined) mentor.order = Number(order);
  if (isActive !== undefined) mentor.isActive = Boolean(isActive);

  if (achievements !== undefined) {
    if (Array.isArray(achievements)) {
      mentor.achievements = achievements.filter((item) => String(item).trim().length > 0);
    } else if (typeof achievements === 'string') {
      mentor.achievements = achievements
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  await mentor.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'MENTOR_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      mentorId: mentor._id,
      updatedName: mentor.name,
      newImageFileId: mentor.imageFileId,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Mentor profile updated successfully.',
    mentor,
  });
});

// =========================================
// 6. ADMIN: DELETE MENTOR RECORD
// =========================================
export const deleteMentor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const mentor = await Mentor.findByIdAndDelete(id);

  if (!mentor) {
    return res.status(404).json({
      status: 'fail',
      message: 'Mentor profile not found.',
    });
  }

  // Purge the associated asset from ImageKit
  if (mentor.imageFileId) {
    await deleteImageKitFile(mentor.imageFileId);
  }

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'MENTOR_DELETED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      mentorId: mentor._id,
      deletedName: mentor.name,
      role: mentor.role,
      purgedImageFileId: mentor.imageFileId,
    },
  });

  res.status(200).json({
    status: 'success',
    message: `Mentor record for ${mentor.name} and associated media assets were removed.`,
  });
});
