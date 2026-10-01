import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { teamService } from '@/services/teamService';
import type { TeamSummary } from '@/types';

const PAGE_SIZE = 20;

export function AdminTeamsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-teams', page],
    queryFn: () => teamService.list(page, PAGE_SIZE),
  });

  const columns: DataTableColumn<TeamSummary>[] = [
    { key: 'name', header: 'Name', render: (t) => <span className="font-medium text-[var(--color-text-primary)]">{t.name}</span> },
    { key: 'slug', header: 'Slug', render: (t) => <span className="font-mono">{t.slug}</span> },
    { key: 'xp', header: 'XP', className: 'text-right', render: (t) => <span className="font-mono">{t.xp.toLocaleString()}</span> },
    { key: 'solved', header: 'Solved', className: 'text-right', render: (t) => t.solvedCount },
    { key: 'members', header: 'Members', className: 'text-right', render: (t) => t.memberCount },
  ];

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">Teams</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {data?.pagination.total ?? 0} registered teams. Read-only — team edits/disbanding stay owner-only via the
          player-facing team routes.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={data?.teams ?? []}
        rowKey={(t) => t.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyIcon={Shield}
        emptyTitle="No teams yet"
      />

      {data && <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />}
    </PageContainer>
  );
}
