import { describe, test, expect } from 'vitest';
import * as utils from '../../lib/utils';

describe('utils helpers', () => {
  test('formatDate and formatRelativeTime', () => {
    const d = new Date('2020-01-01T00:00:00Z');
    expect(utils.formatDate(d)).toContain('2020');
    // relative for a recent date
    const now = new Date();
    expect(utils.formatRelativeTime(now)).toBe('just now');
  });

  test('truncate and capitalize', () => {
    expect(utils.truncate('short', 10)).toBe('short');
    expect(utils.truncate('very long text here', 5)).toContain('...');
    expect(utils.capitalize('hello world')).toBe('Hello World');
  });

  test('formatNumber and getInitials', () => {
    expect(utils.formatNumber(1234567)).toBe('1,234,567');
    expect(utils.getInitials('john doe')).toBe('JD');
  });

  test('sleep resolves and isEmpty/deepClone/groupBy', async () => {
    const start = Date.now();
    await utils.sleep(1);
    expect(Date.now()).toBeGreaterThanOrEqual(start);

    expect(utils.isEmpty({})).toBe(true);
    const obj = { a: 1 };
    const clone = utils.deepClone(obj);
    expect(clone).toEqual(obj);

    const grouped = utils.groupBy(
      [
        { id: 1, type: 'x' },
        { id: 2, type: 'x' },
      ],
      'type',
    );
    expect(grouped.x.length).toBe(2);
  });
});
