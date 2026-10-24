import express from 'express';
import {
  getPublicMentors,
  getPrincipalMentor,
  getAllMentorsAdmin,
  createMentor,
  updateMentor,
  deleteMentor,
  getMentorUploadAuth,
} from '../controllers/mentor.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// =========================================
// PUBLIC ENDPOINTS (Client Website)
// =========================================
router.get('/', getPublicMentors);
router.get('/principal', getPrincipalMentor);

// =========================================
// PROTECTED CMS ENDPOINTS (Admin Portal)
// =========================================
router.use(verifyAccessToken);

// ImageKit temporary signature generator for direct client uploads
router.get('/upload-auth', getMentorUploadAuth);

// Mentor management
router.get('/admin', getAllMentorsAdmin);
router.post('/', createMentor);
router.put('/:id', updateMentor);
router.delete('/:id', deleteMentor);

export default router;
