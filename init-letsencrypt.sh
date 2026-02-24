#!/bin/bash

if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

domain="funspot.harmohanjohal.com"
rsa_key_size=4096
email="your-email@example.com" # Adding a valid address is strongly recommended
staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits

echo "### Phase 1: Creating necessary directories ..."
mkdir -p ./data/certbot/conf
mkdir -p ./data/certbot/www

if [ ! -e "./data/certbot/conf/options-ssl-nginx.conf" ] || [ ! -e "./data/certbot/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nodejs/options-ssl-nginx.conf > "./data/certbot/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./data/certbot/conf/ssl-dhparams.pem"
  echo
fi

echo "### Phase 2: Starting Nginx in HTTP-only mode for ACME Challenge ..."
# Temporarily overwrite the default nginx config with our HTTP-only challenge config
cp nginx-init.conf ./data/nginx.conf.temp
docker-compose -f docker-compose.ssl.yml up -d --build frontend
echo

echo "### Phase 3: Requesting Let's Encrypt certificates ..."
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose -f docker-compose.ssl.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    -d $domain \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Phase 4: Restarting Nginx in full SSL mode ..."
docker-compose -f docker-compose.ssl.yml exec frontend nginx -s reload

echo "### Success! Now bring up the rest of the backend API services securely:"
echo "docker-compose -f docker-compose.ssl.yml up -d --build"
