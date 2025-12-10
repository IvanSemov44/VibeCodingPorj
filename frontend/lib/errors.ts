export class ApiError extends Error {
  status: number;
  errors: Record<string, unknown>;

  constructor(message: string, status: number, errors: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function extractMessage(e: unknown): string {
  if (e && typeof e === 'object') {
    const maybe = e as Record<string, unknown>;
    if ('message' in maybe && typeof maybe.message === 'string') return maybe.message;
  }
  return String(e ?? 'An unexpected error occurred');
}

export function handleApiError(error: unknown, res?: Response): ApiError {
  if (res && !res.ok) {
    if (res.status === 401) {
      return new ApiError('Unauthorized', 401);
    }
    if (res.status === 422) {
      const errs = (error && typeof error === 'object' && 'errors' in (error as Record<string, unknown>)) ? (error as Record<string, unknown>).errors as Record<string, unknown> : {};
      return new ApiError('Validation failed', 422, errs || {});
    }
    if (res.status === 419) {
      return new ApiError('CSRF token mismatch', 419);
    }
    if (res.status >= 500) {
      return new ApiError('Server error', res.status);
    }
  }

  return new ApiError(extractMessage(error), 0);
}

export function parseValidationErrors(apiError: ApiError): Record<string, string> {
  if (apiError.status === 422 && apiError.errors) {
    const parsed: Record<string, string> = {};
    Object.keys(apiError.errors).forEach(field => {
      const value = apiError.errors[field];
      if (Array.isArray(value)) parsed[field] = String(value[0]);
      else parsed[field] = String(value ?? '');
    });
    return parsed;
  }
  return {};
}
