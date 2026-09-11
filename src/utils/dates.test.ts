import { describe, expect, it } from 'vitest';
import { eachDayOfMonthGrid, formatDateOnlyLocal } from '@/utils/dates';

describe('eachDayOfMonthGrid', () => {
  it('includes the last week of September 2026', () => {
    const days = eachDayOfMonthGrid(new Date(2026, 8, 1)).map(formatDateOnlyLocal);

    expect(days[0]).toBe('2026-08-31');
    expect(days).toContain('2026-09-27');
    expect(days).toContain('2026-09-28');
    expect(days).toContain('2026-09-30');
    expect(days.at(-1)).toBe('2026-10-04');
    expect(days.filter((day) => day.startsWith('2026-09'))).toHaveLength(30);
  });

  it('still ends on the last Sunday when the month ends on Sunday', () => {
    const days = eachDayOfMonthGrid(new Date(2026, 4, 1)).map(formatDateOnlyLocal);

    expect(days[0]).toBe('2026-04-27');
    expect(days.at(-1)).toBe('2026-05-31');
    expect(days.filter((day) => day.startsWith('2026-05'))).toHaveLength(31);
  });
});
