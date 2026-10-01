import type { AuthCredentials, RegisterPayload, User } from '@/types';
import { apiClient } from '@/lib/apiClient';

interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar: string | null;
  bio: string;
  points: number;
  rank: number;
  solvedCount: number;
  streak: number;
  teamId: string | null;
  teamName: string | null;
  createdAt: string;
}

function toFrontendUser(user: BackendUser): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role === 'ADMIN' ? 'admin' : 'user',
    avatarUrl: user.avatar ?? undefined,
    xp: user.points,
    rank: user.rank,
    solvedCount: user.solvedCount,
    streak: user.streak,
    teamId: user.teamId,
    teamName: user.teamName,
    createdAt: user.createdAt,
  };
}

interface AuthResponse {
  user: BackendUser;
  accessToken: string;
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return { user: toFrontendUser(res.user), token: res.accessToken };
  },

  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return { user: toFrontendUser(res.user), token: res.accessToken };
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Called once on app boot. The HttpOnly refresh cookie (if any) is sent
   * automatically; a successful response means there's a valid prior
   * session to restore. Failure just means "not logged in" — never thrown
   * as an error the UI needs to react to.
   */
  async restoreSession(): Promise<{ user: User; token: string } | null> {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/refresh');
      return { user: toFrontendUser(res.user), token: res.accessToken };
    } catch {
      return null;
    }
  },
};
