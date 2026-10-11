import { User, type UserDoc } from '../models/User.js';
import { Challenge } from '../models/Challenge.js';
import { CATEGORY_SLUGS } from '../models/Category.js';
import { AppError } from '../utils/errors.js';
import { listForUser, type AchievementDto } from './achievement.service.js';
import { listPublishedWriteups, type WriteupListItemDto } from './writeup.service.js';
import { leaveTeam } from './team.service.js';
import type { UpdateProfileInput } from '../validators/user.schema.js';

export interface SafeUserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string;
  points: number;
  rank: number;
  solvedCount: number;
  streak: number;
  teamId: string | null;
  teamName: string | null;
  createdAt: Date;
}

// Always excludes hidden users from the count, for everyone — a hidden
// user calling this for their own profile still gets a correct rank
// among non-hidden peers; they're just never the one being counted
// against someone else's rank, and never appear on the public list.
export async function getRank(points: number): Promise<number> {
  const higherRanked = await User.countDocuments({ points: { $gt: points }, hidden: { $ne: true } });
  return higherRanked + 1;
}

/**
 * Consecutive-day streak, counted backward from today: the number of
 * calendar days in a row (UTC) with at least one solve, up through either
 * today or yesterday — a solve yesterday still counts as an active streak
 * today (it isn't broken until a full day passes with no solve at all).
 */
export function computeStreak(solvedAtDates: Date[]): number {
  if (solvedAtDates.length === 0) return 0;

  const dayKeys = new Set(solvedAtDates.map((d) => Math.floor(d.getTime() / 86_400_000)));
  const todayKey = Math.floor(Date.now() / 86_400_000);

  let cursor = dayKeys.has(todayKey) ? todayKey : todayKey - 1;
  if (!dayKeys.has(cursor)) return 0;

  let streak = 0;
  while (dayKeys.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

export async function toSafeUser(doc: UserDoc): Promise<SafeUserDto> {
  return {
    id: doc.id,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    avatar: doc.avatar ?? null,
    bio: doc.bio,
    points: doc.points,
    rank: await getRank(doc.points),
    solvedCount: doc.solvedChallenges.length,
    streak: computeStreak(doc.solvedChallenges.map((s) => s.solvedAt)),
    // `doc.team` is either a raw ObjectId (unpopulated) or a populated
    // sub-document (e.g. from getProfileDetail's `.populate('team', ...)`)
    // — extract the id correctly either way rather than stringifying
    // whichever shape happens to be on the doc.
    teamId: doc.team ? String((doc.team as unknown as { _id?: unknown })._id ?? doc.team) : null,
    teamName: null,
    createdAt: doc.createdAt,
  };
}

export interface RecentSolveDto {
  challengeId: string;
  title: string;
  category: string;
  points: number;
  solvedAt: Date;
}

export interface CategoryProgressDto {
  category: string;
  solved: number;
  total: number;
}

export async function getProfileDetail(userId: string) {
  const user = await User.findById(userId)
    .populate('solvedChallenges.challenge', 'title category')
    .populate('team', 'name');
  if (!user) throw AppError.notFound('User not found.');

  const safeUser = await toSafeUser(user);
  const populatedTeam = user.team as unknown as { name: string } | null;
  if (populatedTeam) safeUser.teamName = populatedTeam.name;

  type PopulatedSolve = { challenge: { _id: unknown; title: string; category: string } | null; points: number; solvedAt: Date };
  const solvedChallenges = user.solvedChallenges as unknown as PopulatedSolve[];

  const recentSolves: RecentSolveDto[] = solvedChallenges
    .filter((s) => s.challenge)
    .sort((a, b) => b.solvedAt.getTime() - a.solvedAt.getTime())
    .slice(0, 8)
    .map((s) => ({
      challengeId: String(s.challenge!._id),
      title: s.challenge!.title,
      category: s.challenge!.category,
      points: s.points,
      solvedAt: s.solvedAt,
    }));

  const [totalsByCategory, solvedByCategory] = await Promise.all([
    Challenge.aggregate<{ _id: string; total: number }>([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$category', total: { $sum: 1 } } },
    ]),
    Promise.resolve(
      solvedChallenges.reduce<Record<string, number>>((acc, s) => {
        if (!s.challenge) return acc;
        acc[s.challenge.category] = (acc[s.challenge.category] ?? 0) + 1;
        return acc;
      }, {}),
    ),
  ]);

  const totalsMap = new Map(totalsByCategory.map((t) => [t._id, t.total]));
  const categoryProgress: CategoryProgressDto[] = CATEGORY_SLUGS.map((category) => ({
    category,
    solved: solvedByCategory[category] ?? 0,
    total: totalsMap.get(category) ?? 0,
  }));

  const badges: AchievementDto[] = await listForUser(userId);

  return { user: safeUser, recentSolves, categoryProgress, badges };
}

export interface PublicProfileDto {
  username: string;
  avatar: string | null;
  bio: string;
  points: number;
  rank: number;
  solvedCount: number;
  streak: number;
  teamName: string | null;
  createdAt: Date;
  badges: AchievementDto[];
  writeups: WriteupListItemDto[];
}

/**
 * Public, unauthenticated profile view — deliberately a separate, smaller
 * DTO rather than reusing `toSafeUser`/`SafeUserDto`, which includes
 * `email` and is only ever meant for the account owner (`GET /users/me`).
 */
export async function getPublicProfile(username: string): Promise<PublicProfileDto> {
  const user = await User.findOne({ usernameLower: username.toLowerCase() }).populate('team', 'name');
  if (!user) throw AppError.notFound('User not found.');

  const populatedTeam = user.team as unknown as { name: string } | null;

  const [rank, badges, writeupsResult] = await Promise.all([
    getRank(user.points),
    listForUser(user.id),
    listPublishedWriteups({ author: user.username, sort: 'newest', page: 1, limit: 6 }),
  ]);

  return {
    username: user.username,
    avatar: user.avatar ?? null,
    bio: user.bio,
    points: user.points,
    rank,
    solvedCount: user.solvedChallenges.length,
    streak: computeStreak(user.solvedChallenges.map((s) => s.solvedAt)),
    teamName: populatedTeam?.name ?? null,
    createdAt: user.createdAt,
    badges,
    writeups: writeupsResult.writeups,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found.');

  if (input.bio !== undefined) user.bio = input.bio;
  if (input.avatar !== undefined) user.avatar = input.avatar;

  await user.save();
  return toSafeUser(user);
}

/**
 * Self-service account deletion. ADMIN accounts are excluded — there's no
 * guarantee another admin exists to take over, so that's an operator
 * decision, not a self-serve one (mirrors adminUser.service.ts's own
 * "you cannot change your own account status" guard for the same reason).
 *
 * Submissions, writeups, and achievements are deliberately left in place
 * rather than cascade-deleted: Challenge.solves counters, first-blood
 * history, and other players' leaderboard standing all depend on them,
 * and the read paths that populate a `user` ref already tolerate a
 * deleted account (see challenge.service.ts's getFirstBlood, which
 * returns null rather than throwing once `user` no longer resolves).
 */
export async function deleteOwnAccount(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found.');

  if (user.role === 'ADMIN') {
    throw AppError.forbidden(
      'Admin accounts cannot self-delete — ask another administrator to remove this account.',
    );
  }

  // Reuses the same ownership-transfer/auto-disband logic as a normal
  // "leave team" action, so this can never leave a ghost member entry or
  // an owner-less team behind. Swallow "not on a team" rather than
  // branching on `user.team` first, since that field and `Team.members`
  // are updated by separate writes and could in principle disagree.
  try {
    await leaveTeam(userId);
  } catch (err) {
    if (!(err instanceof AppError && err.code === 'NOT_FOUND')) throw err;
  }

  await User.deleteOne({ _id: userId });
}
