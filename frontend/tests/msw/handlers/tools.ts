import { http, HttpResponse } from 'msw';
import {
  mockTools,
  mockTool1,
  mockTool2,
  mockTool3,
  mockApprovedTools,
  mockPendingTools,
} from '../../fixtures';
import type { Tool, ToolCreatePayload, ToolUpdatePayload, ApiListResponse } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// In-memory tools storage for testing
let tools = [...mockTools];

export const toolsHandlers = [
  // Get tools list
  http.get(`${API_BASE_URL}/api/tools`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '10');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');

    // Filter tools
    let filteredTools = [...tools];

    if (status) {
      filteredTools = filteredTools.filter((tool) => tool.status === status);
    }

    if (category) {
      // In a real app, you'd filter by category
      filteredTools = filteredTools;
    }

    if (tag) {
      // In a real app, you'd filter by tag
      filteredTools = filteredTools;
    }

    if (search) {
      filteredTools = filteredTools.filter(
        (tool) =>
          tool.name?.toLowerCase().includes(search.toLowerCase()) ||
          tool.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Paginate
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedTools = filteredTools.slice(start, end);

    const response: ApiListResponse<Tool> = {
      data: paginatedTools,
      meta: {
        current_page: page,
        last_page: Math.ceil(filteredTools.length / perPage),
        per_page: perPage,
        total: filteredTools.length,
        from: start + 1,
        to: Math.min(end, filteredTools.length),
      },
    };

    return HttpResponse.json(response);
  }),

  // Get single tool
  http.get(`${API_BASE_URL}/api/tools/:id`, ({ params }) => {
    const { id } = params;
    const tool = tools.find((t) => t.id === Number(id));

    if (!tool) {
      return HttpResponse.json({ message: 'Tool not found' }, { status: 404 });
    }

    return HttpResponse.json(tool);
  }),

  // Create tool
  http.post<never, ToolCreatePayload>(`${API_BASE_URL}/api/tools`, async ({ request }) => {
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

    // Create new tool
    const newTool: Tool = {
      id: tools.length + 1,
      name: body.name,
      description: body.description || null,
      url: body.url || null,
      docs_url: body.docs_url || null,
      usage: body.usage || null,
      examples: body.examples || null,
      difficulty: body.difficulty || 'beginner',
      screenshots: body.screenshots || [],
      average_rating: 0,
      rating_count: 0,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      status: 'pending',
      is_pending: true,
      is_approved: false,
    };

    tools.push(newTool);

    return HttpResponse.json(newTool, { status: 201 });
  }),

  // Update tool
  http.put<{ id: string }, ToolUpdatePayload>(
    `${API_BASE_URL}/api/tools/:id`,
    async ({ params, request }) => {
      const { id } = params;
      const body = await request.json();
      const toolIndex = tools.findIndex((t) => t.id === Number(id));

      if (toolIndex === -1) {
        return HttpResponse.json({ message: 'Tool not found' }, { status: 404 });
      }

      // Update tool
      const updatedTool = {
        ...tools[toolIndex],
        ...body,
      };

      tools[toolIndex] = updatedTool;

      return HttpResponse.json(updatedTool);
    },
  ),

  // Delete tool
  http.delete(`${API_BASE_URL}/api/tools/:id`, ({ params }) => {
    const { id } = params;
    const toolIndex = tools.findIndex((t) => t.id === Number(id));

    if (toolIndex === -1) {
      return HttpResponse.json({ message: 'Tool not found' }, { status: 404 });
    }

    tools.splice(toolIndex, 1);

    return HttpResponse.json({ message: 'Tool deleted successfully' }, { status: 200 });
  }),

  // Upload screenshots
  http.post(`${API_BASE_URL}/api/tools/:id/screenshots`, async ({ params, request }) => {
    const { id } = params;
    const tool = tools.find((t) => t.id === Number(id));

    if (!tool) {
      return HttpResponse.json({ message: 'Tool not found' }, { status: 404 });
    }

    // Mock file upload - just add some dummy URLs
    const newScreenshots = [
      'https://example.com/screenshots/new-1.jpg',
      'https://example.com/screenshots/new-2.jpg',
    ];

    const updatedScreenshots = [...(tool.screenshots || []), ...newScreenshots];

    return HttpResponse.json({ screenshots: updatedScreenshots });
  }),

  // Delete screenshot
  http.delete(`${API_BASE_URL}/api/tools/:id/screenshots`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const tool = tools.find((t) => t.id === Number(id));

    if (!tool) {
      return HttpResponse.json({ message: 'Tool not found' }, { status: 404 });
    }

    // Remove the screenshot URL
    const updatedScreenshots = (tool.screenshots || []).filter((url) => url !== body.url);

    return HttpResponse.json({ screenshots: updatedScreenshots });
  }),
];

// Helper to reset tools to initial state (useful for tests)
export function resetTools() {
  tools = [...mockTools];
}
