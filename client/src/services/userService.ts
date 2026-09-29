import type { CategoryProgress, RecentSolve } from '@/types';
import {
  mockCategoryProgress,
  mockRecentSolves,
  mockDashboardSummary,
} from '@/features/dashboard/data/mockDashboard';
import { mockDelay } from '@/lib/mockDelay';

export const userService = {
  async getDashboardSummary() {
    return mockDelay(mockDashboardSummary, 400);
  },

  async getCategoryProgress(): Promise<CategoryProgress[]> {
    return mockDelay(mockCategoryProgress, 450);
  },

  async getRecentSolves(): Promise<RecentSolve[]> {
    return mockDelay(mockRecentSolves, 450);
  },
};
