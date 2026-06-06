export type LocalDate = string;

export function getTodayLocalDate(now = new Date()): LocalDate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatIsoTimestamp(now = new Date()): string {
  return now.toISOString();
}

export function formatDisplayDate(localDate: LocalDate): string {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
