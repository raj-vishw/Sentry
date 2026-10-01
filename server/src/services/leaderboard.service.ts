import { Types } from 'mongoose';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { Team } from '../models/Team.js';

export type LeaderboardScope = 'global' | 'weekly' | 'monthly';

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  points: number;
  solvedCount: number;
  teamName: string | null;
}

export interface LeaderboardResult {
  entries: LeaderboardEntryDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  me: (LeaderboardEntryDto & { onPage: boolean }) | null;
}

/**
 * Appends aggregation stages that assign a sequential `rank` (1, 2, 3, ...)
 * following a multi-field sort. MongoDB's native rank operators ($rank,
 * $denseRank, $documentNumber) only accept a single-field `sortBy`, which
 * can't express "points desc, then earlier account/solve as the
 * tiebreaker" in one expression — so instead: sort fully, collapse the
 * whole ordered set into one array, then re-expand it with its array index
 * as the rank. Assumes a leaderboard-sized result set (hundreds—low
 * thousands of rows), not an unbounded one — reasonable for this platform.
 */
function withSequentialRank(sortBy: Record<string, 1 | -1>) {
  return [
    { $sort: sortBy },
    { $group: { _id: null, docs: { $push: '$$ROOT' } } },
    { $unwind: { path: '$docs', includeArrayIndex: 'rankIndex' } },
    { $replaceRoot: { newRoot: { $mergeObjects: ['$docs', { rank: { $add: ['$rankIndex', 1] } }] } } },
  ];
}

function scopeStart(scope: LeaderboardScope): Date | null {
  if (scope === 'global') return null;
  const now = new Date();
  const days = scope === 'weekly' ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Ranked entries for a scope: points desc, ties broken by earlier
 * createdAt (account creation for global, first solve in the window for
 * weekly/monthly). Built as one aggregation so the database does the
 * ranking across the *entire* matching set before anything is paginated,
 * so "my rank" is always correct even off-page, without a second scan.
 */
async function rankedEntries(scope: LeaderboardScope): Promise<
  { userId: Types.ObjectId; points: number; solvedCount: number; rank: number; createdAt: Date }[]
> {
  const since = scopeStart(scope);

  if (!since) {
    return User.aggregate([
      {
        $project: {
          points: 1,
          createdAt: 1,
          solvedCount: { $size: '$solvedChallenges' },
        },
      },
      ...withSequentialRank({ points: -1, createdAt: 1 }),
      { $project: { userId: '$_id', points: 1, solvedCount: 1, rank: 1, createdAt: 1, _id: 0 } },
    ]);
  }

  // Weekly/monthly: rank by points *earned in the window*, from the
  // submission log — the User.points field is lifetime-total and not
  // useful for a time-boxed scope.
  return Submission.aggregate([
    { $match: { correct: true, createdAt: { $gte: since } } },
    {
      $group: {
        _id: '$user',
        points: { $sum: '$pointsAwarded' },
        solvedCount: { $sum: 1 },
        createdAt: { $min: '$createdAt' },
      },
    },
    ...withSequentialRank({ points: -1, createdAt: 1 }),
    { $project: { userId: '$_id', points: 1, solvedCount: 1, rank: 1, createdAt: 1, _id: 0 } },
  ]);
}

async function hydrate(rows: { userId: Types.ObjectId; points: number; solvedCount: number; rank: number }[]) {
  const users = await User.find({ _id: { $in: rows.map((r) => r.userId) } })
    .select('username avatar team')
    .populate('team', 'name');
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return rows
    .map((r): LeaderboardEntryDto | null => {
      const u = byId.get(String(r.userId));
      if (!u) return null;
      const team = u.team as unknown as { name: string } | null;
      return {
        rank: r.rank,
        userId: String(r.userId),
        username: u.username,
        avatar: u.avatar ?? null,
        points: r.points,
        solvedCount: r.solvedCount,
        teamName: team?.name ?? null,
      };
    })
    .filter((e): e is LeaderboardEntryDto => e !== null);
}

export async function getLeaderboard(
  scope: LeaderboardScope,
  page: number,
  limit: number,
  viewerId: string | undefined,
): Promise<LeaderboardResult> {
  const ranked = await rankedEntries(scope);
  const total = ranked.length;
  const skip = (page - 1) * limit;
  const pageRows = ranked.slice(skip, skip + limit);

  const viewerRow = viewerId ? ranked.find((r) => String(r.userId) === viewerId) : undefined;
  const onPage = !!viewerRow && pageRows.includes(viewerRow);

  const toHydrate = [...pageRows];
  if (viewerRow && !onPage) toHydrate.push(viewerRow);
  const hydrated = await hydrate(toHydrate);
  const byUserId = new Map(hydrated.map((e) => [e.userId, e]));

  const entries = pageRows.map((r) => byUserId.get(String(r.userId))).filter((e): e is LeaderboardEntryDto => !!e);
  const meEntry = viewerRow ? byUserId.get(String(viewerRow.userId)) : undefined;

  return {
    entries,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    me: meEntry ? { ...meEntry, onPage } : null,
  };
}

export interface TeamLeaderboardEntryDto {
  rank: number;
  teamId: string;
  name: string;
  slug: string;
  avatar: string | null;
  points: number;
  solvedCount: number;
  memberCount: number;
}

export async function getTeamLeaderboard(page: number, limit: number) {
  const ranked: { teamId: Types.ObjectId; points: number; solvedCount: number; memberCount: number; rank: number }[] =
    await User.aggregate([
      { $match: { team: { $ne: null } } },
      {
        $group: {
          _id: '$team',
          points: { $sum: '$points' },
          solvedCount: { $sum: { $size: '$solvedChallenges' } },
          memberCount: { $sum: 1 },
        },
      },
      ...withSequentialRank({ points: -1, _id: 1 }),
      { $project: { teamId: '$_id', points: 1, solvedCount: 1, memberCount: 1, rank: 1, _id: 0 } },
    ]);

  const total = ranked.length;
  const skip = (page - 1) * limit;
  const pageRows = ranked.slice(skip, skip + limit);

  const teams = await Team.find({ _id: { $in: pageRows.map((r) => r.teamId) } }).select('name slug avatar');
  const teamsById = new Map(teams.map((t) => [String(t._id), t]));

  const entries: TeamLeaderboardEntryDto[] = pageRows
    .map((r) => {
      const t = teamsById.get(String(r.teamId));
      if (!t) return null;
      return {
        rank: r.rank,
        teamId: String(r.teamId),
        name: t.name,
        slug: t.slug,
        avatar: t.avatar ?? null,
        points: r.points,
        solvedCount: r.solvedCount,
        memberCount: r.memberCount,
      };
    })
    .filter((e): e is TeamLeaderboardEntryDto => e !== null);

  return { entries, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}
