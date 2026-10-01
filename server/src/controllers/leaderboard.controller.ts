import type { Request, Response } from 'express';
import * as leaderboardService from '../services/leaderboard.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/errors.js';
import type { LeaderboardScope } from '../services/leaderboard.service.js';

const SCOPES: LeaderboardScope[] = ['global', 'weekly', 'monthly'];

function parsePagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit };
}

export async function getGlobal(req: Request, res: Response) {
  const scopeParam = (req.query.scope as string) ?? 'global';
  if (!SCOPES.includes(scopeParam as LeaderboardScope)) {
    throw AppError.validation('scope must be one of: global, weekly, monthly.');
  }
  const { page, limit } = parsePagination(req);
  const result = await leaderboardService.getLeaderboard(scopeParam as LeaderboardScope, page, limit, req.user?.sub);
  sendSuccess(res, result);
}

export async function getTeams(req: Request, res: Response) {
  const { page, limit } = parsePagination(req);
  const result = await leaderboardService.getTeamLeaderboard(page, limit);
  sendSuccess(res, result);
}
