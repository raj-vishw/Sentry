import type { AdminMetrics, Submission } from '@/types';
import {
  mockAdminMetrics,
  mockSubmissionTrend,
  mockCategoryDistribution,
  mockRecentSubmissions,
} from '@/features/admin/data/mockAdmin';
import { mockAdminUsers, type AdminUserRow } from '@/features/admin/data/mockAdminUsers';
import { mockAllSubmissions } from '@/features/admin/data/mockAllSubmissions';
import { mockTeams } from '@/features/teams/data/mockTeams';
import { mockChallenges } from '@/features/challenges/data/mockChallenges';
import { mockDelay } from '@/lib/mockDelay';

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
    return mockDelay(mockTeams, 500);
  },

  async getChallenges() {
    return mockDelay(mockChallenges, 500);
  },
};
