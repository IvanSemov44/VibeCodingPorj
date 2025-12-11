<?php
require __DIR__ . '/../vendor/autoload.php';

use OTPHP\TOTP;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;

try {
    $totp = TOTP::create();
    $totp->setLabel('vibecodingproj-dev-user');
    $uri = $totp->getProvisioningUri();
    $secret = $totp->getSecret();

    // Use GDLibRenderer (available in bacon-qr-code v3) to render PNG
    $renderer = new GDLibRenderer(300);
    $writer = new Writer($renderer);
    $pngData = $writer->writeString($uri);

    echo "SECRET: " . $secret . "\n";
    echo "URI: " . $uri . "\n";
    echo "QR_BASE64:" . base64_encode($pngData) . "\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
