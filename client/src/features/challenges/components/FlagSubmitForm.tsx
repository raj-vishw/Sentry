import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Flag as FlagIcon, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { challengeService } from '@/services/challengeService';

const flagSchema = z.object({
  flag: z.string().min(1, 'Enter a flag before submitting.'),
});

type FlagFormValues = z.infer<typeof flagSchema>;

export function FlagSubmitForm({ challengeId, solved }: { challengeId: string; solved: boolean }) {
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FlagFormValues>({ resolver: zodResolver(flagSchema) });

  async function onSubmit(values: FlagFormValues) {
    setResult(null);
    const { correct } = await challengeService.submitFlag(challengeId, values.flag);
    setResult(correct ? 'correct' : 'incorrect');
    if (correct) reset();
  }

  if (solved) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        You've already solved this challenge.
      </div>
    );
  }

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
      {result === 'incorrect' && (
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-error)]">
          <XCircle className="size-4" aria-hidden="true" /> Incorrect flag. Try again.
        </p>
      )}
    </form>
  );
}
