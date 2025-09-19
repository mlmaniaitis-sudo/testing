import { Router } from 'express';
import upload from '../config/cloudinary.js';
import { registerStaff, submitKycForTourist } from '../controllers/checkpoint.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public route to register new staff (for development)
router.post('/register', registerStaff);

// Protected route for staff to submit KYC
router.post(
  '/submit-kyc',
  authenticateToken,
  authorizeRole('CHECKPOINT_STAFF'),
  upload.single('documentImage'), // Handles file upload to Cloudinary
  submitKycForTourist
);

export default router;