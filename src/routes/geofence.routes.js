import { Router } from 'express';
import { createGeofence } from '../controllers/geofence.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// This route is protected.
// 1. authenticateToken runs first to check for a valid JWT.
// 2. authorizeRole('POLICE') runs next to ensure the user is a police officer.
// 3. If both pass, createGeofence is called.
router.post('/', authenticateToken, authorizeRole('POLICE'), createGeofence);

export default router;