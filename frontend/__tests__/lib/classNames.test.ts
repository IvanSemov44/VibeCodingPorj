import { describe, expect, test } from 'vitest';
import { cx } from '../../lib/classNames';

describe('cx utility', () => {
  test('joins truthy classes and filters falsy', () => {
    expect(cx('a', false && 'b', undefined, 'c')).toBe('a c');
  });
});
