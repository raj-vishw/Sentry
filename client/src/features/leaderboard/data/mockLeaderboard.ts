import type { LeaderboardEntry } from '@/types';

const names = [
  'Operator_01', 'NullByte', 'RedStorm', 'CyberFox', 'GhostRoot',
  'ZeroCool_', 'Kryptonite', 'Sn0wDrift', 'BlackIce', 'Vantablack',
  'EchoSignal', 'Reaper_dev', 'ByteWitch', 'Cascade', 'Parallax',
  'DarkMatter', 'Wraith', 'Sable', 'Ironclad', 'Nexus_9',
];

export function buildMockLeaderboard(): LeaderboardEntry[] {
  return names.map((username, i) => ({
    rank: i + 1,
    previousRank: i + 1 + (Math.floor(Math.random() * 5) - 2),
    username,
    xp: 4820 - i * (140 + Math.floor(Math.random() * 40)),
    solvedCount: 62 - i * 2,
    teamName: i % 3 === 0 ? 'Null Pointer Exception' : i % 3 === 1 ? 'Kernel Panic' : undefined,
  }));
}

export const mockLeaderboardPreview: LeaderboardEntry[] = buildMockLeaderboard().slice(0, 5);
export const mockLeaderboardFull: LeaderboardEntry[] = buildMockLeaderboard();
