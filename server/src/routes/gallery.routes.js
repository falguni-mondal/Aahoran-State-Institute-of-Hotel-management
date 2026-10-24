import express from 'express';
import {
  getPublicGallery,
  getAllGalleryAdmin,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGalleryUploadAuth,
} from '../controllers/gallery.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// =========================================
// PUBLIC ENDPOINTS (Client Website)
// =========================================
router.get('/public', getPublicGallery);
router.get('/public/:category', getPublicGallery);

// =========================================
// PROTECTED CMS ENDPOINTS (Admin Portal)
// =========================================
router.use(verifyAccessToken);

router.get('/upload-auth', getGalleryUploadAuth);
router.get('/admin', getAllGalleryAdmin);
router.post('/', createGalleryItem);
router.put('/:id', updateGalleryItem);
router.delete('/:id', deleteGalleryItem);

export default router;