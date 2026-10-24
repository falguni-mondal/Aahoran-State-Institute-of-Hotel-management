import express from 'express';
import {
  getPublicPlacements,
  getAllPlacementsAdmin,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacementUploadAuth,
} from '../controllers/placementRoster.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// =========================================
// PUBLIC ENDPOINTS (Client Website)
// =========================================
router.get('/', getPublicPlacements);

// =========================================
// PROTECTED CMS ENDPOINTS (Admin Portal)
// =========================================
router.use(verifyAccessToken);

router.get('/upload-auth', getPlacementUploadAuth);
router.get('/admin', getAllPlacementsAdmin);
router.post('/', createPlacement);
router.put('/:id', updatePlacement);
router.delete('/:id', deletePlacement);

export default router;
