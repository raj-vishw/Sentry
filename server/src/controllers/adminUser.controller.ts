import type { Request, Response } from 'express';
import * as adminUserService from '../services/adminUser.service.js';
import { sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';
import type { ListAdminUsersQuery, ExportUsersQuery } from '../validators/adminUser.schema.js';

export async function list(req: Request, res: Response) {
  const result = await adminUserService.listUsers(req.query as unknown as ListAdminUsersQuery);
  sendSuccess(res, result);
}

export async function exportCsv(req: Request, res: Response) {
  const csv = await adminUserService.exportUsersCsv(req.query as unknown as ExportUsersQuery);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
  res.send(csv);
}

export async function getById(req: Request, res: Response) {
  const user = await adminUserService.getUserDetail(getParam(req, 'id'));
  sendSuccess(res, { user });
}

export async function disable(req: Request, res: Response) {
  const user = await adminUserService.setUserStatus(req.user!.sub, getParam(req, 'id'), 'DISABLED');
  sendSuccess(res, { user });
}

export async function enable(req: Request, res: Response) {
  const user = await adminUserService.setUserStatus(req.user!.sub, getParam(req, 'id'), 'ACTIVE');
  sendSuccess(res, { user });
}
