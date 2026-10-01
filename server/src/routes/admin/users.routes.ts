import { Router } from 'express';
import * as adminUserController from '../../controllers/adminUser.controller.js';
import { validate } from '../../middleware/validation.middleware.js';
import { listAdminUsersQuerySchema } from '../../validators/adminUser.schema.js';

const router = Router();

router.get('/', validate(listAdminUsersQuerySchema, 'query'), adminUserController.list);
router.get('/:id', adminUserController.getById);
router.post('/:id/disable', adminUserController.disable);
router.post('/:id/enable', adminUserController.enable);

export default router;
