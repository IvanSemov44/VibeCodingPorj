import { ZodSchema } from 'zod';
import { handleApiError } from '../errors';

/**
 * Parse a Response, throw ApiError on non-OK, and validate the payload with Zod.
 * If the payload is wrapped in `{ data: ... }` the inner value will be validated.
 */
export async function parseAndValidate<T>(res: Response, schema: ZodSchema<T>): Promise<T> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw handleApiError(json, res);
  }

  const payload =
    json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
      ? (json as Record<string, unknown>).data
      : json;

  return schema.parse(payload);
}
