/**
 * Shared style utilities and common CSS patterns
 * Reduces inline style duplication across components
 * @module styles
 */

/**
 * Common style objects for consistent UI
 * @constant {Object}
 * @property {Object} pageContainer - Centered narrow container for auth pages
 * @property {Object} contentContainer - Wide container for main content
 * @property {Object} pageTitle - Large page heading style
 * @property {Object} pageSubtitle - Secondary heading style
 * @property {Object} sectionHeader - Centered section header wrapper
 * @property {Object} form - Vertical form layout with gap
 * @property {Object} linkText - Styled link text
 * @property {Object} footerText - Footer text style
 * @property {Object} flexCenter - Center items with flexbox
 * @property {Object} flexBetween - Space between items with flexbox
 * @property {Object} flexColumn - Vertical flex layout
 * @example
 * import { styles } from '@/lib/styles';
 * <div style={styles.pageContainer}>...</div>
 */
export const styles = {
  // Containers
  pageContainer: {
    maxWidth: 480,
    margin: '60px auto',
    padding: '0 20px'
  },
  
  contentContainer: {
    maxWidth: 1100,
    margin: '0 auto'
  },

  // Text styles
  pageTitle: {
    margin: 0,
    marginBottom: 8,
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text-primary)'
  },

  pageSubtitle: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: 16
  },

  sectionHeader: {
    textAlign: 'center',
    marginBottom: 32
  },

  // Forms
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },

  // Links
  linkText: {
    color: 'var(--accent-primary)',
    fontWeight: 500,
    textDecoration: 'none'
  },

  // Footer text
  footerText: {
    textAlign: 'center',
    marginTop: 24,
    color: 'var(--text-secondary)',
    fontSize: 14
  },

  // Flex utilities
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  }
};

/**
 * Common CSS transition values
 * @constant {Object}
 * @property {string} default - Standard 0.2s transition
 * @property {string} slow - Slower 0.3s transition
 */
export const transition = {
  default: 'all 0.2s ease',
  slow: 'all 0.3s ease'
};
