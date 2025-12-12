/**
 * Utility to build className strings, filtering out falsy values
 *
 * Similar to the 'classnames' package but lightweight
 *
 * @example
 * cx('button', isActive && 'active', 'button-large')
 * // Returns: 'button active button-large' (if isActive is true)
 *
 * @param classes - Array of class names (strings) or conditional expressions
 * @returns Concatenated className string with falsy values filtered out
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
