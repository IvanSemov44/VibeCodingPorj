<?php

return [
    'paths' => ['api/*', 'sanctum/*'],
    'allowed_methods' => ['*'],
    // Allow multiple frontend origins via comma-separated FRONTEND_URL env var
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:3000,http://localhost:8200')))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['X-XSRF-TOKEN'],
    'max_age' => 0,
    'supports_credentials' => true,
];
