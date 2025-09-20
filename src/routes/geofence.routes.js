import { Router } from 'express';
import { createGeofence, getGeofencesInJurisdiction } from '../controllers/geofence.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();
const policeOnly = [authenticateToken, authorizeRole('POLICE')];

router.post('/', policeOnly, createGeofence);
router.get('/', policeOnly, getGeofencesInJurisdiction);


export default router;