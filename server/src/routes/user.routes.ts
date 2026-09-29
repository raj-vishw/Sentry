import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateProfileSchema } from '../validators/user.schema.js';

const router = Router();

router.use(requireAuth);
router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);

export default router;
