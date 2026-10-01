import type {
  AdminCategory,
  AdminUserDetail,
  AdminUserListItem,
  AdminSubmission,
  AuditLogEntry,
  Category,
  ChallengeStats,
  Challenge,
  Difficulty,
  Pagination,
  PlatformOverview,
  StatsRange,
  SubmissionStats,
  TeamStats,
  UserStats,
  WriteupStats,
} from '@/types';
import { apiClient, ADMIN_PREFIX } from '@/lib/apiClient';
import { challengeService, DIFFICULTY_TO_FRONTEND, DIFFICULTY_TO_BACKEND } from './challengeService';
import { teamService } from './teamService';

export interface AdminHintInput {
  id?: string;
  title: string;
  content: string;
  cost: number;
  order: number;
  active: boolean;
}

export interface AdminChallengeInput {
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  /** Omit (or leave blank) on update to leave the existing flag untouched. */
  flag?: string;
  flagFormat: string;
  published: boolean;
  hints: AdminHintInput[];
  /** Id of a published challenge that must be solved first, or null for none. */
  prerequisite?: string | null;
}

/** The admin edit form's view of a challenge — full hint content, no flag. */
export interface AdminChallengeDetail {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  flagFormat: string;
  published: boolean;
  hints: AdminHintInput[];
  prerequisite: string | null;
  prerequisiteTitle: string | null;
}

interface BackendAdminHint {
  id: string;
  title: string;
  content: string;
  cost: number;
  order: number;
  active: boolean;
}

interface BackendAdminChallengeDetail {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
  points: number;
  flagFormat: string;
  published: boolean;
  hints: BackendAdminHint[];
  prerequisiteId: string | null;
  prerequisiteTitle: string | null;
}

function toAdminDetail(raw: BackendAdminChallengeDetail): AdminChallengeDetail {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    difficulty: DIFFICULTY_TO_FRONTEND[raw.difficulty],
    points: raw.points,
    flagFormat: raw.flagFormat,
    published: raw.published,
    hints: raw.hints.map((h) => ({
      id: h.id,
      title: h.title,
      content: h.content,
      cost: h.cost,
      order: h.order,
      active: h.active,
    })),
    prerequisite: raw.prerequisiteId,
    prerequisiteTitle: raw.prerequisiteTitle,
  };
}

function toBackendPayload(input: AdminChallengeInput) {
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    difficulty: DIFFICULTY_TO_BACKEND[input.difficulty],
    points: input.points,
    ...(input.flag ? { flag: input.flag } : {}),
    flagFormat: input.flagFormat,
    published: input.published,
    hints: input.hints.map(({ title, content, cost, order, active }) => ({ title, content, cost, order, active })),
    prerequisite: input.prerequisite ?? null,
  };
}

function buildQuery(params: object): string {
  const entries = Object.entries(params as Record<string, unknown>).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/**
 * CSV export requires the Bearer token, which a plain `<a href>` can't
 * send — same authenticated-blob-then-object-URL pattern already used for
 * challenge file downloads (see challengeService.ts#downloadFile).
 */
async function downloadCsv(path: string, filename: string): Promise<void> {
  const blob = await apiClient.getBlob(path);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export interface ListAdminUsersParams {
  search?: string;
  role?: 'user' | 'admin';
  status?: 'ACTIVE' | 'DISABLED';
  sort?: 'newest' | 'oldest' | 'points-desc' | 'points-asc';
  page?: number;
  limit?: number;
}

export interface ListAdminSubmissionsParams {
  username?: string;
  challengeId?: string;
  category?: Category;
  result?: 'correct' | 'incorrect';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListAuditLogsParams {
  actor?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  async getTeams() {
    const { teams } = await teamService.list(1, 100);
    return teams;
  },

  // --- Challenge management: real backend ---

  /** Admins see unpublished challenges too via the same public list endpoint. */
  async getChallenges(): Promise<Challenge[]> {
    const { challenges } = await challengeService.list({ limit: 100 });
    return challenges;
  },

  async getChallengeById(id: string): Promise<AdminChallengeDetail> {
    const { challenge } = await apiClient.get<{ challenge: BackendAdminChallengeDetail }>(`/${ADMIN_PREFIX}/challenges/${id}`);
    return toAdminDetail(challenge);
  },

  async createChallenge(input: AdminChallengeInput): Promise<AdminChallengeDetail> {
    const { challenge } = await apiClient.post<{ challenge: BackendAdminChallengeDetail }>(
      `/${ADMIN_PREFIX}/challenges`,
      toBackendPayload(input),
    );
    return toAdminDetail(challenge);
  },

  async updateChallenge(id: string, input: AdminChallengeInput): Promise<AdminChallengeDetail> {
    const { challenge } = await apiClient.patch<{ challenge: BackendAdminChallengeDetail }>(
      `/${ADMIN_PREFIX}/challenges/${id}`,
      toBackendPayload(input),
    );
    return toAdminDetail(challenge);
  },

  async deleteChallenge(id: string): Promise<void> {
    await apiClient.delete(`/${ADMIN_PREFIX}/challenges/${id}`);
  },

  async setPublished(id: string, published: boolean): Promise<void> {
    await apiClient.post(`/${ADMIN_PREFIX}/challenges/${id}/${published ? 'publish' : 'unpublish'}`);
  },

  async uploadChallengeFile(id: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await apiClient.postForm(`/${ADMIN_PREFIX}/challenges/${id}/files`, form);
  },

  // --- Users ---

  async getUsers(params: ListAdminUsersParams = {}): Promise<{ users: AdminUserListItem[]; pagination: Pagination }> {
    return apiClient.get(`/${ADMIN_PREFIX}/users${buildQuery(params)}`);
  },

  async getUserDetail(id: string): Promise<AdminUserDetail> {
    const { user } = await apiClient.get<{ user: AdminUserDetail }>(`/${ADMIN_PREFIX}/users/${id}`);
    return user;
  },

  async disableUser(id: string): Promise<AdminUserListItem> {
    const { user } = await apiClient.post<{ user: AdminUserListItem }>(`/${ADMIN_PREFIX}/users/${id}/disable`);
    return user;
  },

  async enableUser(id: string): Promise<AdminUserListItem> {
    const { user } = await apiClient.post<{ user: AdminUserListItem }>(`/${ADMIN_PREFIX}/users/${id}/enable`);
    return user;
  },

  async exportUsersCsv(params: Pick<ListAdminUsersParams, 'search' | 'role' | 'status'> = {}): Promise<void> {
    await downloadCsv(`/${ADMIN_PREFIX}/users/export.csv${buildQuery(params)}`, 'users.csv');
  },

  // --- Submissions ---

  async getSubmissions(
    params: ListAdminSubmissionsParams = {},
  ): Promise<{ submissions: AdminSubmission[]; pagination: Pagination }> {
    return apiClient.get(`/${ADMIN_PREFIX}/submissions${buildQuery(params)}`);
  },

  async invalidateSubmission(id: string): Promise<void> {
    await apiClient.post(`/${ADMIN_PREFIX}/submissions/${id}/invalidate`);
  },

  async exportSubmissionsCsv(params: ListAdminSubmissionsParams = {}): Promise<void> {
    await downloadCsv(`/${ADMIN_PREFIX}/submissions/export.csv${buildQuery(params)}`, 'submissions.csv');
  },

  // --- Categories ---

  async getCategories(): Promise<AdminCategory[]> {
    const { categories } = await apiClient.get<{ categories: AdminCategory[] }>(`/${ADMIN_PREFIX}/categories`);
    return categories;
  },

  async updateCategory(
    slug: string,
    input: Partial<Pick<AdminCategory, 'name' | 'description' | 'icon' | 'active'>>,
  ): Promise<AdminCategory> {
    const { category } = await apiClient.patch<{ category: AdminCategory }>(`/${ADMIN_PREFIX}/categories/${slug}`, input);
    return category;
  },

  // --- Statistics ---

  async getOverview(): Promise<PlatformOverview> {
    return apiClient.get(`/${ADMIN_PREFIX}/statistics/overview`);
  },

  async getUserStats(range: StatsRange): Promise<UserStats> {
    return apiClient.get(`/${ADMIN_PREFIX}/statistics/users?range=${range}`);
  },

  async getChallengeStats(range: StatsRange): Promise<ChallengeStats> {
    return apiClient.get(`/${ADMIN_PREFIX}/statistics/challenges?range=${range}`);
  },

  async getSubmissionStats(range: StatsRange): Promise<SubmissionStats> {
    return apiClient.get(`/${ADMIN_PREFIX}/statistics/submissions?range=${range}`);
  },

  async getTeamStats(range: StatsRange): Promise<TeamStats> {
    return apiClient.get(`/${ADMIN_PREFIX}/statistics/teams?range=${range}`);
  },

  async getWriteupStats(range: StatsRange): Promise<WriteupStats> {
    return apiClient.get(`/${ADMIN_PREFIX}/statistics/writeups?range=${range}`);
  },

  // --- Audit log ---

  async getAuditLogs(params: ListAuditLogsParams = {}): Promise<{ entries: AuditLogEntry[]; pagination: Pagination }> {
    return apiClient.get(`/${ADMIN_PREFIX}/audit-logs${buildQuery(params)}`);
  },
};
