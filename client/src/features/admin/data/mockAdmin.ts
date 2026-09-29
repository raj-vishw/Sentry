import type { AdminMetrics, Submission } from '@/types';

export const mockAdminMetrics: AdminMetrics = {
  users: 4820,
  challenges: 86,
  submissions: 38940,
  teams: 612,
};

export const mockSubmissionTrend = [
  { day: 'Mon', submissions: 420 },
  { day: 'Tue', submissions: 512 },
  { day: 'Wed', submissions: 601 },
  { day: 'Thu', submissions: 488 },
  { day: 'Fri', submissions: 734 },
  { day: 'Sat', submissions: 902 },
  { day: 'Sun', submissions: 845 },
];

export const mockCategoryDistribution = [
  { category: 'Web', value: 16 },
  { category: 'Crypto', value: 12 },
  { category: 'Forensics', value: 11 },
  { category: 'Reverse', value: 10 },
  { category: 'Pwn', value: 9 },
  { category: 'OSINT', value: 10 },
  { category: 'Cloud', value: 9 },
  { category: 'Mobile', value: 9 },
];

export const mockRecentSubmissions: Submission[] = [
  { id: 's1', username: 'Operator_01', challengeTitle: 'Race Condition', category: 'web', correct: true, submittedAt: '2026-09-29T08:10:00Z' },
  { id: 's2', username: 'NullByte', challengeTitle: 'Broken Cipher', category: 'crypto', correct: false, submittedAt: '2026-09-29T08:02:00Z' },
  { id: 's3', username: 'RedStorm', challengeTitle: 'Bucket List', category: 'cloud', correct: true, submittedAt: '2026-09-29T07:58:00Z' },
  { id: 's4', username: 'CyberFox', challengeTitle: 'Null Pointer', category: 'pwn', correct: false, submittedAt: '2026-09-29T07:40:00Z' },
  { id: 's5', username: 'GhostRoot', challengeTitle: 'Sideload', category: 'mobile', correct: true, submittedAt: '2026-09-29T07:12:00Z' },
];
