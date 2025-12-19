import { http, HttpResponse } from 'msw';
import { mockCategories, mockCategory1, mockCategoryStats } from '../../fixtures';
import type { Category, CategoryCreatePayload, CategoryUpdatePayload } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// In-memory categories storage for testing
let categories = [...mockCategories];

export const categoriesHandlers = [
  // Get categories list
  http.get(`${API_BASE_URL}/api/categories`, () => {
    return HttpResponse.json({ data: categories });
  }),

  // Get single category
  http.get(`${API_BASE_URL}/api/categories/:id`, ({ params }) => {
    const { id } = params;
    const category = categories.find((c) => c.id === Number(id) || c.slug === id);

    if (!category) {
      return HttpResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return HttpResponse.json(category);
  }),

  // Create category
  http.post<never, CategoryCreatePayload>(
    `${API_BASE_URL}/api/categories`,
    async ({ request }) => {
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
      if (categories.some((c) => c.slug === slug)) {
        return HttpResponse.json(
          {
            message: 'Validation failed',
            errors: { slug: ['Slug already exists'] },
          },
          { status: 422 },
        );
      }

      // Create new category
      const newCategory: Category = {
        id: categories.length + 1,
        name: body.name,
        slug,
        description: body.description || undefined,
        tools_count: 0,
      };

      categories.push(newCategory);

      return HttpResponse.json(newCategory, { status: 201 });
    },
  ),

  // Update category
  http.put<{ id: string }, CategoryUpdatePayload>(
    `${API_BASE_URL}/api/categories/:id`,
    async ({ params, request }) => {
      const { id } = params;
      const body = await request.json();
      const categoryIndex = categories.findIndex((c) => c.id === Number(id));

      if (categoryIndex === -1) {
        return HttpResponse.json({ message: 'Category not found' }, { status: 404 });
      }

      // Update category
      const updatedCategory = {
        ...categories[categoryIndex],
        ...body,
      };

      categories[categoryIndex] = updatedCategory;

      return HttpResponse.json(updatedCategory);
    },
  ),

  // Delete category
  http.delete(`${API_BASE_URL}/api/categories/:id`, ({ params }) => {
    const { id } = params;
    const categoryIndex = categories.findIndex((c) => c.id === Number(id));

    if (categoryIndex === -1) {
      return HttpResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    categories.splice(categoryIndex, 1);

    return HttpResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  }),

  // Get category stats
  http.get(`${API_BASE_URL}/api/admin/categories/stats`, () => {
    return HttpResponse.json(mockCategoryStats);
  }),
];

// Helper to reset categories to initial state (useful for tests)
export function resetCategories() {
  categories = [...mockCategories];
}
