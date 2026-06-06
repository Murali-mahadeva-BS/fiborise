import { z } from 'zod';

import { CreateHabitInput } from './types';

export const habitIconOptions = ['🏃', '🧘', '📚', '🚶', '💪', '🙏'];

export type HabitFormValues = {
  name: string;
  icon: string;
  baseAmount: string;
  unit: string;
  description: string;
};

export type HabitFormErrors = Partial<Record<keyof HabitFormValues, string>>;

const habitFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
  icon: z.string().trim().min(1, 'Choose an icon'),
  baseAmount: z.coerce
    .number({ error: 'Baseline must be a number' })
    .positive('Baseline must be greater than zero')
    .finite('Baseline must be a number'),
  unit: z.string().trim().min(1, 'Unit is required').max(32, 'Unit is too long'),
  description: z.string().trim().max(240, 'Description is too long').optional(),
});

export function parseHabitForm(values: HabitFormValues):
  | { ok: true; data: CreateHabitInput }
  | { ok: false; errors: HabitFormErrors } {
  const result = habitFormSchema.safeParse(values);

  if (!result.success) {
    const errors: HabitFormErrors = {};

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as keyof HabitFormValues | undefined;
      if (fieldName && !errors[fieldName]) {
        errors[fieldName] = issue.message;
      }
    }

    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: result.data.name,
      icon: result.data.icon,
      baseAmount: result.data.baseAmount,
      unit: result.data.unit,
      description: result.data.description || undefined,
      reminderEnabled: false,
    },
  };
}
