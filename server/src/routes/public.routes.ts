import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';

// Fully public, no auth — small aggregate counts only, used by the
// unauthenticated landing page. See services/public.service.ts for exactly
// what's exposed (counts only, never identities or lists of records).
const router = Router();

router.get('/stats', publicController.stats);
router.get('/category-counts', publicController.categoryCounts);
router.get('/platform-config', publicController.platformConfig);
router.get('/docs', publicController.listDocs);
router.get('/docs/:slug', publicController.getDoc);

export default router;
