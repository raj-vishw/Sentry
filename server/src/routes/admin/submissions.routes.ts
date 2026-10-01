import { Router } from 'express';
import * as adminSubmissionController from '../../controllers/adminSubmission.controller.js';
import { validate } from '../../middleware/validation.middleware.js';
import { listAdminSubmissionsQuerySchema } from '../../validators/adminSubmission.schema.js';

const router = Router();

router.get('/', validate(listAdminSubmissionsQuerySchema, 'query'), adminSubmissionController.list);

export default router;
