import type { Category, CategoryStats } from '@/lib/types';

export const mockCategory1: Category = {
  id: 1,
  name: 'AI Tools',
  slug: 'ai-tools',
  description: 'Artificial Intelligence and Machine Learning tools',
  tools_count: 15,
};

export const mockCategory2: Category = {
  id: 2,
  name: 'Web Development',
  slug: 'web-development',
  description: 'Tools for building web applications',
  tools_count: 25,
};

export const mockCategory3: Category = {
  id: 3,
  name: 'DevOps',
  slug: 'devops',
  description: 'Development and Operations tools',
  tools_count: 10,
};

export const mockCategory4: Category = {
  id: 4,
  name: 'Data Science',
  slug: 'data-science',
  description: 'Data analysis and visualization tools',
  tools_count: 8,
};

export const mockCategory5: Category = {
  id: 5,
  name: 'Design',
  slug: 'design',
  description: 'UI/UX and graphic design tools',
  tools_count: 12,
};

export const mockCategoryEmpty: Category = {
  id: 6,
  name: 'Empty Category',
  slug: 'empty-category',
  description: 'A category with no tools',
  tools_count: 0,
};

export const mockCategories: Category[] = [
  mockCategory1,
  mockCategory2,
  mockCategory3,
  mockCategory4,
  mockCategory5,
  mockCategoryEmpty,
];

export const mockCategoryStats: CategoryStats = {
  total: 6,
  with_tools: 5,
  without_tools: 1,
  avg_tools_per_category: 11.67,
  top_categories: [
    { id: 2, name: 'Web Development', slug: 'web-development', tools_count: 25 },
    { id: 1, name: 'AI Tools', slug: 'ai-tools', tools_count: 15 },
    { id: 5, name: 'Design', slug: 'design', tools_count: 12 },
  ],
};
