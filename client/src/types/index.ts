export type Role = 'user' | 'admin';

export type Category =
  | 'web'
  | 'crypto'
  | 'forensics'
  | 'reverse'
  | 'pwn'
  | 'osint'
  | 'cloud'
  | 'mobile';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  xp: number;
  rank: number;
  solvedCount: number;
  streak: number;
  createdAt: string;
}

export interface AuthCredentials {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Hint {
  id: string;
  cost: number;
  content: string;
  unlocked: boolean;
}

export interface ChallengeFile {
  id: string;
  name: string;
  sizeKb: number;
  url: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  description: string;
  solveCount: number;
  solved: boolean;
  author: string;
  files: ChallengeFile[];
  hints: Hint[];
  tags: string[];
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  username: string;
  avatarUrl?: string;
  xp: number;
  solvedCount: number;
  teamName?: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  rank: number;
  xp: number;
  memberCount: number;
  members: TeamMember[];
  isMine: boolean;
}

export interface TeamMember {
  id: string;
  username: string;
  role: 'captain' | 'member';
  xp: number;
}

export interface CategorySummary {
  id: Category;
  name: string;
  description: string;
  challengeCount: number;
}

export interface PlatformStats {
  challenges: number;
  categories: number;
  solves: number;
  players: number;
}

export interface CategoryProgress {
  category: Category;
  solved: number;
  total: number;
}

export interface RecentSolve {
  id: string;
  challengeTitle: string;
  category: Category;
  points: number;
  solvedAt: string;
}

export interface AdminMetrics {
  users: number;
  challenges: number;
  submissions: number;
  teams: number;
}

export interface Submission {
  id: string;
  username: string;
  challengeTitle: string;
  category: Category;
  correct: boolean;
  submittedAt: string;
}
