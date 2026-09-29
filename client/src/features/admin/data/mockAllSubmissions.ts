import type { Submission } from '@/types';
import { mockChallenges } from '@/features/challenges/data/mockChallenges';

const usernames = [
  'Operator_01', 'NullByte', 'RedStorm', 'CyberFox', 'GhostRoot', 'ZeroCool_',
  'Kryptonite', 'Sn0wDrift', 'BlackIce', 'Vantablack',
];

export const mockAllSubmissions: Submission[] = Array.from({ length: 24 }, (_, i) => {
  const challenge = mockChallenges[i % mockChallenges.length];
  return {
    id: `sub-${i + 1}`,
    username: usernames[i % usernames.length],
    challengeTitle: challenge.title,
    category: challenge.category,
    correct: i % 3 !== 0,
    submittedAt: new Date(Date.now() - i * 40 * 60 * 1000).toISOString(),
  };
});
