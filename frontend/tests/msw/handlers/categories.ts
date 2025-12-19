import { rest } from 'msw';
import { mockCategories, mockCategory1, mockCategoryStats } from '../../fixtures';
import type { Category, CategoryCreatePayload, CategoryUpdatePayload } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

// In-memory categories storage for testing
let categories = [...mockCategories];

export const categoriesHandlers = [
  // Get categories list
  rest.get(`${API_BASE_URL}/api/categories`, (req, res, ctx) => {
    return res(ctx.json({ data: categories }));
  }),

  // Get single category
  rest.get(`${API_BASE_URL}/api/categories/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const category = categories.find((c) => c.id === Number(id) || c.slug === id);

    if (!category) {
      return res(ctx.status(404), ctx.json({ message: 'Category not found' }));
    }

    return res(ctx.json(category));
  }),

  // Create category
  rest.post(`${API_BASE_URL}/api/categories`, async (req, res, ctx) => {
    const body = await req.json<CategoryCreatePayload>();

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
    if (categories.some((c) => c.slug === slug)) {
      return res(
        ctx.status(422),
        ctx.json({
          message: 'Validation failed',
          errors: { slug: ['Slug already exists'] },
        }),
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

    return res(ctx.status(201), ctx.json(newCategory));
  }),

  // Update category
  rest.put(`${API_BASE_URL}/api/categories/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json<CategoryUpdatePayload>();
    const categoryIndex = categories.findIndex((c) => c.id === Number(id));

    if (categoryIndex === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Category not found' }));
    }

    // Update category
    const updatedCategory = {
      ...categories[categoryIndex],
      ...body,
    };

    categories[categoryIndex] = updatedCategory;

    return res(ctx.json(updatedCategory));
  }),

  // Delete category
  rest.delete(`${API_BASE_URL}/api/categories/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const categoryIndex = categories.findIndex((c) => c.id === Number(id));

    if (categoryIndex === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Category not found' }));
    }

    categories.splice(categoryIndex, 1);

    return res(ctx.json({ message: 'Category deleted successfully' }));
  }),

  // Get category stats
  rest.get(`${API_BASE_URL}/api/admin/categories/stats`, (req, res, ctx) => {
    return res(ctx.json(mockCategoryStats));
  }),
];

// Helper to reset categories to initial state (useful for tests)
export function resetCategories() {
  categories = [...mockCategories];
}
