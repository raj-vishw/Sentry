import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Flag as FlagIcon, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSubmitFlag } from '../hooks/useSubmitFlag';
import { useUiStore } from '@/stores/uiStore';

const flagSchema = z.object({
  flag: z.string().min(1, 'Enter a flag before submitting.'),
});

type FlagFormValues = z.infer<typeof flagSchema>;

export function FlagSubmitForm({
  challengeId,
  slug,
  solved,
}: {
  challengeId: string;
  slug: string;
  solved: boolean;
}) {
  const [result, setResult] = useState<'correct' | 'incorrect' | 'already' | null>(null);
  const pushToast = useUiStore((s) => s.pushToast);
  const submitFlag = useSubmitFlag(slug);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isValidating },
  } = useForm<FlagFormValues>({ resolver: zodResolver(flagSchema) });

  async function onSubmit(values: FlagFormValues) {
    setResult(null);
    try {
      const response = await submitFlag.mutateAsync({ challengeId, flag: values.flag });
      if (!response.correct) {
        setResult('incorrect');
        return;
      }
      if (response.alreadySolved) {
        setResult('already');
        return;
      }
      setResult('correct');
      reset();
      pushToast({
        title: 'Challenge solved',
        description: `+${response.pointsAwarded} XP`,
        variant: 'success',
      });
    } catch {
      // Handled by the global mutation error handler (toast) — nothing
      // else to do here beyond leaving the form as-is for a retry.
    }
  }

  if (solved) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        You've already solved this challenge.
      </div>
    );
  }

  const isSubmitting = isValidating || submitFlag.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            mono
            placeholder="flag{...}"
            aria-label="Flag"
            error={errors.flag?.message}
            {...register('flag')}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting} leftIcon={<FlagIcon className="size-4" />}>
          Submit
        </Button>
      </div>

      {result === 'correct' && (
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-success)]">
          <CheckCircle2 className="size-4" aria-hidden="true" /> Correct — challenge solved.
        </p>
      )}
      {result === 'already' && (
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
          <CheckCircle2 className="size-4" aria-hidden="true" /> Already solved — no additional points awarded.
        </p>
      )}
      {result === 'incorrect' && (
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-error)]">
          <XCircle className="size-4" aria-hidden="true" /> Incorrect flag. Try again.
        </p>
      )}
    </form>
  );
}
