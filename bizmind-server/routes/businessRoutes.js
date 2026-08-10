import express from 'express';
import {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  getBusinessProfile,
  updateBusinessProfile,
} from '../controllers/businessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createBusiness);
router.get('/', getBusinesses);
router.get('/profile', getBusinessProfile);
router.put('/profile', updateBusinessProfile);
router.get('/:id', getBusinessById);
router.put('/:id', updateBusiness);
router.delete('/:id', deleteBusiness);

export default router;
