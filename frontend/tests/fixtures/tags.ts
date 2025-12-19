import type { Tag, TagStats } from '@/lib/types';

export const mockTag1: Tag = {
  id: 1,
  name: 'AI',
  slug: 'ai',
  description: 'Artificial Intelligence',
  tools_count: 20,
};

export const mockTag2: Tag = {
  id: 2,
  name: 'Machine Learning',
  slug: 'machine-learning',
  description: 'ML and deep learning tools',
  tools_count: 15,
};

export const mockTag3: Tag = {
  id: 3,
  name: 'React',
  slug: 'react',
  description: 'React framework and libraries',
  tools_count: 30,
};

export const mockTag4: Tag = {
  id: 4,
  name: 'TypeScript',
  slug: 'typescript',
  description: 'TypeScript language and tools',
  tools_count: 25,
};

export const mockTag5: Tag = {
  id: 5,
  name: 'Docker',
  slug: 'docker',
  description: 'Container tools',
  tools_count: 12,
};

export const mockTag6: Tag = {
  id: 6,
  name: 'Testing',
  slug: 'testing',
  description: 'Testing frameworks and tools',
  tools_count: 18,
};

export const mockTagEmpty: Tag = {
  id: 7,
  name: 'Empty Tag',
  slug: 'empty-tag',
  description: 'A tag with no tools',
  tools_count: 0,
};

export const mockTags: Tag[] = [
  mockTag1,
  mockTag2,
  mockTag3,
  mockTag4,
  mockTag5,
  mockTag6,
  mockTagEmpty,
];

export const mockTagStats: TagStats = {
  total: 7,
  with_tools: 6,
  without_tools: 1,
  avg_tools_per_tag: 17.14,
  top_tags: [
    { id: 3, name: 'React', slug: 'react', tools_count: 30 },
    { id: 4, name: 'TypeScript', slug: 'typescript', tools_count: 25 },
    { id: 1, name: 'AI', slug: 'ai', tools_count: 20 },
  ],
};
