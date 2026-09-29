import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { adminService } from '@/services/adminService';
import { useState } from 'react';

export function AdminUsersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: adminService.getUsers });
  const [search, setSearch] = useState('');

  const filtered = data?.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Users
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {data?.length ?? 0} registered operators.
        </p>
      </div>

      <SearchInput
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search users"
        className="max-w-sm"
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th className="text-right">XP</Th>
              <Th className="text-right">Solved</Th>
              <Th>Status</Th>
            </tr>
          </TableHead>
          <TableBody>
            {filtered?.map((user) => (
              <TableRow key={user.id}>
                <Td className="font-medium text-[var(--color-text-primary)]">{user.username}</Td>
                <Td className="font-mono text-xs">{user.email}</Td>
                <Td className="uppercase">{user.role}</Td>
                <Td className="text-right font-mono">{user.xp.toLocaleString()}</Td>
                <Td className="text-right">{user.solvedCount}</Td>
                <Td>
                  <Badge variant={user.status === 'active' ? 'success' : 'error'}>{user.status}</Badge>
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}
