import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { record as recordAudit } from './auditLog.service.js';
import { seedDemoData } from '../scripts/seedDemo.js';

/**
 * `DEMO_MODE` is a deployment-time env var, not a client- or database-
 * controlled flag, and its only job is to decide whether this reset
 * capability exists at all (404 otherwise, regardless of who calls it).
 * The demo's actual safety model is disclosed, not hidden: its admin and
 * player accounts use fixed, published credentials (see `seedDemo.ts`'s
 * `DEMO_ADMIN_CREDENTIALS`/`DEMO_USER_CREDENTIALS`) so visitors can see
 * both the player and the organizer experience without registering — see
 * docs/security.md for what that means for a real deployment.
 */
export async function resetDemo(adminId: string): Promise<void> {
  if (!env.DEMO_MODE) {
    throw AppError.notFound('Not found.');
  }

  await seedDemoData();
  await recordAudit(adminId, 'ADMIN', 'ADMIN_RESET_DEMO', 'demo', 'reset');
}
