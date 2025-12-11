<?php
require __DIR__ . '/../vendor/autoload.php';
use OTPHP\TOTP;

if ($argc < 2) {
    fwrite(STDERR, "Usage: php generate_totp.php <BASE32_SECRET>\n");
    exit(1);
}

$secret = $argv[1];
$totp = TOTP::create($secret);
echo $totp->now() . "\n";
