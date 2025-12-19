import { rest } from 'msw';
import { mockTags, mockTag1, mockTagStats } from '../../fixtures';
import type { Tag, TagCreatePayload, TagUpdatePayload } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// In-memory tags storage for testing
let tags = [...mockTags];

export const tagsHandlers = [
  // Get tags list
  rest.get(`${API_BASE_URL}/api/tags`, (req, res, ctx) => {
    return res(ctx.json({ data: tags }));
  }),

  // Get single tag
  rest.get(`${API_BASE_URL}/api/tags/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const tag = tags.find((t) => t.id === Number(id) || t.slug === id);

    if (!tag) {
      return res(ctx.status(404), ctx.json({ message: 'Tag not found' }));
    }

    return res(ctx.json(tag));
  }),

  // Create tag
  rest.post(`${API_BASE_URL}/api/tags`, async (req, res, ctx) => {
    const body = await req.json<TagCreatePayload>();

    // Validate required fields
    if (!body.name) {
      return res(
        ctx.status(422),
        ctx.json({
          message: 'Validation failed',
          errors: { name: ['Name is required'] },
        }),
      );
    }

    // Check for duplicate slug
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-');
    if (tags.some((t) => t.slug === slug)) {
      return res(
        ctx.status(422),
        ctx.json({
          message: 'Validation failed',
          errors: { slug: ['Slug already exists'] },
        }),
      );
    }

    // Create new tag
    const newTag: Tag = {
      id: tags.length + 1,
      name: body.name,
      slug,
      description: body.description || undefined,
      tools_count: 0,
    };

    tags.push(newTag);

    return res(ctx.status(201), ctx.json(newTag));
  }),

  // Update tag
  rest.put(`${API_BASE_URL}/api/tags/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json<TagUpdatePayload>();
    const tagIndex = tags.findIndex((t) => t.id === Number(id));

    if (tagIndex === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Tag not found' }));
    }

    // Update tag
    const updatedTag = {
      ...tags[tagIndex],
      ...body,
    };

    tags[tagIndex] = updatedTag;

    return res(ctx.json(updatedTag));
  }),

  // Delete tag
  rest.delete(`${API_BASE_URL}/api/tags/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const tagIndex = tags.findIndex((t) => t.id === Number(id));

    if (tagIndex === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Tag not found' }));
    }

    tags.splice(tagIndex, 1);

    return res(ctx.json({ message: 'Tag deleted successfully' }));
  }),

  // Get tag stats
  rest.get(`${API_BASE_URL}/api/admin/tags/stats`, (req, res, ctx) => {
    return res(ctx.json(mockTagStats));
  }),
];

// Helper to reset tags to initial state (useful for tests)
export function resetTags() {
  tags = [...mockTags];
}
