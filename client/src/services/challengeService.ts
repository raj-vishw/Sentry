import type { Category, Challenge, Difficulty, Hint } from '@/types';
import { apiClient } from '@/lib/apiClient';

interface BackendHint {
  id: string;
  title: string;
  cost: number;
  order: number;
  unlocked: boolean;
  content: string | null;
}

interface BackendChallengeListItem {
  id: string;
  title: string;
  slug: string;
  category: Category;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
  points: number;
  solves: number;
  published: boolean;
  solved: boolean;
  createdAt: string;
}

interface BackendChallengeDetail extends BackendChallengeListItem {
  description: string;
  flagFormat: string;
  author: string;
  files: { id: string; filename: string; size: number; mimeType: string }[];
  hints: BackendHint[];
}

export const DIFFICULTY_TO_FRONTEND: Record<BackendChallengeListItem['difficulty'], Difficulty> = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  INSANE: 'insane',
};
export const DIFFICULTY_TO_BACKEND: Record<Difficulty, BackendChallengeListItem['difficulty']> = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
  insane: 'INSANE',
};

function toFrontendHint(hint: BackendHint): Hint {
  return {
    id: hint.id,
    title: hint.title,
    cost: hint.cost,
    content: hint.content,
    unlocked: hint.unlocked,
  };
}

function toFrontendSummary(item: BackendChallengeListItem): Challenge {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    difficulty: DIFFICULTY_TO_FRONTEND[item.difficulty],
    points: item.points,
    // Not returned by the list endpoint — only ever read from the detail
    // fetch. Kept here only so `Challenge` has one consistent shape.
    description: '',
    solveCount: item.solves,
    solved: item.solved,
    author: '',
    files: [],
    hints: [],
    tags: [],
    published: item.published,
    createdAt: item.createdAt,
  };
}

function toFrontendDetail(item: BackendChallengeDetail): Challenge {
  return {
    ...toFrontendSummary(item),
    description: item.description,
    author: item.author,
    files: item.files.map((f) => ({
      id: f.id,
      name: f.filename,
      sizeKb: Math.max(1, Math.round(f.size / 1024)),
      url: `/api/v1/challenges/${item.id}/files/${f.id}/download`,
    })),
    hints: item.hints.map(toFrontendHint),
  };
}

export const challengeService = {
  async list(): Promise<Challenge[]> {
    const { challenges } = await apiClient.get<{ challenges: BackendChallengeListItem[] }>('/challenges');
    return challenges.map(toFrontendSummary);
  },

  async getBySlug(slug: string): Promise<Challenge | null> {
    try {
      const { challenge } = await apiClient.get<{ challenge: BackendChallengeDetail }>(`/challenges/${slug}`);
      return toFrontendDetail(challenge);
    } catch {
      return null;
    }
  },

  async submitFlag(
    challengeId: string,
    flag: string,
  ): Promise<{ correct: boolean; alreadySolved: boolean; message: string; pointsAwarded: number }> {
    return apiClient.post(`/challenges/${challengeId}/submit`, { flag });
  },

  async unlockHint(challengeId: string, hintId: string): Promise<{ content: string }> {
    return apiClient.post(`/challenges/${challengeId}/hints/${hintId}/unlock`);
  },

  /**
   * Challenge file downloads require the Bearer token, which a plain
   * `<a href>` click can't send — this fetches the bytes authenticated and
   * triggers the save via a throwaway object URL instead.
   */
  async downloadFile(challengeId: string, fileId: string, filename: string): Promise<void> {
    const blob = await apiClient.getBlob(`/challenges/${challengeId}/files/${fileId}/download`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
