#!/bin/bash

# 1. Clean up everything first
docker compose down --volumes --remove-orphans
docker system prune -f

# 2. Create the temp Nginx config for Phase 1 (HTTP Only)
mkdir -p ./data/certbot/conf
mkdir -p ./data/certbot/www
cat <<EOF > ./data/nginx.conf.temp
server {
    listen 80;
    server_name funspot.harmohanjohal.com;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
EOF

# 3. Start Nginx just to pass the challenge
docker compose -f docker-compose.ssl.yml up -d frontend

# 4. Wait for Nginx to be ready
echo "Waiting for Nginx to initialize..."
sleep 5

# 5. Request certificates
docker compose -f docker-compose.ssl.yml run --rm --entrypoint "certbot" certbot \
    certonly --webroot -w /var/www/certbot \
    --register-unsafely-without-email --agree-tos --non-interactive \
    -d funspot.harmohanjohal.com --force-renewal

# 6. Swap to the REAL SSL Nginx config
cp nginx-ssl.conf ./data/nginx.conf.temp

# 7. Start everything
docker compose -f docker-compose.ssl.yml up -d --build
echo "----------------------------------------------------"
echo "Success! Visit https://funspot.harmohanjohal.com"
echo "----------------------------------------------------"
