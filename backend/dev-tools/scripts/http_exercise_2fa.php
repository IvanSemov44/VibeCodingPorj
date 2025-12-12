<?php
// HTTP end-to-end test: CSRF -> login -> create 2FA challenge -> confirm
require __DIR__.'/../../vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;

$email = $argv[1] ?? 'test@local';
$password = $argv[2] ?? 'secret123';

// Try multiple base URIs so this script works both from host and inside containers
$candidates = [
    'http://localhost:8201',
    'http://host.docker.internal:8201',
    'http://backend',
    'http://127.0.0.1:8201',
];

$jar = new CookieJar();
$client = null;
foreach ($candidates as $base) {
    try {
        $tmpClient = new Client([
            'base_uri' => $base,
            'cookies' => $jar,
            'http_errors' => false,
            'allow_redirects' => false,
            'timeout' => 10,
        ]);
        // attempt to fetch CSRF cookie
        $res = $tmpClient->get('/sanctum/csrf-cookie');
        // check for any Set-Cookie header
        $headers = $res->getHeader('Set-Cookie');
        if (!empty($headers)) {
            $client = $tmpClient;
            echo "Using base URI: {$base}\n";
            break;
        }
    } catch (Throwable $e) {
        // try next
    }
}
if (! $client) {
    throw new RuntimeException('Could not reach backend on any candidate base URIs');
}

try {
    echo "Fetching CSRF cookie...\n";
    $res = $client->get('/sanctum/csrf-cookie');
    echo "CSRF response headers:\n" . json_encode($res->getHeaders(), JSON_PRETTY_PRINT) . "\n";
    // find XSRF-TOKEN in jar
    $xsrf = null;
    foreach ($jar->toArray() as $c) {
        if (isset($c['Name']) && $c['Name'] === 'XSRF-TOKEN') {
            $xsrf = urldecode($c['Value']);
            break;
        }
    }
    if (! $xsrf) {
        throw new RuntimeException('XSRF token not found in cookie jar');
    }
    echo "XSRF token obtained\n";

    echo "Logging in as {$email}...\n";
    $res = $client->post('/login', [
        'headers' => [
            'X-XSRF-TOKEN' => $xsrf,
            'Accept' => 'application/json'
        ],
        'form_params' => [
            'email' => $email,
            'password' => $password,
        ],
    ]);

    echo "Login HTTP status: " . $res->getStatusCode() . "\n";
    if ($res->getStatusCode() >= 400) {
        echo "Login failed: " . $res->getBody() . "\n";
        exit(1);
    }

    echo "Creating email 2FA challenge...\n";
    $res = $client->post('/api/2fa/challenge', [
        'headers' => [
            'X-XSRF-TOKEN' => $xsrf,
            'Accept' => 'application/json'
        ],
        'form_params' => ['type' => 'email'],
    ]);

    $status = $res->getStatusCode();
    echo "Challenge HTTP status: {$status}\n";
    $body = (string) $res->getBody();
    echo "Response: {$body}\n";

    $json = json_decode($body, true);
    if (! $json) {
        echo "Failed to parse challenge response\n";
        exit(1);
    }

    $code = $json['code'] ?? null;
    if (! $code) {
        echo "No code returned in challenge response\n";
        exit(1);
    }

    echo "Confirming code {$code}...\n";
    $res = $client->post('/api/2fa/confirm', [
        'headers' => [
            'X-XSRF-TOKEN' => $xsrf,
            'Accept' => 'application/json'
        ],
        'form_params' => ['code' => $code, 'type' => 'email'],
    ]);

    echo "Confirm HTTP status: " . $res->getStatusCode() . "\n";
    echo "Confirm response: " . (string) $res->getBody() . "\n";

    if ($res->getStatusCode() >= 400) {
        exit(1);
    }

    echo "2FA endpoint flow succeeded over HTTP.\n";
    exit(0);

} catch (Throwable $e) {
    echo 'error: ' . $e->getMessage() . PHP_EOL;
    exit(1);
}
