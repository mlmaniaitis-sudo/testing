import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';
import {
  registerTourist,
  getMyProfile,
  updateMyProfile,
} from '../controllers/tourist.controller.js';

const router = Router();

const touristOnly = [authenticateToken, authorizeRole('TOURIST')];

router.post('/register', registerTourist);
router.get('/profile/me', touristOnly, getMyProfile);
router.put('/profile/me', touristOnly, updateMyProfile);

export default router;