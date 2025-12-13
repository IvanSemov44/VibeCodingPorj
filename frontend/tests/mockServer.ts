import { rest } from 'msw';
import { setupServer } from 'msw/node';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

const handlers = [
  // CSRF endpoint
  rest.get(`${API_BASE}/sanctum/csrf-cookie`, (req, res, ctx) => {
    return res(ctx.status(204), ctx.cookie('XSRF-TOKEN', 'test-csrf'));
  }),

  // Login
  rest.post(`${API_BASE}/api/login`, async (req, res, ctx) => {
    const body = await req.json().catch(() => ({}));
    if (body.email === 'test@example.com' && body.password === 'password') {
      return res(ctx.status(200), ctx.json({ user: { id: 1, email: body.email } }));
    }
    if (body.email === 'ivan@admin.local') {
      // allow default values used by the app
      return res(ctx.status(200), ctx.json({ user: { id: 1, email: body.email } }));
    }
    return res(ctx.status(422), ctx.json({ message: 'Invalid credentials' }));
  }),

  // Current user
  rest.get(`${API_BASE}/api/user`, (req, res, ctx) => {
    const auth = req.headers.get('authorization');
    // simple simulation: if cookie present, return user
    return res(ctx.status(200), ctx.json({ id: 1, email: 'ivan@admin.local', name: 'Ivan' }));
  }),

  // Journal list
  rest.get(`${API_BASE}/api/journal`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ id: 1, title: 'Entry 1' }, { id: 2, title: 'Entry 2' }]));
  }),

  // Tools list and create
  rest.get(`${API_BASE}/api/tools`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ id: 42, name: 'Tool A' }]));
  }),

  rest.post(`${API_BASE}/api/tools/:id/screenshots`, async (req, res, ctx) => {
    // return uploaded screenshot list
    return res(ctx.status(200), ctx.json({ screenshots: ['s1.png'] }));
  }),

  // Categories/tags
  rest.get(`${API_BASE}/api/categories`, (req, res, ctx) => res(ctx.status(200), ctx.json([{ id: 1, name: 'Cat' }]))),
  rest.get(`${API_BASE}/api/tags`, (req, res, ctx) => res(ctx.status(200), ctx.json([{ id: 1, name: 'Tag' }]))),

  // Generic fallback for unknown API calls to help debugging
  rest.all(`${API_BASE}/api/:path*`, (req, res, ctx) => {
    // Return 404 for unhandled endpoints so tests fail explicitly
    return res(ctx.status(404), ctx.json({ message: 'No mock handler for this endpoint', path: req.params.path }));
  })
];

export const server = setupServer(...handlers);
export { rest };
export { handlers };
