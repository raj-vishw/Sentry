import { Types } from 'mongoose';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { Challenge, type ChallengeDoc } from '../models/Challenge.js';
import { Hint } from '../models/Hint.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { hashFlag } from '../utils/flag.js';
import { slugify } from '../utils/slug.js';
import type { CreateChallengeInput, UpdateChallengeInput } from '../validators/challenge.schema.js';
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
  createdAt: Date;
}

function toListItem(doc: ChallengeDoc, solvedIds: Set<string>): ChallengeListItem {
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
    createdAt: doc.createdAt,
  };
}

async function getSolvedIdSet(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const user = await User.findById(userId).select('solvedChallenges.challenge').lean();
  if (!user) return new Set();
  return new Set(user.solvedChallenges.map((s) => s.challenge.toString()));
}

export async function listChallenges(opts: { userId?: string; includeUnpublished: boolean }) {
  const filter = opts.includeUnpublished ? {} : { published: true };
  const [docs, solvedIds] = await Promise.all([
    Challenge.find(filter).sort({ createdAt: -1 }),
    getSolvedIdSet(opts.userId),
  ]);
  return docs.map((doc) => toListItem(doc, solvedIds));
}

export interface HintPublicDto {
  id: string;
  title: string;
  cost: number;
  order: number;
  unlocked: boolean;
  content: string | null;
}

export interface ChallengeDetailDto extends ChallengeListItem {
  description: string;
  flagFormat: string;
  author: string;
  files: { id: string; filename: string; size: number; mimeType: string }[];
  hints: HintPublicDto[];
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

  const [solvedIds, hints, unlockedHintIds] = await Promise.all([
    getSolvedIdSet(opts.userId),
    Hint.find({ challenge: doc._id, active: true }).sort({ order: 1 }),
    opts.userId ? User.findById(opts.userId).select('unlockedHints').lean() : null,
  ]);

  const unlockedSet = new Set((unlockedHintIds?.unlockedHints ?? []).map((id) => id.toString()));

  return {
    ...toListItem(doc, solvedIds),
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
  };
}

export async function getChallengeByIdForAdmin(id: string) {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findById(id).populate('author', 'username');
  if (!doc) throw AppError.notFound('Challenge not found.');
  const author = doc.author as unknown as { username: string };
  const hints = await Hint.find({ challenge: doc._id }).sort({ order: 1 });
  return {
    ...toListItem(doc, new Set()),
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
  };
}

export async function createChallenge(authorId: string, input: CreateChallengeInput) {
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
  });

  if (input.hints.length > 0) {
    await Hint.insertMany(input.hints.map((h) => ({ ...h, challenge: doc._id })));
  }

  return getChallengeByIdForAdmin(doc.id);
}

export async function updateChallenge(id: string, input: UpdateChallengeInput) {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findById(id);
  if (!doc) throw AppError.notFound('Challenge not found.');

  if (input.title !== undefined) doc.title = input.title;
  if (input.description !== undefined) doc.description = input.description;
  if (input.category !== undefined) doc.category = input.category;
  if (input.difficulty !== undefined) doc.difficulty = input.difficulty;
  if (input.points !== undefined) doc.points = input.points;
  if (input.flagFormat !== undefined) doc.flagFormat = input.flagFormat;
  if (input.published !== undefined) doc.published = input.published;
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

  return getChallengeByIdForAdmin(doc.id);
}

export async function setPublished(id: string, published: boolean) {
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound('Challenge not found.');
  const doc = await Challenge.findByIdAndUpdate(id, { published }, { returnDocument: 'after' });
  if (!doc) throw AppError.notFound('Challenge not found.');
  return getChallengeByIdForAdmin(doc.id);
}

export async function deleteChallenge(id: string): Promise<void> {
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
  return doc.files[doc.files.length - 1];
}

export async function unlockHint(
  userId: string,
  challengeId: string,
  hintId: string,
): Promise<{ content: string }> {
  if (!Types.ObjectId.isValid(hintId)) throw AppError.notFound('Hint not found.');
  const hint = await Hint.findOne({ _id: hintId, challenge: challengeId, active: true });
  if (!hint) throw AppError.notFound('Hint not found.');

  const user = await User.findById(userId);
  if (!user) throw AppError.unauthorized();

  const alreadyUnlocked = user.unlockedHints.some((id) => id.toString() === hintId);
  if (alreadyUnlocked) {
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

export async function getChallengeFile(challengeId: string, fileId: string) {
  const doc = await Challenge.findById(challengeId);
  if (!doc) throw AppError.notFound('Challenge not found.');
  const file = doc.files.find((f) => f._id.toString() === fileId);
  if (!file) throw AppError.notFound('File not found.');
  return file;
}
