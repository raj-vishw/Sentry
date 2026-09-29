import type { CategoryProgress, RecentSolve, User } from '@/types';
import { apiClient } from '@/lib/apiClient';

interface BackendProfileResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    avatar: string | null;
    bio: string;
    points: number;
    rank: number;
    solvedCount: number;
    createdAt: string;
  };
  recentSolves: { challengeId: string; title: string; category: string; points: number; solvedAt: string }[];
  categoryProgress: CategoryProgress[];
}

export interface ProfileDetail {
  user: User;
  recentSolves: RecentSolve[];
  categoryProgress: CategoryProgress[];
}

export const userService = {
  /** Single source of truth for the dashboard and profile pages alike. */
  async getProfile(): Promise<ProfileDetail> {
    const res = await apiClient.get<BackendProfileResponse>('/users/me');
    return {
      user: {
        id: res.user.id,
        username: res.user.username,
        email: res.user.email,
        role: res.user.role === 'ADMIN' ? 'admin' : 'user',
        avatarUrl: res.user.avatar ?? undefined,
        xp: res.user.points,
        rank: res.user.rank,
        solvedCount: res.user.solvedCount,
        streak: 0,
        createdAt: res.user.createdAt,
      },
      recentSolves: res.recentSolves.map((s) => ({
        id: s.challengeId,
        challengeTitle: s.title,
        category: s.category as RecentSolve['category'],
        points: s.points,
        solvedAt: s.solvedAt,
      })),
      categoryProgress: res.categoryProgress,
    };
  },

  async updateProfile(input: { bio?: string; avatar?: string | null }): Promise<User> {
    const { user } = await apiClient.patch<{ user: BackendProfileResponse['user'] }>('/users/me', input);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role === 'ADMIN' ? 'admin' : 'user',
      avatarUrl: user.avatar ?? undefined,
      xp: user.points,
      rank: user.rank,
      solvedCount: user.solvedCount,
      streak: 0,
      createdAt: user.createdAt,
    };
  },
};
