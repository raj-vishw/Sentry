import { User, type UserDoc } from '../models/User.js';
import { Challenge } from '../models/Challenge.js';
import { CATEGORY_SLUGS } from '../models/Category.js';
import { AppError } from '../utils/errors.js';
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
  createdAt: Date;
}

export async function getRank(points: number): Promise<number> {
  const higherRanked = await User.countDocuments({ points: { $gt: points } });
  return higherRanked + 1;
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
  const user = await User.findById(userId).populate('solvedChallenges.challenge', 'title category');
  if (!user) throw AppError.notFound('User not found.');

  const safeUser = await toSafeUser(user);

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
      { $match: { published: true } },
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

  return { user: safeUser, recentSolves, categoryProgress };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found.');

  if (input.bio !== undefined) user.bio = input.bio;
  if (input.avatar !== undefined) user.avatar = input.avatar;

  await user.save();
  return toSafeUser(user);
}
