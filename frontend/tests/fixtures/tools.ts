import type { Tool, ToolCreatePayload, ToolUpdatePayload } from '@/lib/types';
import { mockCategory1, mockCategory2, mockCategory3 } from './categories';
import { mockTag1, mockTag2, mockTag3, mockTag4 } from './tags';
import { mockUser, mockUser2 } from './users';

export const mockTool1: Tool = {
  id: 1,
  name: 'ChatGPT',
  description: 'AI-powered conversational assistant',
  url: 'https://chat.openai.com',
  docs_url: 'https://platform.openai.com/docs',
  usage: 'Use for natural language processing and conversation',
  examples: 'Code generation, writing assistance, Q&A',
  difficulty: 'beginner',
  screenshots: [
    'https://example.com/screenshots/chatgpt-1.jpg',
    'https://example.com/screenshots/chatgpt-2.jpg',
  ],
  average_rating: 4.8,
  rating_count: 150,
  user_rating: { score: 5 },
  slug: 'chatgpt',
  status: 'approved',
  is_pending: false,
  is_approved: true,
  user: { id: mockUser.id, name: mockUser.name },
  author_name: mockUser.name,
};

export const mockTool2: Tool = {
  id: 2,
  name: 'VS Code',
  description: 'Popular code editor from Microsoft',
  url: 'https://code.visualstudio.com',
  docs_url: 'https://code.visualstudio.com/docs',
  usage: 'Use for coding in multiple languages',
  examples: 'Web development, Python scripting, debugging',
  difficulty: 'intermediate',
  screenshots: ['https://example.com/screenshots/vscode-1.jpg'],
  average_rating: 4.9,
  rating_count: 200,
  user_rating: { score: 5 },
  slug: 'vscode',
  status: 'approved',
  is_pending: false,
  is_approved: true,
  user: { id: mockUser2.id, name: mockUser2.name },
  author_name: mockUser2.name,
};

export const mockTool3: Tool = {
  id: 3,
  name: 'Docker',
  description: 'Containerization platform',
  url: 'https://www.docker.com',
  docs_url: 'https://docs.docker.com',
  usage: 'Use for containerizing applications',
  examples: 'Microservices, development environments',
  difficulty: 'advanced',
  screenshots: ['https://example.com/screenshots/docker-1.jpg'],
  average_rating: 4.5,
  rating_count: 120,
  slug: 'docker',
  status: 'approved',
  is_pending: false,
  is_approved: true,
  user: { id: mockUser.id, name: mockUser.name },
  author_name: mockUser.name,
};

export const mockToolPending: Tool = {
  id: 4,
  name: 'Pending Tool',
  description: 'A tool waiting for approval',
  url: 'https://pending-tool.com',
  docs_url: null,
  usage: null,
  examples: null,
  difficulty: 'beginner',
  screenshots: [],
  average_rating: 0,
  rating_count: 0,
  slug: 'pending-tool',
  status: 'pending',
  is_pending: true,
  is_approved: false,
  user: { id: mockUser2.id, name: mockUser2.name },
  author_name: mockUser2.name,
};

export const mockToolRejected: Tool = {
  id: 5,
  name: 'Rejected Tool',
  description: 'A tool that was rejected',
  url: 'https://rejected-tool.com',
  docs_url: null,
  usage: null,
  examples: null,
  difficulty: 'beginner',
  screenshots: [],
  average_rating: 0,
  rating_count: 0,
  slug: 'rejected-tool',
  status: 'rejected',
  is_pending: false,
  is_approved: false,
  user: { id: mockUser.id, name: mockUser.name },
  author_name: mockUser.name,
};

export const mockToolNoRating: Tool = {
  id: 6,
  name: 'New Tool',
  description: 'A newly added tool with no ratings yet',
  url: 'https://new-tool.com',
  docs_url: 'https://new-tool.com/docs',
  usage: 'Use for something',
  examples: 'Example usage',
  difficulty: 'intermediate',
  screenshots: [],
  average_rating: 0,
  rating_count: 0,
  slug: 'new-tool',
  status: 'approved',
  is_pending: false,
  is_approved: true,
  user: { id: mockUser.id, name: mockUser.name },
  author_name: mockUser.name,
};

export const mockTools: Tool[] = [
  mockTool1,
  mockTool2,
  mockTool3,
  mockToolPending,
  mockToolRejected,
  mockToolNoRating,
];

export const mockApprovedTools: Tool[] = [mockTool1, mockTool2, mockTool3, mockToolNoRating];

export const mockPendingTools: Tool[] = [mockToolPending];

export const mockRejectedTools: Tool[] = [mockToolRejected];

// Tool create payload
export const mockToolCreatePayload: ToolCreatePayload = {
  name: 'New Test Tool',
  url: 'https://test-tool.com',
  docs_url: 'https://test-tool.com/docs',
  description: 'A test tool for testing',
  usage: 'Use it for testing',
  examples: 'Test example 1, Test example 2',
  difficulty: 'beginner',
  categories: [mockCategory1.id, mockCategory2.id],
  tags: [mockTag1.name, mockTag2.name],
  screenshots: ['https://example.com/screenshot.jpg'],
};

// Tool update payload
export const mockToolUpdatePayload: ToolUpdatePayload = {
  name: 'Updated Tool Name',
  description: 'Updated description',
  difficulty: 'intermediate',
};

// Minimal tool create payload
export const mockMinimalToolCreatePayload: ToolCreatePayload = {
  name: 'Minimal Tool',
};

// Invalid tool create payload (missing required field)
export const mockInvalidToolCreatePayload = {
  url: 'https://invalid.com',
  description: 'Missing name field',
} as ToolCreatePayload;
