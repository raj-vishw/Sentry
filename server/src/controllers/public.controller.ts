import type { Request, Response } from 'express';
import * as publicService from '../services/public.service.js';
import * as docsService from '../services/docs.service.js';
import { sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export async function stats(_req: Request, res: Response) {
  const result = await publicService.getPublicStats();
  sendSuccess(res, result);
}

export async function categoryCounts(_req: Request, res: Response) {
  const result = await publicService.getPublicCategoryCounts();
  sendSuccess(res, result);
}

export async function platformConfig(_req: Request, res: Response) {
  const result = await publicService.getPublicPlatformConfig();
  sendSuccess(res, result);
}

export async function listDocs(_req: Request, res: Response) {
  sendSuccess(res, { groups: docsService.listDocs() });
}

export async function getDoc(req: Request, res: Response) {
  const doc = await docsService.getDoc(getParam(req, 'slug'));
  sendSuccess(res, { doc });
}
