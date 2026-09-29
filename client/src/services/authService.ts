import type { AuthCredentials, RegisterPayload, User } from '@/types';
import { mockDelay } from '@/lib/mockDelay';

/**
 * Mock auth service. Phase 2 replaces every function body with a real
 * HTTP call (e.g. fetch/axios against the Express API) — call signatures
 * and return shapes are designed to stay stable across that swap.
 */
function buildMockUser(identifier: string): User {
  const username = identifier.includes('@') ? identifier.split('@')[0] : identifier;
  return {
    id: crypto.randomUUID(),
    username,
    email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
    // Phase 1 demo convenience: signing in with an identifier starting with
    // "admin" previews the admin UI. Phase 2 replaces this with a real role
    // returned by the backend.
    role: username.toLowerCase().startsWith('admin') ? 'admin' : 'user',
    xp: 1240,
    rank: 42,
    solvedCount: 18,
    streak: 4,
    createdAt: new Date().toISOString(),
  };
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
    if (!credentials.identifier || !credentials.password) {
      throw new Error('Identifier and authorization key are required.');
    }
    const user = buildMockUser(credentials.identifier);
    return mockDelay({ user, token: `mock.${user.id}` }, 700);
  },

  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    if (payload.password !== payload.confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    const user = buildMockUser(payload.username);
    user.email = payload.email;
    return mockDelay({ user, token: `mock.${user.id}` }, 900);
  },

  async logout(): Promise<void> {
    return mockDelay(undefined, 200);
  },
};
