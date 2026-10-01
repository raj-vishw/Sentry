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
  teamId: string | null;
  teamName: string | null;
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
  title?: string;
  cost: number;
  content: string | null;
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
  published?: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  solvedCount: number;
  teamName: string | null;
  onPage?: boolean;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  xp: number;
  solvedCount: number;
  memberCount: number;
}

export type TeamRole = 'owner' | 'member';

export interface TeamMember {
  userId: string;
  username: string;
  avatarUrl?: string;
  role: TeamRole;
  xp: number;
  solvedCount: number;
  joinedAt: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string;
  xp: number;
  solvedCount: number;
  memberCount: number;
  createdAt: string;
}

export interface Team extends TeamSummary {
  /** Only present for members of the team — never leaked to outsiders. */
  inviteCode: string | null;
  members: TeamMember[];
  categoryProgress: CategoryProgress[];
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
