import { Types } from 'mongoose';
import { User, type UserDoc } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { AppError } from '../utils/errors.js';
import { computeStreak } from './user.service.js';
import { record as recordAudit } from './auditLog.service.js';
import { toCsv } from '../utils/csv.js';
import type { ListAdminUsersQuery, ExportUsersQuery } from '../validators/adminUser.schema.js';

export interface AdminUserListItemDto {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  points: number;
  solvedCount: number;
  teamId: string | null;
  teamName: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

function toListItem(doc: UserDoc): AdminUserListItemDto {
  const team = doc.team as unknown as { _id?: unknown; name?: string } | null;
  return {
    id: doc.id,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    points: doc.points,
    solvedCount: doc.solvedChallenges.length,
    teamId: team ? String(team._id ?? team) : null,
    teamName: team?.name ?? null,
    createdAt: doc.createdAt,
    lastLoginAt: doc.lastLoginAt ?? null,
  };
}

const SORTS: Record<ListAdminUsersQuery['sort'], Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'points-desc': { points: -1 },
  'points-asc': { points: 1 },
};

export async function listUsers(opts: ListAdminUsersQuery) {
  const filter: Record<string, unknown> = {};
  if (opts.role) filter.role = opts.role;
  if (opts.status) filter.status = opts.status;
  if (opts.search) {
    const escaped = opts.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');
    filter.$or = [{ username: pattern }, { email: pattern }];
  }

  const skip = (opts.page - 1) * opts.limit;
  const [docs, total] = await Promise.all([
    User.find(filter).sort(SORTS[opts.sort]).skip(skip).limit(opts.limit).populate('team', 'name'),
    User.countDocuments(filter),
  ]);

  return {
    users: docs.map(toListItem),
    pagination: { page: opts.page, limit: opts.limit, total, totalPages: Math.max(1, Math.ceil(total / opts.limit)) },
  };
}

export interface AdminUserDetailDto extends AdminUserListItemDto {
  bio: string;
  streak: number;
  submissionCount: number;
  correctSubmissionCount: number;
  recentSolves: { challengeId: string; title: string; points: number; solvedAt: Date }[];
}

// Bounds memory for an unpaginated export — generous for anything this
// platform's scale would realistically produce.
const EXPORT_ROW_CAP = 10_000;

export async function exportUsersCsv(opts: ExportUsersQuery): Promise<string> {
  const { users } = await listUsers({ ...opts, sort: 'newest', page: 1, limit: EXPORT_ROW_CAP });
  const header = ['id', 'username', 'email', 'role', 'status', 'points', 'solvedCount', 'teamName', 'createdAt', 'lastLoginAt'];
  const rows = users.map((u) => [
    u.id,
    u.username,
    u.email,
    u.role,
    u.status,
    String(u.points),
    String(u.solvedCount),
    u.teamName ?? '',
    u.createdAt.toISOString(),
    u.lastLoginAt?.toISOString() ?? '',
  ]);
  return toCsv(header, rows);
}

export async function getUserDetail(id: string): Promise<AdminUserDetailDto> {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('User not found.');
  const user = await User.findById(id).populate('team', 'name').populate('solvedChallenges.challenge', 'title');
  if (!user) throw AppError.notFound('User not found.');

  const [submissionCount, correctSubmissionCount] = await Promise.all([
    Submission.countDocuments({ user: id }),
    Submission.countDocuments({ user: id, correct: true }),
  ]);

  type PopulatedSolve = { challenge: { _id: unknown; title: string } | null; points: number; solvedAt: Date };
  const solvedChallenges = user.solvedChallenges as unknown as PopulatedSolve[];
  const recentSolves = solvedChallenges
    .filter((s) => s.challenge)
    .sort((a, b) => b.solvedAt.getTime() - a.solvedAt.getTime())
    .slice(0, 10)
    .map((s) => ({ challengeId: String(s.challenge!._id), title: s.challenge!.title, points: s.points, solvedAt: s.solvedAt }));

  return {
    ...toListItem(user),
    bio: user.bio,
    streak: computeStreak(user.solvedChallenges.map((s) => s.solvedAt)),
    submissionCount,
    correctSubmissionCount,
    recentSolves,
  };
}

export async function setUserStatus(
  requesterId: string,
  userId: string,
  status: 'ACTIVE' | 'DISABLED',
): Promise<AdminUserListItemDto> {
  if (!Types.ObjectId.isValid(userId)) throw AppError.notFound('User not found.');
  if (userId === requesterId) {
    throw AppError.validation('You cannot change your own account status.');
  }

  const user = await User.findById(userId).populate('team', 'name');
  if (!user) throw AppError.notFound('User not found.');

  user.status = status;
  if (status === 'DISABLED') {
    // Reuses the existing refresh-rotation kill switch so every outstanding
    // refresh token is invalidated immediately, the same mechanism logout
    // already uses (see auth.service.ts).
    user.tokenVersion += 1;
  }
  await user.save();

  await recordAudit(
    requesterId,
    'ADMIN',
    status === 'DISABLED' ? 'ADMIN_DISABLED_USER' : 'ADMIN_ENABLED_USER',
    'user',
    userId,
  );

  return toListItem(user);
}
