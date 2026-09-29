import type { Team } from '@/types';
import { mockTeams } from '@/features/teams/data/mockTeams';
import { mockDelay } from '@/lib/mockDelay';

export const teamService = {
  async list(): Promise<Team[]> {
    return mockDelay(mockTeams, 500);
  },

  async getMine(): Promise<Team | null> {
    return mockDelay(mockTeams.find((t) => t.isMine) ?? null, 400);
  },
};
