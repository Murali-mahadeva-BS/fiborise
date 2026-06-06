import { describe, expect, it } from '@jest/globals';

import { parseHabitForm } from './habit-form';

describe('habit form validation', () => {
  it('accepts decimal baseline amounts and free-text units', () => {
    const result = parseHabitForm({
      name: 'Walking',
      icon: '🚶',
      baseAmount: '0.5',
      unit: 'km',
      description: 'Evening walk',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: 'Walking',
        icon: '🚶',
        baseAmount: 0.5,
        unit: 'km',
        description: 'Evening walk',
        reminderEnabled: false,
      },
    });
  });

  it('rejects empty names and non-positive baselines', () => {
    const result = parseHabitForm({
      name: '',
      icon: '🏃',
      baseAmount: '0',
      unit: 'm',
      description: '',
    });

    expect(result).toMatchObject({
      ok: false,
      errors: {
        name: 'Name is required',
        baseAmount: 'Baseline must be greater than zero',
      },
    });
  });
});
