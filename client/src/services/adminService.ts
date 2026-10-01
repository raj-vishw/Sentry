import type { AdminMetrics, Category, Challenge, Difficulty, Submission } from '@/types';
import {
  mockAdminMetrics,
  mockSubmissionTrend,
  mockCategoryDistribution,
  mockRecentSubmissions,
} from '@/features/admin/data/mockAdmin';
import { mockAdminUsers, type AdminUserRow } from '@/features/admin/data/mockAdminUsers';
import { mockAllSubmissions } from '@/features/admin/data/mockAllSubmissions';
import { mockDelay } from '@/lib/mockDelay';
import { apiClient } from '@/lib/apiClient';
import { challengeService, DIFFICULTY_TO_FRONTEND, DIFFICULTY_TO_BACKEND } from './challengeService';
import { teamService } from './teamService';

export interface AdminHintInput {
  id?: string;
  title: string;
  content: string;
  cost: number;
  order: number;
  active: boolean;
}

export interface AdminChallengeInput {
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  /** Omit (or leave blank) on update to leave the existing flag untouched. */
  flag?: string;
  flagFormat: string;
  published: boolean;
  hints: AdminHintInput[];
}

/** The admin edit form's view of a challenge — full hint content, no flag. */
export interface AdminChallengeDetail {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  flagFormat: string;
  published: boolean;
  hints: AdminHintInput[];
}

interface BackendAdminHint {
  id: string;
  title: string;
  content: string;
  cost: number;
  order: number;
  active: boolean;
}

interface BackendAdminChallengeDetail {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
  points: number;
  flagFormat: string;
  published: boolean;
  hints: BackendAdminHint[];
}

function toAdminDetail(raw: BackendAdminChallengeDetail): AdminChallengeDetail {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    difficulty: DIFFICULTY_TO_FRONTEND[raw.difficulty],
    points: raw.points,
    flagFormat: raw.flagFormat,
    published: raw.published,
    hints: raw.hints.map((h) => ({
      id: h.id,
      title: h.title,
      content: h.content,
      cost: h.cost,
      order: h.order,
      active: h.active,
    })),
  };
}

function toBackendPayload(input: AdminChallengeInput) {
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    difficulty: DIFFICULTY_TO_BACKEND[input.difficulty],
    points: input.points,
    ...(input.flag ? { flag: input.flag } : {}),
    flagFormat: input.flagFormat,
    published: input.published,
    hints: input.hints.map(({ title, content, cost, order, active }) => ({ title, content, cost, order, active })),
  };
}

export const adminService = {
  async getMetrics(): Promise<AdminMetrics> {
    return mockDelay(mockAdminMetrics, 400);
  },

  async getSubmissionTrend() {
    return mockDelay(mockSubmissionTrend, 450);
  },

  async getCategoryDistribution() {
    return mockDelay(mockCategoryDistribution, 450);
  },

  async getRecentSubmissions(): Promise<Submission[]> {
    return mockDelay(mockRecentSubmissions, 400);
  },

  async getAllSubmissions(): Promise<Submission[]> {
    return mockDelay(mockAllSubmissions, 500);
  },

  async getUsers(): Promise<AdminUserRow[]> {
    return mockDelay(mockAdminUsers, 500);
  },

  async getTeams() {
    const { teams } = await teamService.list(1, 100);
    return teams;
  },

  // --- Challenge management: wired to the real Phase 2 backend ---

  /** Admins see unpublished challenges too via the same public list endpoint. */
  async getChallenges(): Promise<Challenge[]> {
    const { challenges } = await challengeService.list({ limit: 100 });
    return challenges;
  },

  async getChallengeById(id: string): Promise<AdminChallengeDetail> {
    const { challenge } = await apiClient.get<{ challenge: BackendAdminChallengeDetail }>(`/admin/challenges/${id}`);
    return toAdminDetail(challenge);
  },

  async createChallenge(input: AdminChallengeInput): Promise<AdminChallengeDetail> {
    const { challenge } = await apiClient.post<{ challenge: BackendAdminChallengeDetail }>(
      '/admin/challenges',
      toBackendPayload(input),
    );
    return toAdminDetail(challenge);
  },

  async updateChallenge(id: string, input: AdminChallengeInput): Promise<AdminChallengeDetail> {
    const { challenge } = await apiClient.patch<{ challenge: BackendAdminChallengeDetail }>(
      `/admin/challenges/${id}`,
      toBackendPayload(input),
    );
    return toAdminDetail(challenge);
  },

  async deleteChallenge(id: string): Promise<void> {
    await apiClient.delete(`/admin/challenges/${id}`);
  },

  async setPublished(id: string, published: boolean): Promise<void> {
    await apiClient.post(`/admin/challenges/${id}/${published ? 'publish' : 'unpublish'}`);
  },

  async uploadChallengeFile(id: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await apiClient.postForm(`/admin/challenges/${id}/files`, form);
  },
};
