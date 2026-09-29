import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getProfile(req: Request, res: Response) {
  const detail = await userService.getProfileDetail(req.user!.sub);
  sendSuccess(res, detail);
}

export async function updateProfile(req: Request, res: Response) {
  const user = await userService.updateProfile(req.user!.sub, req.body);
  sendSuccess(res, { user });
}
