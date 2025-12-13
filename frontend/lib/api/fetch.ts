import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import { ApiError, handleApiError } from '../errors';

const BASE = API_BASE_URL.replace(/\/api\/?$/, '');

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(^|; )' + name.replace(/([.$?*|{}()\[\]\\/\\+^])/g, '\\$1') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[2]) : null;
}

let csrfToken: string | null = null;
export function currentXsrf(): string {
  return getCookie('XSRF-TOKEN') || csrfToken || '';
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  // Ensure relative URLs are resolved against our API base when running in Node/tests
  if (typeof input === 'string' && input.startsWith('/')) {
    input = `${BASE}${input}`;
  }

  const method = ((init.method as HttpMethod) || 'GET').toUpperCase() as HttpMethod;
  const unsafe: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (unsafe.includes(method)) {
    const token = currentXsrf();
    if (!token) {
      try {
        await getCsrf();
      } catch {
        /* allow request to fail if CSRF required */
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...((init.headers as Record<string, string>) || {}),
  };

  const tokenNow = currentXsrf();
  if (tokenNow) headers['X-XSRF-TOKEN'] = tokenNow;

  const response = await fetch(input, Object.assign({}, init, { credentials: 'include', headers }));
  return response;
}

export async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      (json && (json.message || json.error)) || 'Request failed',
      res.status,
      json?.errors,
    );
  }
  return json as T;
}

export async function parseListResponse<T>(res: Response) {
  const json = await parseJson<unknown>(res);
  if (Array.isArray(json)) return { data: json as unknown as T[] };
  return json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
    ? (json as { data: T[] })
    : { data: [json as unknown as T] };
}

export async function getCsrf(): Promise<Response> {
  try {
    const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.CSRF}`);
    const cookieVal = getCookie('XSRF-TOKEN');
    if (cookieVal) csrfToken = cookieVal;
    return res;
  } catch (err: unknown) {
    console.error('CSRF fetch error:', err);
    throw handleApiError(err, undefined);
  }
}

export { BASE };
