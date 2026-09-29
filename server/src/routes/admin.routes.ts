import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createChallengeSchema, updateChallengeSchema } from '../validators/challenge.schema.js';
import { upload } from '../config/uploads.js';

const router = Router();

// Every route in this file requires an authenticated ADMIN — enforced here,
// server-side, regardless of what the frontend shows or hides.
router.use(requireAuth, requireRole('ADMIN'));

router.get('/challenges/:id', challengeController.getByIdAdmin);
router.post('/challenges', validate(createChallengeSchema), challengeController.create);
router.patch('/challenges/:id', validate(updateChallengeSchema), challengeController.update);
router.delete('/challenges/:id', challengeController.remove);
router.post('/challenges/:id/publish', challengeController.publish);
router.post('/challenges/:id/unpublish', challengeController.unpublish);
router.post('/challenges/:id/files', upload.single('file'), challengeController.uploadFile);

export default router;
