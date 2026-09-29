export const SITE_CONFIG = {
  name: 'Breach',
  tagline: 'Break the system. Prove your skill.',
  description:
    'A competitive cybersecurity challenge platform — solve realistic security problems, earn XP, and climb the leaderboard.',
  githubUrl: '#', // TODO: replace with real repository URL
  socials: {
    twitter: '#', // TODO
    discord: '#', // TODO
  },
} as const;

export const PUBLIC_NAV_LINKS = [
  { label: 'Challenges', href: '/challenges' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'About', href: '/#about' },
] as const;

export const PLAYER_NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Challenges', href: '/challenges', icon: 'Flag' },
  { label: 'Leaderboard', href: '/leaderboard', icon: 'Trophy' },
  { label: 'Teams', href: '/teams', icon: 'Users' },
  { label: 'Profile', href: '/profile', icon: 'CircleUser' },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Challenges', href: '/admin/challenges', icon: 'Flag' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Teams', href: '/admin/teams', icon: 'Shield' },
  { label: 'Submissions', href: '/admin/submissions', icon: 'ListChecks' },
  { label: 'Statistics', href: '/admin/statistics', icon: 'BarChart3' },
] as const;
