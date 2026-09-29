import type { LeaderboardEntry } from '@/types';
import { mockLeaderboardFull } from '@/features/leaderboard/data/mockLeaderboard';
import { mockDelay } from '@/lib/mockDelay';

export type LeaderboardScope = 'global' | 'weekly' | 'monthly';

export const leaderboardService = {
  async getLeaderboard(_scope: LeaderboardScope = 'global'): Promise<LeaderboardEntry[]> {
    return mockDelay(mockLeaderboardFull, 500);
  },
};
