export const defaultReminderTime = '08:00';

const reminderTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidReminderTime(value: string): boolean {
  return reminderTimePattern.test(value.trim());
}

export function parseReminderTime(value: string): { hour: number; minute: number } {
  const match = value.trim().match(reminderTimePattern);

  if (!match) {
    throw new Error('Reminder time must use HH:mm format');
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function getHabitReminderIdentifier(habitId: string): string {
  return `habit-reminder-${habitId}`;
}

export function reminderTimeToDate(value: string): Date {
  const { hour, minute } = parseReminderTime(value);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date;
}

export function timeFromDate(date: Date): string {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${hour}:${minute}`;
}

export function formatReminderTimeLabel(value: string): string {
  const { hour, minute } = parseReminderTime(value);
  const period = hour >= 12 ? 'PM' : 'AM';
  const twelveHour = hour % 12 || 12;

  return `${twelveHour}:${String(minute).padStart(2, '0')} ${period}`;
}
