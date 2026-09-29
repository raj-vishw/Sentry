import type { Team } from '@/types';

export const mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Null Pointer Exception',
    tag: 'NPE',
    rank: 1,
    xp: 18420,
    memberCount: 4,
    isMine: true,
    members: [
      { id: 'm1', username: 'Operator_01', role: 'captain', xp: 4820 },
      { id: 'm2', username: 'ByteWitch', role: 'member', xp: 4260 },
      { id: 'm3', username: 'Cascade', role: 'member', xp: 4680 },
      { id: 'm4', username: 'Sable', role: 'member', xp: 4660 },
    ],
  },
  {
    id: 't2',
    name: 'Kernel Panic',
    tag: 'KPX',
    rank: 2,
    xp: 16110,
    memberCount: 5,
    isMine: false,
    members: [
      { id: 'm5', username: 'NullByte', role: 'captain', xp: 4680 },
      { id: 'm6', username: 'Reaper_dev', role: 'member', xp: 4030 },
      { id: 'm7', username: 'Wraith', role: 'member', xp: 3900 },
      { id: 'm8', username: 'Ironclad', role: 'member', xp: 2100 },
      { id: 'm9', username: 'Nexus_9', role: 'member', xp: 1400 },
    ],
  },
  {
    id: 't3',
    name: 'Segfault Society',
    tag: 'SFS',
    rank: 3,
    xp: 12980,
    memberCount: 3,
    isMine: false,
    members: [
      { id: 'm10', username: 'RedStorm', role: 'captain', xp: 4540 },
      { id: 'm11', username: 'DarkMatter', role: 'member', xp: 4210 },
      { id: 'm12', username: 'Parallax', role: 'member', xp: 4230 },
    ],
  },
  {
    id: 't4',
    name: 'Zero Day Society',
    tag: 'ZDS',
    rank: 4,
    xp: 10420,
    memberCount: 6,
    isMine: false,
    members: [
      { id: 'm13', username: 'CyberFox', role: 'captain', xp: 3900 },
      { id: 'm14', username: 'GhostRoot', role: 'member', xp: 3750 },
      { id: 'm15', username: 'Sn0wDrift', role: 'member', xp: 2770 },
    ],
  },
];
