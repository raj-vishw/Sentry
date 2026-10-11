import { useMutation, useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

export const PROFILE_QUERY_KEY = ['profile'] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: userService.getProfile,
  });
}

/** No cache invalidation on success — the account (and its session) is
 * gone, so the caller clears auth state and navigates away instead. */
export function useDeleteAccount() {
  return useMutation({ mutationFn: userService.deleteAccount });
}
