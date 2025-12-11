#!/bin/sh
set -e
COOKIE=/tmp/auto_2fa_cookies.txt

echo "Logging in as cli@local"
curl -sS -X POST http://backend/api/login -H 'Content-Type: application/json' -d '{"email":"cli@local","password":"P@ssw0rd!"}' -c $COOKIE -b $COOKIE -i

echo "Enabling TOTP"
curl -sS -b $COOKIE http://backend/api/2fa/enable -H 'Content-Type: application/json' -d '{"type":"totp"}' -i

echo "Fetching provisioning URI"
PROV=$(curl -sS -b $COOKIE http://backend/api/2fa/secret | php -r '$j=json_decode(stream_get_contents(STDIN), true); echo $j["data"]["provisioning_uri"];')
echo "PROV=$PROV"

echo "Extracting secret"
SECRET=$(php -r 'parse_str(parse_url($argv[1], PHP_URL_QUERY), $p); echo $p["secret"];' "$PROV")
echo "SECRET=$SECRET"

echo "Generating current TOTP code"
CODE=$(php /var/www/html/scripts/generate_totp.php "$SECRET")
echo "CODE=$CODE"

echo "Confirming TOTP"
curl -sS -b $COOKIE -X POST http://backend/api/2fa/confirm -H 'Content-Type: application/json' -d "{\"code\":\"$CODE\"}" -i

echo "Done"
