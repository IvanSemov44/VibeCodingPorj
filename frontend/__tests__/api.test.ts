import { getCsrf, login, uploadToolScreenshots } from '../lib/api';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/constants';

describe('lib/api basic smoke tests', () => {
  beforeEach(() => {
    // Ensure document.cookie can be read by getCookie
    (global as any).document = document;
  });

  test('getCsrf calls CSRF endpoint and reads cookie', async () => {
    // mock fetch to return ok
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    // simulate cookie set by server
    document.cookie = 'XSRF-TOKEN=test-token-123';

    const res = await getCsrf();
    expect((global as any).fetch).toHaveBeenCalled();
    const calledUrl = (global as any).fetch.mock.calls[0][0];
    expect(String(calledUrl)).toContain(API_BASE_URL.replace(/\/api\/?$/, '') + API_ENDPOINTS.CSRF);
    expect(res.ok).toBe(true);
  });

  test('login posts credentials', async () => {
    // login returns an AuthResponse { user: { id } }
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ user: { id: 1 } }) });
    const auth = await login({ email: 'a@example.com', password: 'secret' });
    expect((global as any).fetch).toHaveBeenCalled();
    // find the POST call (login may call getCsrf first)
    const calls = (global as any).fetch.mock.calls;
    const postCall = calls.find((args: any[]) => args[1] && args[1].method === 'POST');
    expect(postCall).toBeDefined();
    expect(auth).toBeDefined();
    // auth.user should be present according to AuthResponse
    expect(auth.user).toBeDefined();
    expect((auth.user as any).id).toBe(1);
  });

  test('uploadToolScreenshots sends FormData body', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ screenshots: [] }) });
    (global as any).fetch = mockFetch;

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const res = await uploadToolScreenshots(42, [file]);

    expect(mockFetch).toHaveBeenCalled();
    const body = mockFetch.mock.calls[0][1].body;
    // body should be a FormData instance
    expect(body instanceof FormData).toBe(true);
    expect(res).toBeDefined();
    expect(Array.isArray((res as any).screenshots)).toBe(true);
  });
});
