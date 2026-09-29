import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LIST, DIFFICULTY_META } from '@/lib/categories';
import type { AdminChallengeDetail, AdminChallengeInput } from '@/services/adminService';
import { useUiStore } from '@/stores/uiStore';

const hintSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'Hint title is required.'),
  content: z.string().trim().min(1, 'Hint content is required.'),
  cost: z.number().int().min(0),
  order: z.number().int().min(0),
  active: z.boolean(),
});

const formSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.'),
  category: z.enum(CATEGORY_LIST.map((c) => c.id) as [string, ...string[]]),
  difficulty: z.enum(['easy', 'medium', 'hard', 'insane']),
  points: z.number().int().min(0).max(10000),
  flag: z.string().trim().optional(),
  flagFormat: z.string().trim().min(1),
  published: z.boolean(),
  hints: z.array(hintSchema),
});

type FormValues = z.infer<typeof formSchema>;

const emptyDefaults: FormValues = {
  title: '',
  description: '',
  category: 'web',
  difficulty: 'easy',
  points: 100,
  flag: '',
  flagFormat: 'CTF{...}',
  published: false,
  hints: [],
};

export interface ChallengeFormModalProps {
  open: boolean;
  onClose: () => void;
  challenge?: AdminChallengeDetail | null;
  onSubmit: (input: AdminChallengeInput) => Promise<void>;
  isSubmitting: boolean;
  onUploadFile?: (file: File) => Promise<void>;
}

export function ChallengeFormModal({
  open,
  onClose,
  challenge,
  onSubmit,
  isSubmitting,
  onUploadFile,
}: ChallengeFormModalProps) {
  const isEdit = !!challenge;
  const pushToast = useUiStore((s) => s.pushToast);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: emptyDefaults });

  const { fields, append, remove } = useFieldArray({ control, name: 'hints' });

  useEffect(() => {
    if (open) {
      reset(
        challenge
          ? { ...challenge, flag: '' }
          : { ...emptyDefaults, hints: [] },
      );
    }
  }, [open, challenge, reset]);

  async function handleFormSubmit(values: FormValues) {
    if (!isEdit && !values.flag) {
      setError('flag', { message: 'Flag is required when creating a challenge.' });
      return;
    }
    await onSubmit({
      ...values,
      category: values.category as AdminChallengeInput['category'],
      flag: values.flag || undefined,
      hints: values.hints.map((h, i) => ({ ...h, order: i })),
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onUploadFile) return;
    try {
      await onUploadFile(file);
      pushToast({ title: 'File uploaded', description: file.name, variant: 'success' });
    } catch {
      // Global mutation/query error handling already surfaces a toast.
    } finally {
      e.target.value = '';
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Edit: ${challenge?.title}` : 'New Challenge'} className="max-w-2xl">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <Input label="Title" error={errors.title?.message} {...register('title')} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
            Description
          </label>
          <textarea
            rows={4}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus-visible:outline-none"
            {...register('description')}
          />
          {errors.description && <p className="text-xs text-[var(--color-error)]">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" {...register('category')}>
            {CATEGORY_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Difficulty" {...register('difficulty')}>
            {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Points"
            type="number"
            error={errors.points?.message}
            {...register('points', { valueAsNumber: true })}
          />
          <Input label="Flag Format" {...register('flagFormat')} />
        </div>

        <Input
          label={isEdit ? 'Replace Flag (leave blank to keep current)' : 'Flag'}
          mono
          placeholder="CTF{...}"
          error={errors.flag?.message}
          {...register('flag')}
        />

        <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <input type="checkbox" className="size-4 accent-[var(--color-accent)]" {...register('published')} />
          Published (visible to players)
        </label>

        {isEdit && onUploadFile && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              Add File
            </label>
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-3.5 py-2 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]">
              <Upload className="size-4" />
              Upload file
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              Hints
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="size-3.5" />}
              onClick={() => append({ title: '', content: '', cost: 0, order: fields.length, active: true })}
            >
              Add hint
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
              <div className="flex gap-2">
                <Input placeholder="Hint title" {...register(`hints.${index}.title`)} />
                <Input
                  type="number"
                  placeholder="Cost"
                  className="w-24"
                  {...register(`hints.${index}.cost`, { valueAsNumber: true })}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove hint"
                  className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Hint content"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus-visible:outline-none"
                {...register(`hints.${index}.content`)}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create challenge'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
