import { Router } from 'express';
import { createJurisdictionAndUser } from '../controllers/jurisdiction.controller.js';

const router = Router();

router.post('/', createJurisdictionAndUser);

export default router;
