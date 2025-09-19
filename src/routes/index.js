import { Router } from 'express';
import authRouter from './auth.routes.js';
import jurisdictionRouter from './jurisdiction.routes.js';
import geofenceRouter from './geofence.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/jurisdiction', jurisdictionRouter);
router.use('/geofence', geofenceRouter);

export default router;
