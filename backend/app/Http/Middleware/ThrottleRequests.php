<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

final class ThrottleRequests
{
    /**
     * Create a new middleware instance.
     */
    public function __construct(
        protected RateLimiter $limiter,
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next,
        ...$limits,
    ): Response {
        $key = $this->resolveRequestSignature($request);

        foreach ($limits as $limit) {
            if ($this->limiter->tooManyAttempts($key, $this->resolveLimit($limit))) {
                throw new \Illuminate\Http\Exceptions\ThrottleRequestsException(
                    limit: $this->resolveLimit($limit),
                    retryAfter: $this->limiter->availableIn($key),
                );
            }

            $this->limiter->hit($key, $this->resolveDecay($limit));
        }

        $response = $next($request);

        foreach ($limits as $limit) {
            $response = $this->addHeaders(
                $response,
                $this->resolveLimit($limit),
                $this->limiter->attempts($key),
                $this->limiter->resetAfter($key),
            );
        }

        return $response;
    }

    /**
     * Resolve the request signature.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        if ($userId = $request->user()?->id) {
            return $userId;
        }

        return Str::transliterate(Str::lower(
            $request->ip() ?? '127.0.0.1'
        ));
    }

    /**
     * Resolve the limit from string.
     */
    protected function resolveLimit(string $limit): int
    {
        return (int) explode(',', $limit)[0];
    }

    /**
     * Resolve the decay from string.
     */
    protected function resolveDecay(string $limit): int
    {
        return (int) (explode(',', $limit)[1] ?? 1);
    }

    /**
     * Add rate limit headers to response.
     */
    protected function addHeaders(
        Response $response,
        int $limit,
        int $remaining,
        int $retryAfter,
    ): Response {
        $response->headers->add([
            'X-RateLimit-Limit' => $limit,
            'X-RateLimit-Remaining' => max(0, $limit - $remaining),
            'X-RateLimit-Reset' => $retryAfter,
        ]);

        return $response;
    }
}
