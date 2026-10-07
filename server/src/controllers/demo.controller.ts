import type { Request, Response } from 'express';
import * as demoService from '../services/demo.service.js';
import { sendSuccess } from '../utils/response.js';

export async function reset(req: Request, res: Response) {
  await demoService.resetDemo(req.user!.sub);
  sendSuccess(res, { reset: true });
}
