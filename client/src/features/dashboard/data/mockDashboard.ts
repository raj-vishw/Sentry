import type { CategoryProgress, RecentSolve } from '@/types';

export const mockCategoryProgress: CategoryProgress[] = [
  { category: 'web', solved: 11, total: 16 },
  { category: 'crypto', solved: 6, total: 12 },
  { category: 'forensics', solved: 4, total: 11 },
  { category: 'reverse', solved: 2, total: 10 },
  { category: 'pwn', solved: 1, total: 9 },
  { category: 'osint', solved: 5, total: 10 },
  { category: 'cloud', solved: 3, total: 9 },
  { category: 'mobile', solved: 1, total: 9 },
];

export const mockRecentSolves: RecentSolve[] = [
  { id: 'r1', challengeTitle: 'Shadow Login', category: 'web', points: 300, solvedAt: '2026-09-28T14:20:00Z' },
  { id: 'r2', challengeTitle: 'Memory Trace', category: 'forensics', points: 150, solvedAt: '2026-09-27T09:05:00Z' },
  { id: 'r3', challengeTitle: 'Digital Footprint', category: 'osint', points: 100, solvedAt: '2026-09-25T18:44:00Z' },
  { id: 'r4', challengeTitle: 'Echo Chamber', category: 'crypto', points: 125, solvedAt: '2026-09-22T11:12:00Z' },
];

export const mockDashboardSummary = {
  xp: 1240,
  rank: 42,
  solvedCount: 18,
  streak: 4,
};
