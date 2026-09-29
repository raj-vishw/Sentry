import { Swords, TrendingUp, Users2, BookOpen, LineChart, type LucideIcon } from 'lucide-react';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const mockFeatures: FeatureItem[] = [
  {
    id: 'challenge',
    title: 'Challenge',
    description: 'Solve realistic security problems built by working practitioners.',
    icon: Swords,
  },
  {
    id: 'compete',
    title: 'Compete',
    description: 'Earn XP for every solve and climb a live global leaderboard.',
    icon: TrendingUp,
  },
  {
    id: 'collaborate',
    title: 'Collaborate',
    description: 'Create or join a team and tackle challenges together.',
    icon: Users2,
  },
  {
    id: 'learn',
    title: 'Learn',
    description: 'Read and publish writeups once a challenge closes.',
    icon: BookOpen,
  },
  {
    id: 'track',
    title: 'Track',
    description: 'Monitor category progress, streaks, and your security journey.',
    icon: LineChart,
  },
];
