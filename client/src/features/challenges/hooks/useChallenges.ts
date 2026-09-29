import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export const CHALLENGES_QUERY_KEY = ['challenges'] as const;

export function useChallenges() {
  return useQuery({
    queryKey: CHALLENGES_QUERY_KEY,
    queryFn: challengeService.list,
  });
}
