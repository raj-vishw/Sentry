export interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  xp: number;
  solvedCount: number;
  status: 'active' | 'banned';
  joinedAt: string;
}

const usernames = [
  'Operator_01', 'NullByte', 'RedStorm', 'CyberFox', 'GhostRoot', 'ZeroCool_',
  'Kryptonite', 'Sn0wDrift', 'BlackIce', 'Vantablack', 'EchoSignal', 'Reaper_dev',
  'ByteWitch', 'Cascade', 'Parallax', 'DarkMatter', 'Wraith', 'Sable',
];

export const mockAdminUsers: AdminUserRow[] = usernames.map((username, i) => ({
  id: `u-${i + 1}`,
  username,
  email: `${username.toLowerCase()}@example.com`,
  role: i === 0 ? 'admin' : 'user',
  xp: 4820 - i * 180,
  solvedCount: 62 - i * 2,
  status: i === 11 ? 'banned' : 'active',
  joinedAt: new Date(Date.now() - i * 6 * 24 * 60 * 60 * 1000).toISOString(),
}));
