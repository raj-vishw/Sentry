import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { adminService } from '@/services/adminService';

export function AdminTeamsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-teams'], queryFn: adminService.getTeams });

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Teams
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{data?.length ?? 0} registered teams.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th className="text-right">XP</Th>
              <Th className="text-right">Solved</Th>
              <Th className="text-right">Members</Th>
            </tr>
          </TableHead>
          <TableBody>
            {data?.map((team) => (
              <TableRow key={team.id}>
                <Td className="font-medium text-[var(--color-text-primary)]">{team.name}</Td>
                <Td className="font-mono">{team.slug}</Td>
                <Td className="text-right font-mono">{team.xp.toLocaleString()}</Td>
                <Td className="text-right">{team.solvedCount}</Td>
                <Td className="text-right">{team.memberCount}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}
