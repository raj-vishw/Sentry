import type { Request, Response } from 'express';
import * as adminSubmissionService from '../services/adminSubmission.service.js';
import { sendSuccess } from '../utils/response.js';
import type { ListAdminSubmissionsQuery } from '../validators/adminSubmission.schema.js';

export async function list(req: Request, res: Response) {
  const result = await adminSubmissionService.listSubmissions(req.query as unknown as ListAdminSubmissionsQuery);
  sendSuccess(res, result);
}
