export const SITE_CONFIG = {
  name: 'Sentry',
  tagline: 'An observatory for cybersecurity.',
  description:
    'Explore an evolving map of security concepts, investigate realistic challenges, and watch your own knowledge graph take shape.',
  githubUrl: '#', // TODO: replace with real repository URL
  socials: {
    twitter: '#', // TODO
    discord: '#', // TODO
  },
} as const;

export const PUBLIC_NAV_LINKS = [
  { label: 'Explore', href: '/challenges' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'About', href: '/#about' },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Challenges', href: '/admin/challenges', icon: 'Flag' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Teams', href: '/admin/teams', icon: 'Shield' },
  { label: 'Submissions', href: '/admin/submissions', icon: 'ListChecks' },
  { label: 'Categories', href: '/admin/categories', icon: 'Layers' },
  { label: 'Writeups', href: '/admin/writeups', icon: 'FileText' },
  { label: 'Statistics', href: '/admin/statistics', icon: 'BarChart3' },
  { label: 'Audit Log', href: '/admin/audit-logs', icon: 'ScrollText' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const;
