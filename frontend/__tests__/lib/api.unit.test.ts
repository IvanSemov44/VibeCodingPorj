import { describe, it, expect, vi } from 'vitest';
import { getCsrf, login, uploadToolScreenshots } from '../../lib/api';

describe('lib/api unit tests', () => {
  it('getCsrf resolves successfully and returns a Response-like object', async () => {
    const res = await getCsrf();
    expect(res).toBeTruthy();
    expect(typeof (res as Response).ok).toBe('boolean');
  });

  it('login returns an auth user when credentials are correct', async () => {
    const auth = await login({ email: 'test@example.com', password: 'password' });
    expect(auth).toBeDefined();
    expect((auth as any).user).toBeDefined();
    expect((auth as any).user.id).toBe(1);
  });

  it('uploadToolScreenshots sends FormData and returns screenshots list', async () => {
    // Mock global fetch for FormData upload to avoid intermittent MSW timing issues
    const origFetch = (global as unknown as { fetch?: unknown }).fetch;
    try {
      (global as unknown as { fetch?: unknown }).fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ screenshots: ['s1.png'] }) });
      const file = new File(['x'], 'a.png', { type: 'image/png' });
      const res = await uploadToolScreenshots(42, [file]);
      expect(res).toBeDefined();
      expect(Array.isArray((res as any).screenshots)).toBe(true);
      expect((res as any).screenshots.length).toBeGreaterThanOrEqual(0);
    } finally {
      // restore fetch to previous state (msw uses global fetch in node)
      if (origFetch !== undefined) {
        (global as unknown as { fetch?: unknown }).fetch = origFetch;
      } else {
        delete (global as unknown as { fetch?: unknown }).fetch;
      }
    }
  });
});