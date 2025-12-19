import { http, HttpResponse } from 'msw';
import { mockTags, mockTag1, mockTagStats } from '../../fixtures';
import type { Tag, TagCreatePayload, TagUpdatePayload } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// In-memory tags storage for testing
let tags = [...mockTags];

export const tagsHandlers = [
  // Get tags list
  http.get(`${API_BASE_URL}/api/tags`, () => {
    return HttpResponse.json({ data: tags });
  }),

  // Get single tag
  http.get(`${API_BASE_URL}/api/tags/:id`, ({ params }) => {
    const { id } = params;
    const tag = tags.find((t) => t.id === Number(id) || t.slug === id);

    if (!tag) {
      return HttpResponse.json({ message: 'Tag not found' }, { status: 404 });
    }

    return HttpResponse.json(tag);
  }),

  // Create tag
  http.post<never, TagCreatePayload>(`${API_BASE_URL}/api/tags`, async ({ request }) => {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          errors: { name: ['Name is required'] },
        },
        { status: 422 },
      );
    }

    // Check for duplicate slug
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-');
    if (tags.some((t) => t.slug === slug)) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          errors: { slug: ['Slug already exists'] },
        },
        { status: 422 },
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

    return HttpResponse.json(newTag, { status: 201 });
  }),

  // Update tag
  http.put<{ id: string }, TagUpdatePayload>(
    `${API_BASE_URL}/api/tags/:id`,
    async ({ params, request }) => {
      const { id } = params;
      const body = await request.json();
      const tagIndex = tags.findIndex((t) => t.id === Number(id));

      if (tagIndex === -1) {
        return HttpResponse.json({ message: 'Tag not found' }, { status: 404 });
      }

      // Update tag
      const updatedTag = {
        ...tags[tagIndex],
        ...body,
      };

      tags[tagIndex] = updatedTag;

      return HttpResponse.json(updatedTag);
    },
  ),

  // Delete tag
  http.delete(`${API_BASE_URL}/api/tags/:id`, ({ params }) => {
    const { id } = params;
    const tagIndex = tags.findIndex((t) => t.id === Number(id));

    if (tagIndex === -1) {
      return HttpResponse.json({ message: 'Tag not found' }, { status: 404 });
    }

    tags.splice(tagIndex, 1);

    return HttpResponse.json({ message: 'Tag deleted successfully' }, { status: 200 });
  }),

  // Get tag stats
  http.get(`${API_BASE_URL}/api/admin/tags/stats`, () => {
    return HttpResponse.json(mockTagStats);
  }),
];

// Helper to reset tags to initial state (useful for tests)
export function resetTags() {
  tags = [...mockTags];
}
