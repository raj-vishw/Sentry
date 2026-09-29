import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller.js';
import { requireAuth, attachUserIfPresent } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', attachUserIfPresent, challengeController.list);
router.get('/:slug', attachUserIfPresent, challengeController.getBySlug);
router.get('/:id/files/:fileId/download', requireAuth, challengeController.downloadFile);
router.post('/:id/hints/:hintId/unlock', requireAuth, challengeController.unlockHint);

export default router;
