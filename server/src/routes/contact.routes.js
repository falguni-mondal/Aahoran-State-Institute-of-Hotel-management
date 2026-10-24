import express from 'express';
import {
  getPublicContact,
  getAdminContact,
  updateContact,
} from '../controllers/contact.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// =========================================
// PUBLIC ENDPOINTS (Client Website)
// =========================================
router.get('/', getPublicContact);

// =========================================
// PROTECTED CMS ENDPOINTS (Admin Portal)
// =========================================
router.use(verifyAccessToken);

router.get('/admin', getAdminContact);
router.put('/', updateContact);

export default router;