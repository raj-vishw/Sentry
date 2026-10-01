import { User } from '../models/User.js';
import { Challenge } from '../models/Challenge.js';
import { Category, CATEGORY_SLUGS, type CategorySlug } from '../models/Category.js';
import { Submission } from '../models/Submission.js';

export interface PublicStats {
  challenges: number;
  categories: number;
  solves: number;
  players: number;
}

// Unauthenticated, landing-page-only numbers — intentionally the smallest
// possible surface (counts only, no user/challenge identities) so this is
// safe to expose with no auth at all.
export async function getPublicStats(): Promise<PublicStats> {
  const [challenges, categories, solves, players] = await Promise.all([
    Challenge.countDocuments({ published: true }),
    Category.countDocuments({ active: true }),
    Submission.countDocuments({ correct: true }),
    User.countDocuments(),
  ]);
  return { challenges, categories, solves, players };
}

export async function getPublicCategoryCounts(): Promise<Record<CategorySlug, number>> {
  const rows = await Challenge.aggregate<{ _id: CategorySlug; count: number }>([
    { $match: { published: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(CATEGORY_SLUGS.map((slug) => [slug, 0])) as Record<CategorySlug, number>;
  for (const row of rows) counts[row._id] = row.count;
  return counts;
}
