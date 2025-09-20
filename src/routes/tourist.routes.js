import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';
import {
  registerTourist,
  getMyProfile,
  updateMyProfile,
  getDigitalId,
  addEmergencyContact,
  createTrip,
  deleteEmergencyContact
} from '../controllers/tourist.controller.js';

const router = Router();

const touristOnly = [authenticateToken, authorizeRole('TOURIST')];

router.post('/register', registerTourist);
router.get('/profile/me', touristOnly, getMyProfile);
router.put('/profile/me', touristOnly, updateMyProfile);
router.get('/digital-id', touristOnly, getDigitalId);
router.post('/emergency-contact', touristOnly, addEmergencyContact);
router.post('/trip', touristOnly, createTrip);
router.delete('/emergency-contact/:contactId', touristOnly, deleteEmergencyContact);

export default router;