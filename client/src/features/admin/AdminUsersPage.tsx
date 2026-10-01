import { useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminUsers } from './hooks/useAdmin';
import { AdminUserDetail } from './components/AdminUserDetail';
import type { AdminUserListItem } from '@/types';

export function AdminUsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | 'user' | 'admin'>('all');
  const [status, setStatus] = useState<'all' | 'ACTIVE' | 'DISABLED'>('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    search: debouncedSearch || undefined,
    role: role === 'all' ? undefined : role,
    status: status === 'all' ? undefined : status,
    page,
    limit: 20,
  });

  if (selectedUserId) {
    return (
      <PageContainer>
        <AdminUserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
      </PageContainer>
    );
  }

  const columns: DataTableColumn<AdminUserListItem>[] = [
    { key: 'username', header: 'Username', render: (u) => <span className="font-medium text-[var(--color-text-primary)]">{u.username}</span> },
    { key: 'email', header: 'Email', render: (u) => <span className="font-mono text-xs">{u.email}</span> },
    { key: 'role', header: 'Role', render: (u) => <span className="uppercase">{u.role}</span> },
    { key: 'points', header: 'Points', className: 'text-right', render: (u) => <span className="font-mono">{u.points.toLocaleString()}</span> },
    { key: 'solved', header: 'Solved', className: 'text-right', render: (u) => u.solvedCount },
    { key: 'team', header: 'Team', render: (u) => u.teamName ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>{u.status}</Badge>,
    },
  ];

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {data?.pagination.total ?? 0} registered operators.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          placeholder="Search username or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Search users"
          className="max-w-sm flex-1"
        />
        <Select
          aria-label="Filter by role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as typeof role);
            setPage(1);
          }}
          className="w-auto"
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
          className="w-auto"
        >
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.users ?? []}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRowClick={(u) => setSelectedUserId(u.id)}
        emptyIcon={UsersIcon}
        emptyTitle="No users match these filters"
      />

      {data && (
        <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
      )}
    </PageContainer>
  );
}
