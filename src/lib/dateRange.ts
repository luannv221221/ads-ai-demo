export interface DateRange {
  start: string;
  end: string;
}

function toDateInputValue(date: Date) {
  return date.toISOString().split('T')[0];
}

export function createLastDaysDateRange(days: number): DateRange {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
}
