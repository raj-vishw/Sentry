import { z } from 'zod';

export const updateSystemConfigSchema = z.object({
  platformName: z.string().trim().min(1, 'Platform name cannot be empty.').max(60).optional(),
  platformDescription: z.string().trim().max(280).optional(),
  registrationEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;
