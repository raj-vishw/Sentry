import { useState } from 'react';
import { Lightbulb, Lock } from 'lucide-react';
import type { Hint } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function HintsList({ hints }: { hints: Hint[] }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(
    new Set(hints.filter((h) => h.unlocked).map((h) => h.id)),
  );

  if (hints.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {hints.map((hint) => {
        const isUnlocked = unlocked.has(hint.id);
        return (
          <div
            key={hint.id}
            className={cn(
              'flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-4 py-3',
              'border-[var(--color-border)] bg-[var(--color-surface)]',
            )}
          >
            {isUnlocked ? (
              <p className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Lightbulb className="size-4 shrink-0 text-[var(--color-warning)]" aria-hidden="true" />
                {hint.content}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Lock className="size-4 shrink-0" aria-hidden="true" />
                Hint locked — costs {hint.cost} XP
              </p>
            )}
            {!isUnlocked && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnlocked((prev) => new Set(prev).add(hint.id))}
              >
                Unlock
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
