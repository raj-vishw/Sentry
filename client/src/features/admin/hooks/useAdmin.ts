import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type ListAdminUsersParams, type ListAdminSubmissionsParams, type ListAuditLogsParams } from '@/services/adminService';
import { writeupService, type ListWriteupsParams } from '@/services/writeupService';
import { reportService } from '@/services/reportService';
import type { ReportStatus, StatsRange, SystemConfig } from '@/types';

// --- Users ---

export function useAdminUsers(params: ListAdminUsersParams) {
  return useQuery({ queryKey: ['admin-users', params], queryFn: () => adminService.getUsers(params) });
}

export function useAdminUserDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => adminService.getUserDetail(id!),
    enabled: !!id,
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) =>
      status === 'DISABLED' ? adminService.disableUser(id) : adminService.enableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
  });
}

// --- Submissions ---

export function useAdminSubmissions(params: ListAdminSubmissionsParams) {
  return useQuery({ queryKey: ['admin-submissions', params], queryFn: () => adminService.getSubmissions(params) });
}

export function useInvalidateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.invalidateSubmission(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-submissions'] }),
  });
}

// --- Categories ---

export function useAdminCategories() {
  return useQuery({ queryKey: ['admin-categories'], queryFn: adminService.getCategories });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: Parameters<typeof adminService.updateCategory>[1] }) =>
      adminService.updateCategory(slug, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });
}

// --- Statistics ---

export function useOverviewStats() {
  return useQuery({ queryKey: ['admin-stats-overview'], queryFn: adminService.getOverview });
}

export function useUserStats(range: StatsRange) {
  return useQuery({ queryKey: ['admin-stats-users', range], queryFn: () => adminService.getUserStats(range) });
}

export function useChallengeStats(range: StatsRange) {
  return useQuery({ queryKey: ['admin-stats-challenges', range], queryFn: () => adminService.getChallengeStats(range) });
}

export function useSubmissionStats(range: StatsRange) {
  return useQuery({ queryKey: ['admin-stats-submissions', range], queryFn: () => adminService.getSubmissionStats(range) });
}

export function useTeamStats(range: StatsRange) {
  return useQuery({ queryKey: ['admin-stats-teams', range], queryFn: () => adminService.getTeamStats(range) });
}

export function useWriteupStats(range: StatsRange) {
  return useQuery({ queryKey: ['admin-stats-writeups', range], queryFn: () => adminService.getWriteupStats(range) });
}

// --- Audit log ---

export function useAuditLogs(params: ListAuditLogsParams) {
  return useQuery({ queryKey: ['admin-audit-logs', params], queryFn: () => adminService.getAuditLogs(params) });
}

// --- Writeups moderation ---

export function useAdminWriteups(params: ListWriteupsParams & { status?: string }) {
  return useQuery({ queryKey: ['admin-writeups', params], queryFn: () => writeupService.listForAdmin(params) });
}

function useWriteupModerationMutation<TResult, TVariables>(mutationFn: (vars: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-writeups'] });
      queryClient.invalidateQueries({ queryKey: ['writeups'] });
    },
  });
}

export function useApproveWriteup() {
  return useWriteupModerationMutation((id: string) => writeupService.approve(id));
}

export function useRejectWriteup() {
  return useWriteupModerationMutation(({ id, reason }: { id: string; reason: string }) => writeupService.reject(id, reason));
}

export function useArchiveWriteup() {
  return useWriteupModerationMutation((id: string) => writeupService.archive(id));
}

// --- Reports ---

export function useAdminReports(status?: ReportStatus) {
  return useQuery({ queryKey: ['admin-reports', status], queryFn: () => reportService.list({ status, limit: 50 }) });
}

function useReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'resolve' | 'dismiss' }) =>
      action === 'resolve' ? reportService.resolve(id) : reportService.dismiss(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });
}

export function useReviewReport() {
  return useReportMutation();
}

// --- Platform settings ---

export function useAdminSettings() {
  return useQuery({ queryKey: ['admin-settings'], queryFn: adminService.getSettings });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Omit<SystemConfig, 'setupCompleted'>>) => adminService.updateSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}
