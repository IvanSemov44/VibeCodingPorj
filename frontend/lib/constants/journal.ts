/**
 * Journal feature constants
 * Centralized configuration for mood options, tags, and journal-related data
 */

export const MOOD_OPTIONS = [
  { value: 'excited', emoji: '🚀', label: 'Excited', color: '#f59e0b' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { value: 'tired', emoji: '😴', label: 'Tired', color: '#8b5cf6' },
  { value: 'victorious', emoji: '🏆', label: 'Victorious', color: '#ef4444' }
] as const;

export const TAG_OPTIONS = [
  'Backend',
  'Frontend',
  'Bug Fix',
  'Feature Quest',
  'Refactor',
  'Docs',
  'Testing',
  'Design',
  'Learning',
  'Team Collab'
] as const;

// Type exports for type-safe usage
export type MoodOption = typeof MOOD_OPTIONS[number];
export type MoodValue = typeof MOOD_OPTIONS[number]['value'];
export type TagValue = typeof TAG_OPTIONS[number];

// Default values
export const DEFAULT_XP = 50;
export const MIN_XP = 1;
export const MAX_XP = 100;

// Validation messages
export const VALIDATION_MESSAGES = {
  TITLE_REQUIRED: 'Title is required',
  CONTENT_REQUIRED: 'Content is required',
  MOOD_REQUIRED: 'Please select a mood'
} as const;
