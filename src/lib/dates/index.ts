export type LocalDate = string;

export function getTodayLocalDate(now = new Date()): LocalDate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatIsoTimestamp(now = new Date()): string {
  return now.toISOString();
}

export function formatDisplayDate(localDate: LocalDate): string {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(parseLocalDate(localDate));
}

export function formatMonthYear(localDate: LocalDate): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(parseLocalDate(localDate));
}

export function parseLocalDate(localDate: LocalDate): Date {
  const [year, month, day] = localDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toLocalDate(date: Date): LocalDate {
  return getTodayLocalDate(date);
}

export function addLocalDays(localDate: LocalDate, days: number): LocalDate {
  const date = parseLocalDate(localDate);
  date.setDate(date.getDate() + days);

  return toLocalDate(date);
}

export function compareLocalDates(left: LocalDate, right: LocalDate): number {
  return left.localeCompare(right);
}

export function getDaysBetween(
  startDate: LocalDate,
  endDate: LocalDate,
): number {
  const start = parseLocalDate(startDate).getTime();
  const end = parseLocalDate(endDate).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.round((end - start) / dayMs);
}

export function getMonthStart(localDate: LocalDate): LocalDate {
  const date = parseLocalDate(localDate);
  date.setDate(1);

  return toLocalDate(date);
}

export function getMonthEnd(localDate: LocalDate): LocalDate {
  const date = parseLocalDate(localDate);
  date.setMonth(date.getMonth() + 1, 0);

  return toLocalDate(date);
}

export function addLocalMonths(
  localDate: LocalDate,
  months: number,
): LocalDate {
  const date = parseLocalDate(localDate);
  const originalDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  date.setDate(Math.min(originalDay, lastDayOfMonth));

  return toLocalDate(date);
}

export function getMondayWeekStart(localDate: LocalDate): LocalDate {
  const date = parseLocalDate(localDate);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);

  return toLocalDate(date);
}
