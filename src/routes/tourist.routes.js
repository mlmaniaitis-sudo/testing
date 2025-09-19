import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';
import {
  registerTourist,
  getMyProfile,
  updateMyProfile,
} from '../controllers/tourist.controller.js';

const router = Router();

// PUBLIC ROUTE for initial account creation
router.post('/register', registerTourist);

// PROTECTED ROUTES for logged-in tourists
const touristOnly = [authenticateToken, authorizeRole('TOURIST')];

router.get('/profile/me', touristOnly, getMyProfile);
router.put('/profile/me', touristOnly, updateMyProfile);

export default router;