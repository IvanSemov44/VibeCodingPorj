<?php

return [
    'paths' => ['api/*', 'sanctum/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:8200')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['X-XSRF-TOKEN'],
    'max_age' => 0,
    'supports_credentials' => true,
];
