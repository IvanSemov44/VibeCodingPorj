<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Note: Broad 'api/*' exclusion removed to keep CSRF protection enabled
        // for most API routes. Routes that need to be stateful (Sanctum cookie
        // based auth) should be placed under the `web` middleware group or
        // have explicit exceptions. Keeping 'sanctum/*' ensures SPA can fetch
        // the CSRF cookie endpoint. Specific SPA auth endpoints are listed
        // below and can be adjusted if needed.
        'sanctum/*',
        'api/login',
        'api/logout',
        'api/user',
    ];
}
