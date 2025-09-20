import { Router } from 'express';
import authRouter from './auth.routes.js';
import jurisdictionRouter from './jurisdiction.routes.js';
import geofenceRouter from './geofence.routes.js';
import touristRouter from './tourist.routes.js';
import checkpointRouter from './checkpoint.routes.js';
import trackingRouter from './tracking.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/jurisdiction', jurisdictionRouter);
router.use('/geofence', geofenceRouter);
router.use('/tourist', touristRouter);
router.use('/checkpoint', checkpointRouter);
router.use('/tracking', trackingRouter);

export default router;