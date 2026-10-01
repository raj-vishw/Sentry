import { z } from 'zod';
import { DIFFICULTIES } from '../models/Challenge.js';
import { CATEGORY_SLUGS } from '../models/Category.js';

const hintInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1),
  cost: z.coerce.number().int().min(0).default(0),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

// Mongo ObjectIds are 24 hex chars — validated as a shape here; whether it
// actually references a real, eligible challenge is checked in the service
// layer (needs a DB query, not just a regex).
const objectIdString = z.string().trim().regex(/^[a-f0-9]{24}$/i, 'Invalid id.');

export const createChallengeSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.'),
  category: z.enum(CATEGORY_SLUGS, { message: 'Select a valid category.' }),
  difficulty: z.enum(DIFFICULTIES, { message: 'Select a valid difficulty.' }),
  points: z.coerce.number().int().min(0).max(10000),
  flag: z.string().trim().min(3, 'Flag must be at least 3 characters.'),
  flagFormat: z.string().trim().max(60).default('CTF{...}'),
  published: z.boolean().default(false),
  hints: z.array(hintInputSchema).default([]),
  prerequisite: objectIdString.nullable().optional(),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;

export const updateChallengeSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).optional(),
  category: z.enum(CATEGORY_SLUGS).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  points: z.coerce.number().int().min(0).max(10000).optional(),
  // Omit or send an empty string to leave the existing flag untouched —
  // the admin never needs to fetch/see the current flag to edit a challenge.
  flag: z.string().trim().min(3).optional(),
  flagFormat: z.string().trim().max(60).optional(),
  published: z.boolean().optional(),
  hints: z.array(hintInputSchema).optional(),
  // null explicitly clears an existing prerequisite; omit to leave as-is.
  prerequisite: objectIdString.nullable().optional(),
});

export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;

export const listChallengesQuerySchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    category: z.enum(CATEGORY_SLUGS).optional(),
    difficulty: z.enum(DIFFICULTIES).optional(),
    solved: z.enum(['solved', 'unsolved']).optional(),
    minPoints: z.coerce.number().int().min(0).optional(),
    maxPoints: z.coerce.number().int().min(0).optional(),
    sort: z.enum(['newest', 'points-asc', 'points-desc', 'solves']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    // Capped well below anything a client could use to pull the whole table
    // in one request — see "reasonable maximum limits".
    limit: z.coerce.number().int().min(1).max(100).default(12),
  })
  .refine((data) => data.minPoints === undefined || data.maxPoints === undefined || data.minPoints <= data.maxPoints, {
    message: 'minPoints must be less than or equal to maxPoints.',
    path: ['minPoints'],
  });

export type ListChallengesQuery = z.infer<typeof listChallengesQuerySchema>;
