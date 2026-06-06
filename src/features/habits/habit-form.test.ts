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
      reminderEnabled: true,
      reminderTime: '18:30',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: 'Walking',
        icon: '🚶',
        baseAmount: 0.5,
        unit: 'km',
        description: 'Evening walk',
        reminderEnabled: true,
        reminderTime: '18:30',
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
      reminderEnabled: false,
      reminderTime: '08:00',
    });

    expect(result).toMatchObject({
      ok: false,
      errors: {
        name: 'Name is required',
        baseAmount: 'Baseline must be greater than zero',
      },
    });
  });

  it('requires HH:mm time when reminders are enabled', () => {
    const result = parseHabitForm({
      name: 'Meditation',
      icon: '🧘',
      baseAmount: '5',
      unit: 'min',
      description: '',
      reminderEnabled: true,
      reminderTime: '8am',
    });

    expect(result).toMatchObject({
      ok: false,
      errors: {
        reminderTime: 'Use HH:mm format',
      },
    });
  });
});
