import type { Challenge } from '@/types';
import { mockChallenges } from '@/features/challenges/data/mockChallenges';
import { mockDelay } from '@/lib/mockDelay';

export const challengeService = {
  async list(): Promise<Challenge[]> {
    return mockDelay(mockChallenges, 500);
  },

  async getBySlug(slug: string): Promise<Challenge | null> {
    return mockDelay(mockChallenges.find((c) => c.slug === slug) ?? null, 400);
  },

  /**
   * Mock-only flag check. Phase 2 posts the flag to the backend for
   * server-side validation instead of comparing client-side.
   */
  async submitFlag(_challengeId: string, flag: string): Promise<{ correct: boolean }> {
    const correct = flag.trim().toLowerCase().startsWith('flag{');
    return mockDelay({ correct }, 600);
  },
};
