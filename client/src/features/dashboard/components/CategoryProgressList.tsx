import type { CategoryProgress } from '@/types';
import { CATEGORY_META } from '@/lib/categories';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function CategoryProgressList({ progress }: { progress: CategoryProgress[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {progress.map((p) => {
          const meta = CATEGORY_META[p.category];
          return (
            <div key={p.category}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-text-primary)]">{meta.name}</span>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  {p.solved}/{p.total}
                </span>
              </div>
              <ProgressBar value={p.solved} max={p.total} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
