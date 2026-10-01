import { Router } from 'express';
import * as challengeController from '../../controllers/challenge.controller.js';
import { validate } from '../../middleware/validation.middleware.js';
import { createChallengeSchema, updateChallengeSchema } from '../../validators/challenge.schema.js';
import { upload } from '../../config/uploads.js';

const router = Router();

router.get('/:id', challengeController.getByIdAdmin);
router.post('/', validate(createChallengeSchema), challengeController.create);
router.patch('/:id', validate(updateChallengeSchema), challengeController.update);
router.delete('/:id', challengeController.remove);
router.post('/:id/publish', challengeController.publish);
router.post('/:id/unpublish', challengeController.unpublish);
router.post('/:id/files', upload.single('file'), challengeController.uploadFile);

export default router;
