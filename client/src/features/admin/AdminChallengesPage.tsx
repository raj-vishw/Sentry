import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { adminService } from '@/services/adminService';
import { CATEGORY_META, DIFFICULTY_META } from '@/lib/categories';

export function AdminChallengesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-challenges'], queryFn: adminService.getChallenges });

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            Challenges
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage the challenge catalog. Create/edit is wired up in Phase 2.
          </p>
        </div>
        <Button leftIcon={<Plus className="size-4" />} disabled title="Available once the backend is connected">
          New Challenge
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Difficulty</Th>
              <Th className="text-right">Points</Th>
              <Th className="text-right">Solves</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHead>
          <TableBody>
            {data?.map((challenge) => (
              <TableRow key={challenge.id}>
                <Td className="font-medium text-[var(--color-text-primary)]">{challenge.title}</Td>
                <Td>{CATEGORY_META[challenge.category].name}</Td>
                <Td style={{ color: DIFFICULTY_META[challenge.difficulty].color }}>
                  {DIFFICULTY_META[challenge.difficulty].label}
                </Td>
                <Td className="text-right font-mono">{challenge.points}</Td>
                <Td className="text-right">{challenge.solveCount}</Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                      aria-label={`Edit ${challenge.title}`}
                      disabled
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                      aria-label={`Delete ${challenge.title}`}
                      disabled
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <p className="text-xs text-[var(--color-text-muted)]">
        <Badge variant="default">Phase 1</Badge> Actions are disabled until the real API is connected in Phase 2.
      </p>
    </PageContainer>
  );
}
