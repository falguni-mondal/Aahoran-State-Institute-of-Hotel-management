import crypto from 'crypto';
import {
  Alumni,
  AlumniTestimonial,
  AlumniUpdate,
  AlumniActivity,
  AlumniPageConfig,
} from '../models/alumni.model.js';
import Notice from '../models/notice.model.js';
import Result from '../models/result.model.js';
import StudyMaterial from '../models/studyMaterial.model.js';
import Syllabus from '../models/syllabus.model.js';
import AuditLog from '../models/auditlog.model.js';
import catchAsync from '../utils/catchAsync.js';
import { getAuthParameters, deleteImageKitFile } from '../utils/imagekit.util.js';
import { verifyEmailDeliverability } from '../utils/emailVerifier.js';
import { sendAlumniWelcomeEmail } from '../utils/resend.util.js';
import {
  signAlumniSessionToken,
  setAlumniSessionCookie,
  clearAlumniSessionCookie,
} from '../middlewares/alumniAuth.middleware.js';
import {
  alumniRegistrationSchema,
  alumniLoginSchema,
  testimonialSubmissionSchema,
  replySubmissionSchema,
  reunionRsvpSchema,
  alumniUpdateItemSchema,
  formatZodError,
} from '../utils/alumniValidation.js';

// =========================================
// HELPER: UNIQUE REGISTRATION ID GENERATOR
// =========================================
const generateUniqueRegistrationId = async ({
  fullName = '',
  yearOfPassing = 2024,
  courseCompleted = 'BSC',
  contactNumber = '',
}) => {
  const cleanName = Array.from(String(fullName))
    .filter((ch) => (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === ' ')
    .join('')
    .trim();
  const words = cleanName.split(' ').filter(Boolean);
  let initials = 'AL';
  if (words.length >= 2) {
    initials = `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].slice(0, 2).toUpperCase();
  }

  let courseCode = 'GEN';
  const upperCourse = String(courseCompleted).toUpperCase();
  if (upperCourse.includes('B.SC') || upperCourse.includes('BSC') || upperCourse.includes('HHA')) {
    courseCode = 'BSC';
  } else if (upperCourse.includes('FOOD PROD') || upperCourse.includes('CULINARY')) {
    courseCode = 'CFP';
  } else if (upperCourse.includes('BAKERY') || upperCourse.includes('PATISSERIE')) {
    courseCode = 'BKP';
  } else if (upperCourse.includes('BEVERAGE') || upperCourse.includes('F&B')) {
    courseCode = 'FBS';
  } else if (upperCourse.includes('FRONT OFFICE')) {
    courseCode = 'FOO';
  } else if (upperCourse.includes('HOUSEKEEPING')) {
    courseCode = 'HKO';
  } else if (upperCourse.includes('HUNAR')) {
    courseCode = 'HSR';
  } else {
    courseCode = 'SIH';
  }

  const digits = Array.from(String(contactNumber))
    .filter((ch) => ch >= '0' && ch <= '9')
    .join('');
  const phoneTail = digits.slice(-2) || '00';

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 2);
    const candidateId = `SIHM-${yearOfPassing}-${courseCode}-${initials}${phoneTail}${randomHex}`;
    const existing = await Alumni.findOne({ registrationId: candidateId })
      .select('_id')
      .lean();
    if (!existing) {
      return candidateId;
    }
  }

  return `SIHM-${yearOfPassing}-${Date.now().toString().slice(-6)}`;
};

// =========================================
// HELPER: SANITIZE PUBLIC ALUMNI PROFILE (PRIVACY ENFORCEMENT)
// =========================================
const sanitizePublicAlumni = (doc) => ({
  _id: doc._id,
  registrationId: doc.registrationId,
  fullName: doc.fullName,
  photograph: doc.photograph || '/alumni-bg.webp',
  yearOfAdmission: doc.yearOfAdmission,
  yearOfPassing: doc.yearOfPassing,
  batchLabel: `${doc.yearOfAdmission} - ${doc.yearOfPassing}`,
  courseCompleted: doc.courseCompleted,
  industrySector: doc.industrySector || 'Hotel Operations',
  currentDesignation: doc.currentDesignation,
  organisation: doc.organisation,
  currentLocation: doc.currentLocation,
  linkedInProfile: doc.linkedInProfile || '',
  achievements: doc.achievements || '',
  email: doc.showEmailPublicly ? doc.email : null,
  contactNumber: doc.showPhonePublicly ? doc.contactNumber : null,
  isDistinguished: Boolean(doc.isDistinguished),
  distinguishedCitation: doc.distinguishedCitation || '',
  isSuccessStory: Boolean(doc.isSuccessStory),
  successStoryTitle: doc.successStoryTitle || '',
  successStoryContent: doc.successStoryContent || '',
  order: doc.order || 0,
  createdAt: doc.createdAt,
});

// =========================================
// HELPER: FORMAT LOGGED-IN ALUMNUS ACCOUNT PAYLOAD
// =========================================
const formatAuthenticatedAlumnus = (doc) => ({
  _id: doc._id,
  registrationId: doc.registrationId,
  fullName: doc.fullName,
  email: doc.email,
  role: doc.role || 'Alumni',
  photograph: doc.photograph || '/alumni-bg.webp',
  yearOfAdmission: doc.yearOfAdmission,
  yearOfPassing: doc.yearOfPassing,
  batchYear: `${doc.yearOfAdmission}-${doc.yearOfPassing}`,
  batchLabel: `${doc.yearOfAdmission} - ${doc.yearOfPassing}`,
  courseCompleted: doc.courseCompleted,
  industrySector: doc.industrySector || 'Hotel Operations',
  currentDesignation: doc.currentDesignation,
  organisation: doc.organisation,
  currentLocation: doc.currentLocation,
  contactNumber: doc.contactNumber,
  linkedInProfile: doc.linkedInProfile || '',
  achievements: doc.achievements || '',
  status: doc.status,
  publicConsent: doc.publicConsent,
});

// =========================================
// HELPER: ENSURE SINGLETON CMS CONFIG
// =========================================
const getOrCreateCmsConfig = async () => {
  let config = await AlumniPageConfig.findOne().lean();
  if (!config) {
    const created = await AlumniPageConfig.create({});
    config = created.toObject();
  }
  return config;
};

// =========================================
// 0. PUBLIC: GET DYNAMIC NAVBAR "NEW" BADGE FLAGS
// =========================================
export const getPublicNavBadges = catchAsync(async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    newNoticesCount,
    newResultsCount,
    newStudyMaterialsCount,
    newSyllabiCount,
    newAlumniUpdatesCount,
    recentApprovedAlumniCount,
  ] = await Promise.all([
    Notice.countDocuments({ isActive: true, isNewUpdate: true }),
    Result.countDocuments({ isActive: true, isNewUpdate: true }),
    StudyMaterial.countDocuments({ isActive: true, isNewUpdate: true }),
    Syllabus.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo },
    }),
    AlumniUpdate.countDocuments({
      isActive: true,
      $or: [{ isPinned: true }, { createdAt: { $gte: thirtyDaysAgo } }],
    }),
    Alumni.countDocuments({
      status: 'Approved',
      updatedAt: { $gte: thirtyDaysAgo },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    badges: {
      noticeBoard: newNoticesCount > 0,
      notices: newNoticesCount > 0,
      results: newResultsCount > 0,
      studyMaterial: newStudyMaterialsCount > 0,
      studyMaterials: newStudyMaterialsCount > 0,
      syllabus: newSyllabiCount > 0,
      alumni: newAlumniUpdatesCount > 0 || recentApprovedAlumniCount > 0,
    },
  });
});

// =========================================
// 1. PUBLIC & ADMIN IMAGEKIT UPLOAD AUTH
// =========================================
export const getAlumniUploadAuth = catchAsync(async (_req, res) => {
  const authParams = getAuthParameters();
  res.status(200).json({
    status: 'success',
    ...authParams,
  });
});

// =========================================
// 2. PUBLIC: GET COMPLETE ALUMNI HUB DATA
// =========================================
export const getPublicAlumniHub = catchAsync(async (req, res) => {
  const [config, approvedAlumni, testimonials, updates] = await Promise.all([
    getOrCreateCmsConfig(),
    Alumni.find({ status: 'Approved', publicConsent: true })
      .sort({ isDistinguished: -1, order: 1, yearOfPassing: -1, createdAt: -1 })
      .lean(),
    AlumniTestimonial.find({ isApproved: true })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean(),
    AlumniUpdate.find({ isActive: true })
      .sort({ isPinned: -1, publishDate: -1, createdAt: -1 })
      .lean(),
  ]);

  const sanitizedDirectory = approvedAlumni.map(sanitizePublicAlumni);
  const distinguishedAlumni = sanitizedDirectory.filter((a) => a.isDistinguished);
  const successStories = sanitizedDirectory.filter((a) => a.isSuccessStory);

  const sanitizedUpdates = updates.map((u) => ({
    ...u,
    attendeeCount: Array.isArray(u.attendees) ? u.attendees.length : 0,
    attendeesPreview: Array.isArray(u.attendees)
      ? u.attendees.slice(-8).map((att) => ({
          fullName: att.fullName,
          batchYear: att.batchYear,
          registrationId: att.registrationId,
          status: att.status,
          markedAt: att.markedAt,
        }))
      : [],
    attendees: undefined,
  }));

  const sanitizedTestimonials = testimonials.map((t) => ({
    ...t,
    replies: Array.isArray(t.replies)
      ? t.replies.filter((r) => r.isApproved === true)
      : [],
  }));

  res.status(200).json({
    status: 'success',
    config,
    directory: sanitizedDirectory,
    distinguishedAlumni,
    successStories,
    testimonials: sanitizedTestimonials,
    updates: sanitizedUpdates,
    currentUser: req.alumni ? formatAuthenticatedAlumnus(req.alumni) : null,
  });
});

// =========================================
// 3. PUBLIC: REGISTER NEW ALUMNUS + CREATE ACCOUNT + RESEND EMAIL
// =========================================
export const registerAlumnus = catchAsync(async (req, res) => {
  const parsed = alumniRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'fail',
      message: formatZodError(parsed.error),
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const validData = parsed.data;

  const emailVerification = await verifyEmailDeliverability(validData.email);
  if (!emailVerification.isValid) {
    return res.status(400).json({
      status: 'fail',
      message: emailVerification.reason,
      errors: { email: [emailVerification.reason] },
    });
  }

  const existingRecord = await Alumni.findOne({
    email: emailVerification.normalizedEmail,
  });

  if (existingRecord) {
    return res.status(409).json({
      status: 'fail',
      message: `An alumni account with email ${emailVerification.normalizedEmail} is already registered (ID: ${existingRecord.registrationId}). Please use the Sign In tab to log in.`,
      registrationId: existingRecord.registrationId,
    });
  }

  const registrationId = await generateUniqueRegistrationId({
    fullName: validData.fullName,
    yearOfPassing: validData.yearOfPassing,
    courseCompleted: validData.courseCompleted,
    contactNumber: validData.contactNumber,
  });

  const highestOrderDoc = await Alumni.findOne().sort({ order: -1 }).select('order');
  const nextOrder = (highestOrderDoc?.order || 0) + 1;

  const newAlumni = await Alumni.create({
    ...validData,
    email: emailVerification.normalizedEmail,
    registrationId,
    role: 'Alumni',
    isEmailVerified: true,
    photograph: validData.photograph || '/alumni-bg.webp',
    status: 'Pending',
    order: nextOrder,
  });

  const accessToken = signAlumniSessionToken(newAlumni);
  setAlumniSessionCookie(res, accessToken);

  const emailDispatchResult = await sendAlumniWelcomeEmail(newAlumni);

  await AlumniActivity.create({
    alumniId: newAlumni._id,
    registrationId: newAlumni.registrationId,
    alumniName: newAlumni.fullName,
    email: newAlumni.email,
    activityType: 'REGISTRATION_SUBMITTED',
    description: `Created Alumni Account (${newAlumni.courseCompleted}, Batch ${newAlumni.yearOfAdmission}-${newAlumni.yearOfPassing}) as ${newAlumni.currentDesignation} at ${newAlumni.organisation}. Welcome email sent: ${emailDispatchResult.sent ? 'Yes' : 'Skipped (No API Key)'}.`,
    metadata: {
      courseCompleted: newAlumni.courseCompleted,
      yearOfAdmission: newAlumni.yearOfAdmission,
      yearOfPassing: newAlumni.yearOfPassing,
      organisation: newAlumni.organisation,
      currentLocation: newAlumni.currentLocation,
      publicConsent: newAlumni.publicConsent,
      emailSent: emailDispatchResult.sent,
    },
    ipAddress: req.ip || '0.0.0.0',
  });

  res.status(201).json({
    status: 'success',
    message: emailDispatchResult.sent
      ? `Account created and signed in! Your official credentials have been emailed to ${newAlumni.email}. Your public directory profile is queued for admin approval.`
      : 'Account created and signed in! Your public directory profile is queued for administrative approval.',
    registrationId: newAlumni.registrationId,
    accessToken,
    emailSent: emailDispatchResult.sent,
    alumni: formatAuthenticatedAlumnus(newAlumni),
  });
});

// =========================================
// 3B. PUBLIC: ALUMNI LOGIN (BY REGISTRATION ID OR EMAIL + PASSWORD)
// =========================================
export const loginAlumnus = catchAsync(async (req, res) => {
  const parsed = alumniLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'fail',
      message: formatZodError(parsed.error),
    });
  }

  const rawIdentifier = parsed.data.identifier.trim();
  const isEmailInput = rawIdentifier.includes('@');

  const query = isEmailInput
    ? { email: rawIdentifier.toLowerCase() }
    : { registrationId: rawIdentifier.toUpperCase() };

  const alumnus = await Alumni.findOne(query).select('+password');

  if (!alumnus || !alumnus.password) {
    return res.status(401).json({
      status: 'fail',
      message:
        'Invalid Registration ID / Email or Password. Please verify your credentials.',
    });
  }

  const isPasswordValid = await alumnus.comparePassword(parsed.data.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'fail',
      message:
        'Invalid Registration ID / Email or Password. Please verify your credentials.',
    });
  }

  alumnus.lastLogin = new Date();
  await alumnus.save({ validateBeforeSave: false });

  const accessToken = signAlumniSessionToken(alumnus);
  setAlumniSessionCookie(res, accessToken);

  await AlumniActivity.create({
    alumniId: alumnus._id,
    registrationId: alumnus.registrationId,
    alumniName: alumnus.fullName,
    email: alumnus.email,
    activityType: 'ALUMNI_LOGIN',
    description: `Signed in to the SIHM Alumni Network portal.`,
    metadata: { loginMethod: isEmailInput ? 'email' : 'registrationId' },
    ipAddress: req.ip || '0.0.0.0',
  });

  res.status(200).json({
    status: 'success',
    message: `Welcome back, ${alumnus.fullName}!`,
    accessToken,
    alumni: formatAuthenticatedAlumnus(alumnus),
  });
});

// =========================================
// 3C. PUBLIC: GET CURRENT LOGGED-IN ALUMNUS SESSION
// =========================================
export const getMyAlumniSession = catchAsync(async (req, res) => {
  if (!req.alumni) {
    return res.status(200).json({
      status: 'success',
      authenticated: false,
      alumni: null,
    });
  }

  res.status(200).json({
    status: 'success',
    authenticated: true,
    alumni: formatAuthenticatedAlumnus(req.alumni),
  });
});

// =========================================
// 3D. PUBLIC: LOGOUT ALUMNUS SESSION
// =========================================
export const logoutAlumnus = catchAsync(async (_req, res) => {
  clearAlumniSessionCookie(res);
  res.status(200).json({
    status: 'success',
    message: 'Signed out of your SIHM Alumni account.',
  });
});

// =========================================
// 4. PUBLIC: LOOKUP ALUMNI BY REGISTRATION ID
// =========================================
export const verifyAlumniRegistrationId = catchAsync(async (req, res) => {
  const { registrationId } = req.params;
  if (!registrationId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a Registration ID.',
    });
  }

  const cleanId = String(registrationId).trim().toUpperCase();
  const alumni = await Alumni.findOne({ registrationId: cleanId }).lean();

  if (!alumni) {
    return res.status(404).json({
      status: 'fail',
      message: 'No registered alumnus found with that Registration ID.',
    });
  }

  res.status(200).json({
    status: 'success',
    alumni: {
      registrationId: alumni.registrationId,
      fullName: alumni.fullName,
      batchYear: `${alumni.yearOfAdmission}-${alumni.yearOfPassing}`,
      courseCompleted: alumni.courseCompleted,
      currentDesignation: alumni.currentDesignation,
      organisation: alumni.organisation,
      email: alumni.email,
      contactNumber: alumni.contactNumber,
      photograph: alumni.photograph,
      status: alumni.status,
    },
  });
});

// =========================================
// 5. PUBLIC: SUBMIT TESTIMONIAL (AUTO-FILLS FROM ACCOUNT IF LOGGED IN, QUEUED FOR ADMIN APPROVAL)
// =========================================
export const createPublicTestimonial = catchAsync(async (req, res) => {
  let payloadToValidate = { ...req.body };

  if (req.alumni) {
    payloadToValidate = {
      ...payloadToValidate,
      authorName: req.alumni.fullName,
      authorEmail: req.alumni.email,
      batchYear: `${req.alumni.yearOfAdmission}-${req.alumni.yearOfPassing}`,
      registrationId: req.alumni.registrationId,
      designation: req.alumni.currentDesignation,
      organisation: req.alumni.organisation,
      avatar: req.alumni.photograph || '/alumni-bg.webp',
    };
  }

  const parsed = testimonialSubmissionSchema.safeParse(payloadToValidate);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'fail',
      message: formatZodError(parsed.error),
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;

  if (!req.alumni) {
    const emailCheck = await verifyEmailDeliverability(data.authorEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({
        status: 'fail',
        message: emailCheck.reason,
      });
    }
  }

  const newTestimonial = await AlumniTestimonial.create({
    alumniId: req.alumni?._id || null,
    authorName: data.authorName,
    authorEmail: data.authorEmail,
    batchYear: data.batchYear,
    registrationId: req.alumni?.registrationId || data.registrationId || 'GUEST',
    designation: data.designation || 'SIHM Alumnus',
    organisation: data.organisation || '',
    avatar: data.avatar || '/alumni-bg.webp',
    heading: data.heading,
    content: data.content,
    isApproved: false,
  });

  await AlumniActivity.create({
    alumniId: req.alumni?._id || null,
    registrationId: req.alumni?.registrationId || data.registrationId || 'GUEST',
    alumniName: data.authorName,
    email: data.authorEmail,
    activityType: 'TESTIMONIAL_POSTED',
    description: `Submitted testimonial "${newTestimonial.heading}" (Pending Admin Approval).`,
    metadata: {
      testimonialId: newTestimonial._id,
      batchYear: newTestimonial.batchYear,
      heading: newTestimonial.heading,
      authenticatedAccount: Boolean(req.alumni),
    },
    ipAddress: req.ip || '0.0.0.0',
  });

  res.status(201).json({
    status: 'success',
    pendingApproval: true,
    message:
      'Thank you! Your testimonial has been submitted and will appear on the public Alumni Wall once approved by the SIHM Administration.',
    testimonial: newTestimonial,
  });
});

// =========================================
// 6. PUBLIC / ADMIN: ADD NESTED REPLY TO TESTIMONIAL / REPLY
// =========================================
export const addReplyToTestimonial = catchAsync(async (req, res) => {
  const { id } = req.params;
  let payloadToValidate = { ...req.body };

  const isOfficialAdminCall =
    Boolean(req.user) &&
    (req.user.role === 'Admin' || req.user.role === 'SuperAdmin');

  if (isOfficialAdminCall) {
    payloadToValidate = {
      ...payloadToValidate,
      authorName: payloadToValidate.authorName || 'SIHM Durgapur Alumni Cell',
      authorEmail: req.user.email || 'admin@sihmdurgapur.com',
      authorBatch: 'Official Administration',
      registrationId: 'SIHM-ADMIN',
      isOfficialAdmin: true,
    };
  } else if (req.alumni) {
    payloadToValidate = {
      ...payloadToValidate,
      authorName: req.alumni.fullName,
      authorEmail: req.alumni.email,
      authorBatch: `${req.alumni.yearOfAdmission}-${req.alumni.yearOfPassing}`,
      registrationId: req.alumni.registrationId,
      isOfficialAdmin: false,
    };
  }

  const parsed = replySubmissionSchema.safeParse(payloadToValidate);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'fail',
      message: formatZodError(parsed.error),
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const testimonial = await AlumniTestimonial.findById(id);
  if (!testimonial) {
    return res.status(404).json({
      status: 'fail',
      message: 'Testimonial thread not found.',
    });
  }

  const data = parsed.data;

  if (!req.alumni && !isOfficialAdminCall) {
    const emailCheck = await verifyEmailDeliverability(data.authorEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({
        status: 'fail',
        message: emailCheck.reason,
      });
    }
  }

  const newReply = {
    parentReplyId: data.parentReplyId || null,
    alumniId: req.alumni?._id || null,
    authorName: data.authorName,
    authorEmail: data.authorEmail,
    authorBatch: data.authorBatch,
    registrationId: data.registrationId || (req.alumni ? req.alumni.registrationId : 'GUEST'),
    authorAvatar: req.alumni?.photograph || '',
    authorRole: isOfficialAdminCall
      ? req.user.role
      : req.alumni
      ? 'Alumni'
      : 'Guest',
    isOfficialAdmin: isOfficialAdminCall,
    content: data.content,
    isApproved: isOfficialAdminCall,
    createdAt: new Date(),
  };

  testimonial.replies.push(newReply);
  await testimonial.save();

  const savedReply = testimonial.replies[testimonial.replies.length - 1];

  await AlumniActivity.create({
    alumniId: req.alumni?._id || null,
    registrationId: newReply.registrationId,
    alumniName: data.authorName,
    email: data.authorEmail,
    activityType: 'COMMENT_REPLIED',
    description: `${
      isOfficialAdminCall ? 'Official Admin replied' : 'Submitted a reply (Pending Admin Approval)'
    } on "${testimonial.heading}": "${data.content.slice(0, 80)}"`,
    metadata: {
      testimonialId: testimonial._id,
      replyId: savedReply._id,
      parentReplyId: data.parentReplyId || null,
      isApproved: newReply.isApproved,
    },
    ipAddress: req.ip || '0.0.0.0',
  });

  res.status(201).json({
    status: 'success',
    pendingApproval: !isOfficialAdminCall,
    message: isOfficialAdminCall
      ? 'Official administrative reply published.'
      : 'Your reply has been submitted and will be visible once approved by the SIHM Admin.',
    testimonial,
    reply: savedReply,
  });
});

// =========================================
// 7. PUBLIC: MARK "COMING" FOR UPCOMING REUNION (AUTO-USES ACCOUNT IF LOGGED IN)
// =========================================
export const submitReunionRsvp = catchAsync(async (req, res) => {
  const { id } = req.params;
  let payloadToValidate = { ...req.body };

  if (req.alumni) {
    payloadToValidate = {
      ...payloadToValidate,
      registrationId: req.alumni.registrationId,
      fullName: req.alumni.fullName,
      batchYear: `${req.alumni.yearOfAdmission}-${req.alumni.yearOfPassing}`,
      email: req.alumni.email,
      contactNumber: req.alumni.contactNumber,
    };
  }

  const parsed = reunionRsvpSchema.safeParse(payloadToValidate);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'fail',
      message: formatZodError(parsed.error),
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const reunion = await AlumniUpdate.findById(id);
  if (!reunion || reunion.category !== 'reunion') {
    return res.status(404).json({
      status: 'fail',
      message: 'Reunion event not found.',
    });
  }

  const data = parsed.data;

  if (!req.alumni) {
    const emailCheck = await verifyEmailDeliverability(data.email);
    if (!emailCheck.isValid) {
      return res.status(400).json({
        status: 'fail',
        message: emailCheck.reason,
      });
    }
  }

  const normalizedRegId = data.registrationId.toUpperCase();

  const registeredAlumnus =
    req.alumni ||
    (await Alumni.findOne({
      registrationId: normalizedRegId,
    }));

  const existingIdx = reunion.attendees.findIndex(
    (att) =>
      att.registrationId === normalizedRegId ||
      att.email.toLowerCase() === data.email.toLowerCase()
  );

  if (existingIdx > -1) {
    reunion.attendees[existingIdx].fullName = data.fullName;
    reunion.attendees[existingIdx].batchYear = data.batchYear;
    reunion.attendees[existingIdx].contactNumber = data.contactNumber || '';
    reunion.attendees[existingIdx].guestsCount = data.guestsCount || 0;
    reunion.attendees[existingIdx].dietaryPreference =
      data.dietaryPreference || 'Standard';
    reunion.attendees[existingIdx].note = data.note || '';
    reunion.attendees[existingIdx].status = 'Coming';
    reunion.attendees[existingIdx].markedAt = new Date();
  } else {
    reunion.attendees.push({
      alumniId: registeredAlumnus?._id || null,
      registrationId: normalizedRegId,
      fullName: data.fullName,
      batchYear: data.batchYear,
      email: data.email,
      contactNumber: data.contactNumber || '',
      guestsCount: data.guestsCount || 0,
      dietaryPreference: data.dietaryPreference || 'Standard',
      note: data.note || '',
      status: 'Coming',
      markedAt: new Date(),
    });
  }

  await reunion.save();

  await AlumniActivity.create({
    alumniId: registeredAlumnus?._id || null,
    registrationId: normalizedRegId,
    alumniName: data.fullName,
    email: data.email,
    activityType: 'REUNION_RSVP_COMING',
    description: `Marked status as "COMING" for reunion "${reunion.title}" (${data.guestsCount ? `+${data.guestsCount} guest(s)` : 'Solo'}).`,
    metadata: {
      reunionId: reunion._id,
      reunionTitle: reunion.title,
      eventDate: reunion.eventDate,
      batchYear: data.batchYear,
      guestsCount: data.guestsCount,
      dietaryPreference: data.dietaryPreference,
      verifiedDatabaseId: Boolean(registeredAlumnus),
    },
    ipAddress: req.ip || '0.0.0.0',
  });

  res.status(200).json({
    status: 'success',
    message: `You are officially marked as "Coming" for ${reunion.title}!`,
    attendeeCount: reunion.attendees.length,
    verifiedAlumnus: Boolean(registeredAlumnus),
  });
});

// =========================================
// 8. ADMIN: GET FULL ALUMNI OVERVIEW & CMS DATA
// =========================================
export const getAdminAlumniOverview = catchAsync(async (_req, res) => {
  const [config, alumni, testimonials, updates, activities] = await Promise.all([
    getOrCreateCmsConfig(),
    Alumni.find().sort({ createdAt: -1 }).lean(),
    AlumniTestimonial.find().sort({ createdAt: -1 }).lean(),
    AlumniUpdate.find().sort({ isPinned: -1, publishDate: -1, createdAt: -1 }).lean(),
    AlumniActivity.find().sort({ createdAt: -1 }).limit(300).lean(),
  ]);

  res.status(200).json({
    status: 'success',
    config,
    alumni,
    testimonials,
    updates,
    activities,
  });
});

// =========================================
// 9. ADMIN: CREATE ALUMNUS DIRECTLY
// =========================================
export const createAlumniAdmin = catchAsync(async (req, res) => {
  const payloadWithDefaultPassword = {
    ...req.body,
    password: req.body.password || 'SihmAlumni@2026',
  };

  const parsed = alumniRegistrationSchema.safeParse(payloadWithDefaultPassword);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'fail',
      message: formatZodError(parsed.error),
    });
  }

  const validData = parsed.data;
  const registrationId =
    req.body.registrationId?.trim().toUpperCase() ||
    (await generateUniqueRegistrationId({
      fullName: validData.fullName,
      yearOfPassing: validData.yearOfPassing,
      courseCompleted: validData.courseCompleted,
      contactNumber: validData.contactNumber,
    }));

  const newAlumni = await Alumni.create({
    ...validData,
    registrationId,
    status: req.body.status || 'Approved',
    isDistinguished: Boolean(req.body.isDistinguished),
    distinguishedCitation: req.body.distinguishedCitation?.trim() || '',
    isSuccessStory: Boolean(req.body.isSuccessStory),
    successStoryTitle: req.body.successStoryTitle?.trim() || '',
    successStoryContent: req.body.successStoryContent?.trim() || '',
    order: Number(req.body.order) || 0,
  });

  await AlumniActivity.create({
    alumniId: newAlumni._id,
    registrationId: newAlumni.registrationId,
    alumniName: newAlumni.fullName,
    email: newAlumni.email,
    activityType: 'ADMIN_MODERATION',
    description: `Admin (${req.user.email}) created alumni profile with status "${newAlumni.status}".`,
    metadata: { adminEmail: req.user.email },
    ipAddress: req.ip || '0.0.0.0',
  });

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_CREATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      endpoint: '/api/v1/alumni/admin/records',
      alumniId: newAlumni._id,
      registrationId: newAlumni.registrationId,
      fullName: newAlumni.fullName,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Alumni profile created successfully.',
    alumni: newAlumni,
  });
});

// =========================================
// 10. ADMIN: UPDATE / APPROVE / FEATURE ALUMNUS
// =========================================
export const updateAlumniAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const alumni = await Alumni.findById(id);

  if (!alumni) {
    return res.status(404).json({
      status: 'fail',
      message: 'Alumni record not found.',
    });
  }

  const previousStatus = alumni.status;

  if (
    req.body.photoFileId &&
    alumni.photoFileId &&
    alumni.photoFileId !== req.body.photoFileId
  ) {
    await deleteImageKitFile(alumni.photoFileId);
    alumni.photoFileId = req.body.photoFileId.trim();
  }

  const editableFields = [
    'fullName',
    'photograph',
    'yearOfAdmission',
    'yearOfPassing',
    'courseCompleted',
    'industrySector',
    'currentDesignation',
    'organisation',
    'currentLocation',
    'email',
    'contactNumber',
    'linkedInProfile',
    'achievements',
    'publicConsent',
    'showEmailPublicly',
    'showPhonePublicly',
    'status',
    'isDistinguished',
    'distinguishedCitation',
    'isSuccessStory',
    'successStoryTitle',
    'successStoryContent',
    'order',
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      alumni[field] = req.body[field];
    }
  });

  if (req.body.password && String(req.body.password).trim().length >= 8) {
    alumni.password = String(req.body.password).trim();
  }

  await alumni.save();

  await AlumniActivity.create({
    alumniId: alumni._id,
    registrationId: alumni.registrationId,
    alumniName: alumni.fullName,
    email: alumni.email,
    activityType:
      previousStatus !== 'Approved' && alumni.status === 'Approved'
        ? 'PROFILE_APPROVED'
        : 'PROFILE_UPDATED',
    description: `Admin (${req.user.email}) updated profile (Status: ${alumni.status}, Distinguished: ${alumni.isDistinguished}, Success Story: ${alumni.isSuccessStory}).`,
    metadata: {
      adminEmail: req.user.email,
      status: alumni.status,
      isDistinguished: alumni.isDistinguished,
      isSuccessStory: alumni.isSuccessStory,
    },
    ipAddress: req.ip || '0.0.0.0',
  });

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      endpoint: `/api/v1/alumni/admin/records/${id}`,
      alumniId: alumni._id,
      registrationId: alumni.registrationId,
      fullName: alumni.fullName,
      status: alumni.status,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Alumni profile updated.',
    alumni,
  });
});

// =========================================
// 11. ADMIN: DELETE ALUMNUS
// =========================================
export const deleteAlumniAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const alumni = await Alumni.findByIdAndDelete(id);

  if (!alumni) {
    return res.status(404).json({
      status: 'fail',
      message: 'Alumni record not found.',
    });
  }

  if (alumni.photoFileId) {
    await deleteImageKitFile(alumni.photoFileId);
  }

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_DELETED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      endpoint: `/api/v1/alumni/admin/records/${id}`,
      deletedRegistrationId: alumni.registrationId,
      deletedName: alumni.fullName,
    },
  });

  res.status(200).json({
    status: 'success',
    message: `Alumni record for "${alumni.fullName}" removed.`,
  });
});

// =========================================
// 12. ADMIN: CREATE / UPDATE / DELETE ALUMNI UPDATES
// =========================================
export const createAlumniUpdateAdmin = catchAsync(async (req, res) => {
  const parsed = alumniUpdateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'fail',
      message: formatZodError(parsed.error),
    });
  }

  const data = parsed.data;
  const created = await AlumniUpdate.create({
    ...data,
    publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
  });

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_UPDATE_CREATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      endpoint: '/api/v1/alumni/admin/updates',
      updateId: created._id,
      category: created.category,
      title: created.title,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Alumni update item published.',
    update: created,
  });
});

export const updateAlumniUpdateAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await AlumniUpdate.findById(id);

  if (!item) {
    return res.status(404).json({
      status: 'fail',
      message: 'Update record not found.',
    });
  }

  if (
    req.body.imageFileId &&
    item.imageFileId &&
    item.imageFileId !== req.body.imageFileId
  ) {
    await deleteImageKitFile(item.imageFileId);
  }

  const fields = [
    'category',
    'title',
    'subtitle',
    'description',
    'eventDate',
    'eventVenue',
    'company',
    'location',
    'actionUrl',
    'image',
    'imageFileId',
    'isPinned',
    'isActive',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      item[f] = req.body[f];
    }
  });

  if (req.body.publishDate) {
    item.publishDate = new Date(req.body.publishDate);
  }

  await item.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_UPDATE_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      endpoint: `/api/v1/alumni/admin/updates/${id}`,
      updateId: item._id,
      category: item.category,
      title: item.title,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Alumni update item saved.',
    update: item,
  });
});

export const deleteAlumniUpdateAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await AlumniUpdate.findByIdAndDelete(id);

  if (!item) {
    return res.status(404).json({
      status: 'fail',
      message: 'Update record not found.',
    });
  }

  if (item.imageFileId) {
    await deleteImageKitFile(item.imageFileId);
  }

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_UPDATE_DELETED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      endpoint: `/api/v1/alumni/admin/updates/${id}`,
      deletedTitle: item.title,
      category: item.category,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Update item deleted.',
  });
});

export const removeReunionAttendeeAdmin = catchAsync(async (req, res) => {
  const { id, attendeeId } = req.params;
  const reunion = await AlumniUpdate.findById(id);

  if (!reunion) {
    return res.status(404).json({
      status: 'fail',
      message: 'Reunion record not found.',
    });
  }

  reunion.attendees = reunion.attendees.filter(
    (att) => att._id.toString() !== attendeeId
  );
  await reunion.save();

  res.status(200).json({
    status: 'success',
    message: 'Attendee removed from reunion roster.',
    update: reunion,
  });
});

// =========================================
// 13. ADMIN: MODERATE TESTIMONIALS & NESTED REPLIES
// =========================================
export const updateTestimonialAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const testimonial = await AlumniTestimonial.findById(id);

  if (!testimonial) {
    return res.status(404).json({
      status: 'fail',
      message: 'Testimonial not found.',
    });
  }

  const fields = [
    'authorName',
    'batchYear',
    'designation',
    'organisation',
    'heading',
    'content',
    'isApproved',
    'isFeatured',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      testimonial[f] = req.body[f];
    }
  });

  await testimonial.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_TESTIMONIAL_MODERATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      testimonialId: testimonial._id,
      isApproved: testimonial.isApproved,
      isFeatured: testimonial.isFeatured,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Testimonial moderation updated.',
    testimonial,
  });
});

export const toggleTestimonialReplyApprovalAdmin = catchAsync(async (req, res) => {
  const { id, replyId } = req.params;
  const testimonial = await AlumniTestimonial.findById(id);

  if (!testimonial) {
    return res.status(404).json({
      status: 'fail',
      message: 'Testimonial thread not found.',
    });
  }

  const targetReply = testimonial.replies.id(replyId);
  if (!targetReply) {
    return res.status(404).json({
      status: 'fail',
      message: 'Reply not found.',
    });
  }

  targetReply.isApproved =
    req.body.isApproved !== undefined
      ? Boolean(req.body.isApproved)
      : !targetReply.isApproved;

  await testimonial.save();

  res.status(200).json({
    status: 'success',
    message: `Reply ${targetReply.isApproved ? 'approved for public view' : 'hidden'}.`,
    testimonial,
  });
});

export const deleteTestimonialAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await AlumniTestimonial.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({
      status: 'fail',
      message: 'Testimonial not found.',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Testimonial thread purged.',
  });
});

export const deleteTestimonialReplyAdmin = catchAsync(async (req, res) => {
  const { id, replyId } = req.params;
  const testimonial = await AlumniTestimonial.findById(id);

  if (!testimonial) {
    return res.status(404).json({
      status: 'fail',
      message: 'Testimonial thread not found.',
    });
  }

  const idsToRemove = new Set([replyId]);
  let added = true;
  while (added) {
    added = false;
    testimonial.replies.forEach((r) => {
      if (
        r.parentReplyId &&
        idsToRemove.has(r.parentReplyId.toString()) &&
        !idsToRemove.has(r._id.toString())
      ) {
        idsToRemove.add(r._id.toString());
        added = true;
      }
    });
  }

  testimonial.replies = testimonial.replies.filter(
    (r) => !idsToRemove.has(r._id.toString())
  );

  await testimonial.save();

  res.status(200).json({
    status: 'success',
    message: 'Reply and nested sub-replies removed.',
    testimonial,
  });
});

// =========================================
// 14. ADMIN: MANAGE ALUMNI ACTIVITY LOGS
// =========================================
export const updateAlumniActivityStatusAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const activity = await AlumniActivity.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!activity) {
    return res.status(404).json({
      status: 'fail',
      message: 'Activity record not found.',
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Activity status updated to ${status}.`,
    activity,
  });
});

export const deleteAlumniActivityAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  await AlumniActivity.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Activity record deleted.',
  });
});

// =========================================
// 15. ADMIN: UPDATE ALUMNI PAGE CMS CONFIG
// =========================================
export const updateAlumniPageConfigAdmin = catchAsync(async (req, res) => {
  let config = await AlumniPageConfig.findOne();
  if (!config) {
    config = new AlumniPageConfig({});
  }

  const fields = [
    'heroEyebrow',
    'heroTitleLine1',
    'heroTitleLine2',
    'introHeading',
    'introParagraph1',
    'introParagraph2',
    'privacyNotice',
    'stats',
    'careerSectors',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      config[f] = req.body[f];
    }
  });

  await config.save();

  await AuditLog.logEvent({
    adminId: req.user._id,
    action: 'ALUMNI_CMS_UPDATED',
    status: 'SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    details: {
      endpoint: '/api/v1/alumni/admin/cms',
      introHeading: config.introHeading,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Alumni Page CMS configuration updated.',
    config,
  });
});