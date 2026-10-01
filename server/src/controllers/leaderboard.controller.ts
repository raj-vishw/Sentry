import type { Request, Response } from 'express';
import * as leaderboardService from '../services/leaderboard.service.js';
import { sendSuccess } from '../utils/response.js';
import type { LeaderboardQuery, TeamLeaderboardQuery } from '../validators/leaderboard.schema.js';

export async function getGlobal(req: Request, res: Response) {
  const { scope, page, limit } = req.query as unknown as LeaderboardQuery;
  const result = await leaderboardService.getLeaderboard(scope, page, limit, req.user?.sub);
  sendSuccess(res, result);
}

export async function getTeams(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as TeamLeaderboardQuery;
  const result = await leaderboardService.getTeamLeaderboard(page, limit);
  sendSuccess(res, result);
}
