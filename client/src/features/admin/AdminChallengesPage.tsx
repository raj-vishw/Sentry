import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminService, type AdminChallengeDetail, type AdminChallengeInput } from '@/services/adminService';
import { CATEGORY_META, DIFFICULTY_META } from '@/lib/categories';
import { useUiStore } from '@/stores/uiStore';
import { ChallengeFormModal } from './components/ChallengeFormModal';

const CHALLENGES_KEY = ['admin-challenges'];

export function AdminChallengesPage() {
  const queryClient = useQueryClient();
  const pushToast = useUiStore((s) => s.pushToast);
  const { data, isLoading } = useQuery({ queryKey: CHALLENGES_KEY, queryFn: adminService.getChallenges });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminChallengeDetail | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: CHALLENGES_KEY });
    queryClient.invalidateQueries({ queryKey: ['challenges'] });
  }

  const createMutation = useMutation({
    mutationFn: (input: AdminChallengeInput) => adminService.createChallenge(input),
    onSuccess: () => {
      invalidate();
      pushToast({ title: 'Challenge created', variant: 'success' });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminChallengeInput }) => adminService.updateChallenge(id, input),
    onSuccess: () => {
      invalidate();
      pushToast({ title: 'Challenge updated', variant: 'success' });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteChallenge(id),
    onSuccess: () => {
      invalidate();
      pushToast({ title: 'Challenge deleted', variant: 'info' });
      setPendingDeleteId(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => adminService.setPublished(id, published),
    onSuccess: (_res, vars) => {
      invalidate();
      pushToast({ title: vars.published ? 'Challenge published' : 'Challenge unpublished', variant: 'info' });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => adminService.uploadChallengeFile(id, file),
    onSuccess: () => invalidate(),
  });

  async function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  async function openEdit(id: string) {
    const detail = await adminService.getChallengeById(id);
    setEditing(detail);
    setModalOpen(true);
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            Challenges
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Manage the challenge catalog.</p>
        </div>
        <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
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
              <Th>Status</Th>
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
                  <Badge variant={challenge.published ? 'success' : 'default'}>
                    {challenge.published ? 'Published' : 'Draft'}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => publishMutation.mutate({ id: challenge.id, published: !challenge.published })}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                      aria-label={challenge.published ? `Unpublish ${challenge.title}` : `Publish ${challenge.title}`}
                    >
                      {challenge.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(challenge.id)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                      aria-label={`Edit ${challenge.title}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(challenge.id)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                      aria-label={`Delete ${challenge.title}`}
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

      <ChallengeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        challenge={editing}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (input) => {
          if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, input });
          } else {
            await createMutation.mutateAsync(input);
          }
        }}
        onUploadFile={editing ? (file) => uploadMutation.mutateAsync({ id: editing.id, file }) : undefined}
      />

      <ConfirmDialog
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId && deleteMutation.mutate(pendingDeleteId)}
        title="Delete challenge"
        description="This permanently deletes the challenge and its hints. Submission history is kept for auditing. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
