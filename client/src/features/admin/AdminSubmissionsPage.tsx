import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { adminService } from '@/services/adminService';
import { CATEGORY_META } from '@/lib/categories';
import { formatRelativeTime } from '@/lib/utils';

export function AdminSubmissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-submissions'],
    queryFn: adminService.getAllSubmissions,
  });

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Submissions
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Live feed of flag submissions.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <Th>User</Th>
              <Th>Challenge</Th>
              <Th>Category</Th>
              <Th>Result</Th>
              <Th className="text-right">Time</Th>
            </tr>
          </TableHead>
          <TableBody>
            {data?.map((sub) => (
              <TableRow key={sub.id}>
                <Td className="font-medium text-[var(--color-text-primary)]">{sub.username}</Td>
                <Td>{sub.challengeTitle}</Td>
                <Td>{CATEGORY_META[sub.category].name}</Td>
                <Td>
                  <Badge variant={sub.correct ? 'success' : 'error'}>{sub.correct ? 'Correct' : 'Wrong'}</Badge>
                </Td>
                <Td className="text-right font-mono text-xs">{formatRelativeTime(sub.submittedAt)}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}
