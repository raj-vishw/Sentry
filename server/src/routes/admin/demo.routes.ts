import { Router } from 'express';
import * as demoController from '../../controllers/demo.controller.js';

const router = Router();

// Admin-only (enforced by the parent admin.routes.ts gate) AND only
// functional when DEMO_MODE=true (enforced in demo.service.ts, which
// 404s otherwise) — inert on every non-demo deployment.
router.post('/reset', demoController.reset);

export default router;
