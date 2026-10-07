import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { record as recordAudit } from './auditLog.service.js';
import { seedDemoData } from '../scripts/seedDemo.js';

/**
 * The real safety boundary for a public demo is simply that its admin
 * credentials are never shared publicly — same as any deployment.
 * `DEMO_MODE` is not a second access-control layer on top of
 * `requireRole('ADMIN')`; its only job is to decide whether this reset
 * capability exists at all. On every non-demo deployment (the default),
 * this throws 404 regardless of who calls it, so the route is inert.
 */
export async function resetDemo(adminId: string): Promise<void> {
  if (!env.DEMO_MODE) {
    throw AppError.notFound('Not found.');
  }

  await seedDemoData(adminId);
  await recordAudit(adminId, 'ADMIN', 'ADMIN_RESET_DEMO', 'demo', 'reset');
}
