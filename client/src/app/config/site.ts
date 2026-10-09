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
  { label: 'Docs', href: '/docs' },
  { label: 'About', href: '/#about' },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard', href: '/app/admin', icon: 'LayoutDashboard' },
  { label: 'Challenges', href: '/app/admin/challenges', icon: 'Flag' },
  { label: 'Users', href: '/app/admin/users', icon: 'Users' },
  { label: 'Teams', href: '/app/admin/teams', icon: 'Shield' },
  { label: 'Submissions', href: '/app/admin/submissions', icon: 'ListChecks' },
  { label: 'Categories', href: '/app/admin/categories', icon: 'Layers' },
  { label: 'Writeups', href: '/app/admin/writeups', icon: 'FileText' },
  { label: 'Statistics', href: '/app/admin/statistics', icon: 'BarChart3' },
  { label: 'Audit Log', href: '/app/admin/audit-logs', icon: 'ScrollText' },
  { label: 'Competition', href: '/app/admin/competition', icon: 'Trophy' },
  { label: 'Pages', href: '/app/admin/pages', icon: 'BookOpen' },
  { label: 'Announcements', href: '/app/admin/announcements', icon: 'Megaphone' },
  { label: 'Settings', href: '/app/admin/settings', icon: 'Settings' },
] as const;
