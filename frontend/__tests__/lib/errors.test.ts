import { describe, it, expect } from 'vitest';
import { ApiError, handleApiError, parseValidationErrors } from '../../lib/errors';

describe('lib/errors', () => {
  it('constructs ApiError correctly', () => {
    const e = new ApiError('Bad', 400, { field: ['required'] });
    expect(e).toBeInstanceOf(ApiError);
    expect(e.name).toBe('ApiError');
    expect(e.status).toBe(400);
    expect(e.errors.field).toBeDefined();
  });

  it('handleApiError maps 401 to Unauthorized', () => {
    const res = { ok: false, status: 401 } as unknown as Response;
    const out = handleApiError(null, res);
    expect(out).toBeInstanceOf(ApiError);
    expect(out.status).toBe(401);
    expect(out.message).toMatch(/Unauthorized/i);
  });

  it('handleApiError maps 422 to Validation failed and preserves errors', () => {
    const res = { ok: false, status: 422 } as unknown as Response;
    const apiErr = { errors: { email: ['invalid'] } } as unknown;
    const out = handleApiError(apiErr, res);
    expect(out.status).toBe(422);
    expect(out.message).toMatch(/Validation failed/i);
    expect(out.errors).toBeDefined();
    expect((out.errors as any).email[0]).toBe('invalid');
  });

  it('handleApiError maps 419 to CSRF token mismatch', () => {
    const res = { ok: false, status: 419 } as unknown as Response;
    const out = handleApiError(null, res);
    expect(out.status).toBe(419);
    expect(out.message).toMatch(/CSRF/i);
  });

  it('handleApiError maps 500+ to Server error', () => {
    const res = { ok: false, status: 500 } as unknown as Response;
    const out = handleApiError(null, res);
    expect(out.status).toBe(500);
    expect(out.message).toMatch(/Server error/i);
  });

  it('handleApiError with no response uses extractMessage', () => {
    const out = handleApiError('plain error', undefined as unknown as Response);
    expect(out.status).toBe(0);
    expect(out.message).toMatch(/plain error/);
  });

  it('parseValidationErrors returns mapping for 422 ApiError', () => {
    const apiErr = new ApiError('Validation failed', 422, { name: ['required'] });
    const parsed = parseValidationErrors(apiErr);
    expect(parsed.name).toBe('required');
  });

  it('parseValidationErrors returns empty for non-422', () => {
    const apiErr = new ApiError('Other', 400, {});
    const parsed = parseValidationErrors(apiErr);
    expect(Object.keys(parsed).length).toBe(0);
  });
});
