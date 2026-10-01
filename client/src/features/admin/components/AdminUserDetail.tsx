import { useState } from 'react';
import { ArrowLeft, Ban, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { formatRelativeTime } from '@/lib/utils';
import { useAdminUserDetail, useSetUserStatus } from '../hooks/useAdmin';

export function AdminUserDetail({ userId, onBack }: { userId: string; onBack: () => void }) {
  const { data: user, isLoading, isError, refetch } = useAdminUserDetail(userId);
  const setStatus = useSetUserStatus();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const action = user?.status === 'ACTIVE' ? 'disable' : 'enable';

  function handleConfirmedAction() {
    if (!user) return;
    setStatus.mutate(
      { id: user.id, status: user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' },
      { onSuccess: () => setConfirming(false) },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft className="size-4" /> Back to users
      </button>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {user && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">{user.username}</h2>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={user.role === 'admin' ? 'secondary' : 'default'}>{user.role}</Badge>
                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'error'}>{user.status}</Badge>
                {user.teamName && <Badge variant="accent">{user.teamName}</Badge>}
              </div>
            </div>
            <Button
              variant={action === 'disable' ? 'danger' : 'primary'}
              size="sm"
              leftIcon={action === 'disable' ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
              onClick={() => setConfirming(true)}
            >
              {action === 'disable' ? 'Disable account' : 'Enable account'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Points" value={user.points.toLocaleString()} />
            <Stat label="Solved" value={user.solvedCount} />
            <Stat label="Streak" value={`${user.streak}d`} />
            <Stat label="Submissions" value={`${user.correctSubmissionCount} / ${user.submissionCount}`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Solves</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-[var(--color-border)]">
              {user.recentSolves.length === 0 && (
                <p className="py-4 text-sm text-[var(--color-text-muted)]">No solves yet.</p>
              )}
              {user.recentSolves.map((s) => (
                <div key={s.challengeId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-sm">
                  <span className="text-[var(--color-text-primary)]">{s.title}</span>
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    +{s.points} · {formatRelativeTime(s.solvedAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <ConfirmDialog
            open={confirming}
            onClose={() => {
              setConfirming(false);
              setConfirmText('');
            }}
            onConfirm={handleConfirmedAction}
            title={action === 'disable' ? 'Disable this account?' : 'Enable this account?'}
            description={
              action === 'disable'
                ? `${user.username} will be immediately signed out and unable to log back in, submit flags, or join a team. Type the username to confirm.`
                : `${user.username} will be able to log in again.`
            }
            confirmLabel={action === 'disable' ? 'Disable account' : 'Enable account'}
            variant={action === 'disable' ? 'danger' : 'primary'}
            isLoading={setStatus.isPending}
            confirmDisabled={action === 'disable' && confirmText !== user.username}
          >
            {action === 'disable' && (
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type "${user.username}" to confirm`}
                className="mt-4 h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus-visible:outline-none"
              />
            )}
          </ConfirmDialog>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-0.5 p-4">
        <p className="font-display text-xl font-bold text-[var(--color-text-primary)]">{value}</p>
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      </CardContent>
    </Card>
  );
}
