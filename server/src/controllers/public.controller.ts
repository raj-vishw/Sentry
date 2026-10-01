import type { Request, Response } from 'express';
import * as publicService from '../services/public.service.js';
import { sendSuccess } from '../utils/response.js';

export async function stats(_req: Request, res: Response) {
  const result = await publicService.getPublicStats();
  sendSuccess(res, result);
}

export async function categoryCounts(_req: Request, res: Response) {
  const result = await publicService.getPublicCategoryCounts();
  sendSuccess(res, result);
}
