import { Router } from "express";
import { updateLocation, triggerPanic } from "../controllers/tracking.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/location', authenticateToken, updateLocation);
router.post('/panic', authenticateToken, triggerPanic);

export default router;