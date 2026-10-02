import { Types } from 'mongoose';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { Challenge, type ChallengeDoc } from '../models/Challenge.js';
import { Hint } from '../models/Hint.js';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { AppError } from '../utils/errors.js';
import { hashFlag } from '../utils/flag.js';
import { slugify } from '../utils/slug.js';
import { record as recordAudit } from './auditLog.service.js';
import type {
  CreateChallengeInput,
  UpdateChallengeInput,
  ListChallengesQuery,
} from '../validators/challenge.schema.js';
import { UPLOAD_DIR } from '../config/uploads.js';

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'challenge';
  let candidate = base;
  let suffix = 2;
  while (await Challenge.exists({ slug: candidate })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export interface ChallengeListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  points: number;
  solves: number;
  published: boolean;
  solved: boolean;
  // True when this challenge has a prerequisite the viewer hasn't solved
  // yet. Always false for admins. Still listed (not filtered out) so it's
  // discoverable as a goal — only the detail view actually gates content.
  locked: boolean;
  createdAt: Date;
}

function toListItem(doc: ChallengeDoc, solvedIds: Set<string>, isAdmin: boolean): ChallengeListItem {
  const locked = !isAdmin && !!doc.prerequisite && !solvedIds.has(String(doc.prerequisite));
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    difficulty: doc.difficulty,
    points: doc.points,
    solves: doc.solves,
    published: doc.published,
    solved: solvedIds.has(doc.id),
    locked,
    createdAt: doc.createdAt,
  };
}

async function getSolvedIdSet(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const user = await User.findById(userId).select('solvedChallenges.challenge').lean();
  if (!user) return new Set();
  return new Set(user.solvedChallenges.map((s) => s.challenge.toString()));
}

const SORTS: Record<ListChallengesQuery['sort'], Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  'points-asc': { points: 1, createdAt: -1 },
  'points-desc': { points: -1, createdAt: -1 },
  solves: { solves: -1, createdAt: -1 },
};

export interface ListChallengesResult {
  challenges: ChallengeListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listChallenges(
  opts: { userId?: string; includeUnpublished: boolean } & ListChallengesQuery,
): Promise<ListChallengesResult> {
  const filter: Record<string, unknown> = opts.includeUnpublished ? {} : { published: true };

  if (opts.category) filter.category = opts.category;
  if (opts.difficulty) filter.difficulty = opts.difficulty;
  if (opts.minPoints !== undefined || opts.maxPoints !== undefined) {
    filter.points = {
      ...(opts.minPoints !== undefined ? { $gte: opts.minPoints } : {}),
      ...(opts.maxPoints !== undefined ? { $lte: opts.maxPoints } : {}),
    };
  }
  if (opts.search) {
    // Escape regex metacharacters — this is a plain substring search, not
    // a place for a client to inject an expensive or malformed pattern.
    const escaped = opts.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  // The solved/unsolved filter depends on per-user data that doesn't live
  // on the Challenge document, so it's resolved to a concrete _id filter
  // before the main query rather than being a native Mongo field match.
  const solvedIds = await getSolvedIdSet(opts.userId);
  if (opts.solved === 'solved') {
    filter._id = { $in: [...solvedIds].map((id) => new Types.ObjectId(id)) };
  } else if (opts.solved === 'unsolved') {
    filter._id = { $nin: [...solvedIds].map((id) => new Types.ObjectId(id)) };
  }

  const skip = (opts.page - 1) * opts.limit;
  const [docs, total] = await Promise.all([
    Challenge.find(filter).sort(SORTS[opts.sort]).skip(skip).limit(opts.limit),
    Challenge.countDocuments(filter),
  ]);

  return {
    challenges: docs.map((doc) => toListItem(doc, solvedIds, opts.includeUnpublished)),
    pagination: { page: opts.page, limit: opts.limit, total, totalPages: Math.max(1, Math.ceil(total / opts.limit)) },
  };
}

export interface HintPublicDto {
  id: string;
  title: string;
  cost: number;
  order: number;
  unlocked: boolean;
  content: string | null;
}

export interface FirstBloodDto {
  username: string;
  solvedAt: Date;
}

export interface ChallengeDetailDto extends ChallengeListItem {
  description: string;
  flagFormat: string;
  author: string;
  files: { id: string; filename: string; size: number; mimeType: string }[];
  hints: HintPublicDto[];
  firstBlood: FirstBloodDto | null;
  unlockRequirement: { title: string; slug: string } | null;
}

async function getFirstBlood(challengeId: unknown): Promise<FirstBloodDto | null> {
  const first = await Submission.findOne({ challenge: challengeId as Types.ObjectId, correct: true })
    .sort({ createdAt: 1 })
    .populate('user', 'username');
  if (!first) return null;
  const doc = first as unknown as { user: { username: string } | null; createdAt: Date };
  if (!doc.user) return null; // solver account was since deleted — nothing to show
  return { username: doc.user.username, solvedAt: doc.createdAt };
}

export async function getChallengeBySlug(
  slug: string,
  opts: { userId?: string; isAdmin: boolean },
): Promise<ChallengeDetailDto> {
  const doc = await Challenge.findOne({ slug }).populate('author', 'username');
  if (!doc || (!doc.published && !opts.isAdmin)) {
    throw AppError.notFound('Challenge not found.');
  }
  const author = doc.author as unknown as { username: string };
  const solvedIds = await getSolvedIdSet(opts.userId);
  const listItem = toListItem(doc, solvedIds, opts.isAdmin);

  if (listItem.locked) {
    // Teaser only — the whole point of a locked challenge is that its
    // content isn't available yet, same gating principle already used for
    // unpublished challenges (404) and locked hint content (null).
    const prereq = await Challenge.findById(doc.prerequisite).select('title slug');
    return {
      ...listItem,
      description: '',
      flagFormat: '',
      author: author.username,
      files: [],
      hints: [],
      firstBlood: null,
      unlockRequirement: prereq ? { title: prereq.title, slug: prereq.slug } : null,
    };
  }

  const [hints, unlockedHintIds, firstBlood] = await Promise.all([
    Hint.find({ challenge: doc._id, active: true }).sort({ order: 1 }),
    opts.userId ? User.findById(opts.userId).select('unlockedHints').lean() : null,
    doc.solves > 0 ? getFirstBlood(doc._id) : Promise.resolve(null),
  ]);

  const unlockedSet = new Set((unlockedHintIds?.unlockedHints ?? []).map((id) => id.toString()));

  return {
    ...listItem,
    description: doc.description,
    flagFormat: doc.flagFormat,
    author: author.username,
    files: doc.files.map((f) => ({ id: f._id.toString(), filename: f.filename, size: f.size, mimeType: f.mimeType })),
    hints: hints.map((hint) => {
      const unlocked = opts.isAdmin || hint.cost === 0 || unlockedSet.has(hint.id);
      return {
        id: hint.id,
        title: hint.title,
        cost: hint.cost,
        order: hint.order,
        unlocked,
        content: unlocked ? hint.content : null,
      };
    }),
    firstBlood,
    unlockRequirement: null,
  };
}

export async function getChallengeByIdForAdmin(id: string) {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findById(id).populate('author', 'username');
  if (!doc) throw AppError.notFound('Challenge not found.');
  const author = doc.author as unknown as { username: string };
  const [hints, firstBlood, prereq] = await Promise.all([
    Hint.find({ challenge: doc._id }).sort({ order: 1 }),
    doc.solves > 0 ? getFirstBlood(doc._id) : Promise.resolve(null),
    doc.prerequisite ? Challenge.findById(doc.prerequisite).select('title') : Promise.resolve(null),
  ]);
  return {
    ...toListItem(doc, new Set(), true),
    description: doc.description,
    flagFormat: doc.flagFormat,
    author: author.username,
    files: doc.files.map((f) => ({ id: f._id.toString(), filename: f.filename, size: f.size, mimeType: f.mimeType })),
    hints: hints.map((h) => ({
      id: h.id,
      title: h.title,
      content: h.content,
      cost: h.cost,
      order: h.order,
      active: h.active,
    })),
    firstBlood,
    unlockRequirement: null,
    prerequisiteId: doc.prerequisite ? String(doc.prerequisite) : null,
    prerequisiteTitle: prereq?.title ?? null,
  };
}

/**
 * Prerequisite chains are deliberately capped at depth 1 (a challenge with
 * a prerequisite can't itself be required by anything, and vice versa) —
 * avoids needing general cycle detection for a feature where a 2+ level
 * chain adds little real value over a single gate.
 */
async function validatePrerequisite(prerequisiteId: string | null | undefined, selfId?: string): Promise<void> {
  if (!prerequisiteId) return;
  if (selfId && prerequisiteId === selfId) {
    throw AppError.validation('A challenge cannot require itself.');
  }
  const prereq = await Challenge.findById(prerequisiteId).select('published prerequisite');
  if (!prereq) throw AppError.validation('Prerequisite challenge not found.');
  if (!prereq.published) throw AppError.validation('Prerequisite challenge must be published.');
  if (prereq.prerequisite) {
    throw AppError.validation('That challenge already has a prerequisite of its own and cannot be chained further.');
  }
  if (selfId) {
    const dependent = await Challenge.exists({ prerequisite: selfId });
    if (dependent) {
      throw AppError.validation(
        'This challenge is already a prerequisite for another challenge, so it cannot have one of its own.',
      );
    }
  }
}

export async function createChallenge(authorId: string, input: CreateChallengeInput) {
  await validatePrerequisite(input.prerequisite);
  const slug = await generateUniqueSlug(input.title);
  const flagHash = await hashFlag(input.flag);

  const doc = await Challenge.create({
    title: input.title,
    slug,
    description: input.description,
    category: input.category,
    difficulty: input.difficulty,
    points: input.points,
    flagHash,
    flagFormat: input.flagFormat,
    published: input.published,
    author: authorId,
    prerequisite: input.prerequisite ?? null,
  });

  if (input.hints.length > 0) {
    await Hint.insertMany(input.hints.map((h) => ({ ...h, challenge: doc._id })));
  }

  await recordAudit(authorId, 'ADMIN', 'ADMIN_CREATED_CHALLENGE', 'challenge', doc.id);

  return getChallengeByIdForAdmin(doc.id);
}

export async function updateChallenge(actorId: string, id: string, input: UpdateChallengeInput) {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findById(id);
  if (!doc) throw AppError.notFound('Challenge not found.');

  if (input.prerequisite !== undefined) await validatePrerequisite(input.prerequisite, id);

  if (input.title !== undefined) doc.title = input.title;
  if (input.description !== undefined) doc.description = input.description;
  if (input.category !== undefined) doc.category = input.category;
  if (input.difficulty !== undefined) doc.difficulty = input.difficulty;
  if (input.points !== undefined) doc.points = input.points;
  if (input.flagFormat !== undefined) doc.flagFormat = input.flagFormat;
  if (input.published !== undefined) doc.published = input.published;
  // null explicitly clears the prerequisite; undefined leaves it as-is.
  if (input.prerequisite !== undefined) doc.prerequisite = input.prerequisite as unknown as typeof doc.prerequisite;
  // Admin never needs to read the current flag back — they can only ever
  // overwrite it, never retrieve it.
  if (input.flag) doc.flagHash = await hashFlag(input.flag);

  await doc.save();

  if (input.hints !== undefined) {
    await Hint.deleteMany({ challenge: doc._id });
    if (input.hints.length > 0) {
      await Hint.insertMany(input.hints.map((h) => ({ ...h, challenge: doc._id })));
    }
  }

  await recordAudit(actorId, 'ADMIN', 'ADMIN_UPDATED_CHALLENGE', 'challenge', doc.id);

  return getChallengeByIdForAdmin(doc.id);
}

export async function setPublished(actorId: string, id: string, published: boolean) {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findByIdAndUpdate(id, { published }, { returnDocument: 'after' });
  if (!doc) throw AppError.notFound('Challenge not found.');
  await recordAudit(actorId, 'ADMIN', published ? 'ADMIN_PUBLISHED_CHALLENGE' : 'ADMIN_UNPUBLISHED_CHALLENGE', 'challenge', doc.id);
  return getChallengeByIdForAdmin(doc.id);
}

export async function deleteChallenge(actorId: string, id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findById(id);
  if (!doc) throw AppError.notFound('Challenge not found.');

  // Submissions are intentionally left in place as an audit trail (see
  // README "Deletion strategy") — only the challenge itself and its hints
  // are removed, which is what "orphaned records" refers to here.
  await Promise.all([
    Hint.deleteMany({ challenge: doc._id }),
    ...doc.files.map((f) =>
      unlink(path.join(UPLOAD_DIR, path.basename(f.storageKey))).catch(() => {
        // File already missing on disk — nothing to clean up.
      }),
    ),
  ]);

  await doc.deleteOne();
  await recordAudit(actorId, 'ADMIN', 'ADMIN_DELETED_CHALLENGE', 'challenge', id);
}

export async function addChallengeFile(
  challengeId: string,
  file: { filename: string; storageKey: string; size: number; mimeType: string },
) {
  if (!Types.ObjectId.isValid(challengeId)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findByIdAndUpdate(
    challengeId,
    { $push: { files: file } },
    { returnDocument: 'after' },
  );
  if (!doc) throw AppError.notFound('Challenge not found.');
  const added = doc.files[doc.files.length - 1];
  // Shaped to `id` like every other file DTO in this file (toListItem's
  // `files.map(...)`) — a raw subdocument's JSON form only has `_id`, which
  // would be the one inconsistent response shape in this API.
  return { id: added._id.toString(), filename: added.filename, size: added.size, mimeType: added.mimeType };
}

export async function unlockHint(
  userId: string,
  challengeId: string,
  hintId: string,
  opts: { isAdmin: boolean } = { isAdmin: false },
): Promise<{ content: string }> {
  if (!Types.ObjectId.isValid(hintId)) throw AppError.notFound('Hint not found.');
  const hint = await Hint.findOne({ _id: hintId, challenge: challengeId, active: true });
  if (!hint) throw AppError.notFound('Hint not found.');

  const user = await User.findById(userId);
  if (!user) throw AppError.unauthorized();

  const alreadyUnlocked = user.unlockedHints.some((id) => id.toString() === hintId);
  if (alreadyUnlocked || opts.isAdmin) {
    return { content: hint.content };
  }

  if (user.points < hint.cost) {
    throw AppError.validation('Not enough points to unlock this hint.');
  }

  user.points -= hint.cost;
  user.unlockedHints.push(hint._id);
  await user.save();

  return { content: hint.content };
}

export async function getChallengeFile(
  challengeId: string,
  fileId: string,
  opts: { isAdmin: boolean },
) {
  const doc = await Challenge.findById(challengeId);
  if (!doc || (!doc.published && !opts.isAdmin)) {
    throw AppError.notFound('Challenge not found.');
  }
  const file = doc.files.find((f) => f._id.toString() === fileId);
  if (!file) throw AppError.notFound('File not found.');
  return file;
}
