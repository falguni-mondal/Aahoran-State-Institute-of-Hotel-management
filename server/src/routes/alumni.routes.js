import express from 'express';
import {
  getPublicNavBadges,
  getAlumniUploadAuth,
  getPublicAlumniHub,
  registerAlumnus,
  loginAlumnus,
  getMyAlumniSession,
  logoutAlumnus,
  verifyAlumniRegistrationId,
  createPublicTestimonial,
  addReplyToTestimonial,
  submitReunionRsvp,
  getAdminAlumniOverview,
  createAlumniAdmin,
  updateAlumniAdmin,
  deleteAlumniAdmin,
  createAlumniUpdateAdmin,
  updateAlumniUpdateAdmin,
  deleteAlumniUpdateAdmin,
  removeReunionAttendeeAdmin,
  updateTestimonialAdmin,
  toggleTestimonialReplyApprovalAdmin,
  deleteTestimonialAdmin,
  deleteTestimonialReplyAdmin,
  updateAlumniActivityStatusAdmin,
  deleteAlumniActivityAdmin,
  updateAlumniPageConfigAdmin,
} from '../controllers/alumni.controller.js';
import { verifyAccessToken, restrictTo } from '../middlewares/auth.middleware.js';
import { optionalAlumniAuth } from '../middlewares/alumniAuth.middleware.js';

const router = express.Router();

// =========================================
// PUBLIC & ALUMNI SESSION ENDPOINTS (Client Website)
// =========================================
router.get('/nav-badges', getPublicNavBadges);
router.get('/hub', optionalAlumniAuth, getPublicAlumniHub);
router.get('/upload-auth', getAlumniUploadAuth);

// Alumni Registration & Authentication (Registration ID or Email + Password)
router.post('/register', registerAlumnus);
router.post('/auth/login', loginAlumnus);
router.get('/auth/me', optionalAlumniAuth, getMyAlumniSession);
router.post('/auth/logout', logoutAlumnus);

router.get('/verify/:registrationId', verifyAlumniRegistrationId);

// Testimonials & Infinite Nested Replies (Auto-uses Alumni account if logged in; requires Admin approval)
router.post('/testimonials', optionalAlumniAuth, createPublicTestimonial);
router.post('/testimonials/:id/replies', optionalAlumniAuth, addReplyToTestimonial);

// Reunion RSVP ("Mark as Coming" — Auto-uses Alumni account if logged in)
router.post('/updates/:id/rsvp', optionalAlumniAuth, submitReunionRsvp);

// =========================================
// PROTECTED CMS ENDPOINTS (Admin Portal — RBAC Enforced)
// =========================================
router.use(verifyAccessToken);
router.use(restrictTo('Admin', 'SuperAdmin'));

router.get('/admin/overview', getAdminAlumniOverview);

// Alumni Directory CRUD & Approval
router.post('/admin/records', createAlumniAdmin);
router.put('/admin/records/:id', updateAlumniAdmin);
router.delete('/admin/records/:id', deleteAlumniAdmin);

// Updates, Reunions, News, Careers & Newsletters CRUD
router.post('/admin/updates', createAlumniUpdateAdmin);
router.put('/admin/updates/:id', updateAlumniUpdateAdmin);
router.delete('/admin/updates/:id', deleteAlumniUpdateAdmin);
router.delete('/admin/updates/:id/attendees/:attendeeId', removeReunionAttendeeAdmin);

// Testimonials & Nested Replies Moderation
router.put('/admin/testimonials/:id', updateTestimonialAdmin);
router.patch(
  '/admin/testimonials/:id/replies/:replyId/approve',
  toggleTestimonialReplyApprovalAdmin
);
router.delete('/admin/testimonials/:id', deleteTestimonialAdmin);
router.delete('/admin/testimonials/:id/replies/:replyId', deleteTestimonialReplyAdmin);

// Alumni Activity Telemetry Management
router.patch('/admin/activities/:id/status', updateAlumniActivityStatusAdmin);
router.delete('/admin/activities/:id', deleteAlumniActivityAdmin);

// Page CMS Config
router.put('/admin/cms', updateAlumniPageConfigAdmin);

export default router;