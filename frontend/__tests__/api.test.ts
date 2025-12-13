import { describe, beforeEach, test, vi, expect } from 'vitest';
import { getCsrf, login, uploadToolScreenshots } from '../lib/api';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/constants';

describe('lib/api basic smoke tests', () => {
  beforeEach(() => {
    // Ensure document.cookie can be read by getCookie
    (global as unknown as { document?: Document }).document = document;
  });

  test('getCsrf calls CSRF endpoint and reads cookie', async () => {
    // mock fetch to return ok
    (global as unknown as { fetch?: ReturnType<typeof vi.fn> }).fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    // simulate cookie set by server
    document.cookie = 'XSRF-TOKEN=test-token-123';

    const res = await getCsrf();
    const g = global as unknown as { fetch?: ReturnType<typeof vi.fn> };
    expect(g.fetch).toHaveBeenCalled();
    const calledUrl = g.fetch!.mock.calls[0][0];
    expect(String(calledUrl)).toContain(API_BASE_URL.replace(/\/api\/?$/, '') + API_ENDPOINTS.CSRF);
    expect(res.ok).toBe(true);
  });

  test('login posts credentials', async () => {
    // login returns an AuthResponse { user: { id } }
    (global as unknown as { fetch?: ReturnType<typeof vi.fn> }).fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({ user: { id: 1 } }) });
    const auth = await login({ email: 'a@example.com', password: 'secret' });
    const g2 = global as unknown as { fetch?: ReturnType<typeof vi.fn> };
    expect(g2.fetch).toHaveBeenCalled();
    // find the POST call (login may call getCsrf first)
    const calls = g2.fetch!.mock.calls as unknown[];
    const postCall = calls.find((args: unknown) =>
      Array.isArray(args) ? (args[1] as Record<string, unknown>)?.method === 'POST' : false,
    );
    expect(postCall).toBeDefined();
    expect(auth).toBeDefined();
    // auth.user should be present according to AuthResponse
    expect(auth.user).toBeDefined();
    expect((auth.user as { id: number }).id).toBe(1);
  });

  test('uploadToolScreenshots sends FormData body', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({ screenshots: [] }) });
    (global as unknown as { fetch?: ReturnType<typeof vi.fn> }).fetch = mockFetch;

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const res = await uploadToolScreenshots(42, [file]);

    expect(mockFetch).toHaveBeenCalled();
    const uploadCall = mockFetch.mock.calls.find(
      (c: unknown[]) => typeof c[0] === 'string' && String(c[0]).includes('/screenshots'),
    ) as unknown[] | undefined;
    const body = uploadCall
      ? (uploadCall[1] as Record<string, unknown> | undefined)?.body
      : undefined;
    // body should be a FormData-like instance (has append)
    expect(
      Boolean(body) && typeof (body as unknown as { append?: unknown }).append === 'function',
    ).toBe(true);
    expect(res).toBeDefined();
    expect(Array.isArray((res as { screenshots?: unknown }).screenshots)).toBe(true);
  });
});
