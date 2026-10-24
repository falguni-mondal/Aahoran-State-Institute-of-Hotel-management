import express from 'express';
import {
  getPublicFacilities,
  getAllFacilitiesAdmin,
  createFacility,
  updateFacility,
  deleteFacility,
  getFacilityUploadAuth,
} from '../controllers/campusFacility.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// =========================================
// PUBLIC ENDPOINTS (Client Website)
// =========================================
router.get('/', getPublicFacilities);

// =========================================
// PROTECTED CMS ENDPOINTS (Admin Portal)
// =========================================
router.use(verifyAccessToken);

router.get('/upload-auth', getFacilityUploadAuth);
router.get('/admin', getAllFacilitiesAdmin);
router.post('/', createFacility);
router.put('/:id', updateFacility);
router.delete('/:id', deleteFacility);

export default router;