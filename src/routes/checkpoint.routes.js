import { Router } from 'express';
import upload from '../config/multer.js';
import { registerStaff, submitKycForTourist } from '../controllers/checkpoint.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

const staffOnly = [authenticateToken, authorizeRole('CHECKPOINT_STAFF')];

router.post('/register', registerStaff);
router.post('/submit-kyc', staffOnly, upload.single('documentImage'), submitKycForTourist);

export default router;