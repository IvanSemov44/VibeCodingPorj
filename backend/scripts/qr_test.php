<?php
require __DIR__ . '/../vendor/autoload.php';

use OTPHP\TOTP;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\ImagickImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

try {
    $totp = TOTP::create();
    $totp->setLabel('vibecodingproj:dev-user');
    $uri = $totp->getProvisioningUri();
    $secret = $totp->getSecret();
    $rendererStyle = new RendererStyle(300);
    $renderer = new ImageRenderer($rendererStyle, new ImagickImageBackEnd());
    $writer = new Writer($renderer);
    $pngData = $writer->writeString($uri);
    $pngData = $writer->writeString($uri);

    echo "SECRET: " . $secret . "\n";
    echo "URI: " . $uri . "\n";
    echo "QR_BASE64:" . base64_encode($pngData) . "\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
