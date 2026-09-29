import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { CATEGORY_SLUGS } from './Category.js';

export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'INSANE'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

const challengeFileSchema = new Schema(
  {
    filename: { type: String, required: true },
    storageKey: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: true, timestamps: false },
);

const challengeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    // Stored as the stable category slug (not an ObjectId ref) so listing,
    // filtering, and grouping never need a join — Category is still its
    // own collection for admin-managed display metadata (name/description/
    // icon), keyed by this same slug.
    category: { type: String, enum: CATEGORY_SLUGS, required: true },
    difficulty: { type: String, enum: DIFFICULTIES, required: true },
    points: { type: Number, required: true, min: 0 },
    // Never selected by default — only the flag-verification code path
    // should ever pull this field, and it's dropped from every response.
    flagHash: { type: String, required: true, select: false },
    flagFormat: { type: String, default: 'CTF{...}' },
    files: { type: [challengeFileSchema], default: [] },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    solves: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

challengeSchema.index({ category: 1 });
challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ published: 1 });

export type ChallengeDoc = HydratedDocument<InferSchemaType<typeof challengeSchema>>;

export const Challenge = model('Challenge', challengeSchema);
