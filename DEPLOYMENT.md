# Cloud Deployment Guide: DigitalOcean Managed Kubernetes

This project uses GitHub Actions for continuous deployment to DigitalOcean Managed Kubernetes (DOKS). Follow these instructions to set up the infrastructure.

## 1. DigitalOcean Infrastructure Setup

1. **Create an API Token**:
   - Go to DigitalOcean > API > Generate New Token.
   - Name it `docs-github-ci` and grant **Read/Write** access.
   - Copy the token immediately.

2. **Create Container Registry**:
   - Go to Container Registry > Create.
   - Name it `soct-registry` (or update `.github/workflows/deploy.yml` `env.REGISTRY` to match your custom name).

3. **Create Kubernetes Cluster**:
   - Go to Kubernetes > Create Cluster.
   - Name the cluster `soct-k8s-cluster` (or update `deploy.yml` `env.CLUSTER_NAME`).
   - Provision a basic node pool (e.g., 2 Nodes of Standard $12 droplet). Wait for it to provision.

## 2. Cluster Secret Configuration

You must manually inject your sensitive API keys into the Kubernetes cluster. **Never commit these to version control.**

1. Install `doctl` locally and log in:
   ```bash
   doctl auth init
   doctl kubernetes cluster kubeconfig save soct-k8s-cluster
   ```

2. Create the unified secret in the cluster:
   ```bash
   kubectl create secret generic soct-secrets \
     --from-literal=REACT_APP_ADMIN_PASS="your-secure-admin-password" \
     --from-literal=JWT_SECRET="long-secure-random-32-byte-string-here" \
     --from-literal=PIXABAY_API_KEY="your-pixabay-key" \
     --from-literal=CURRENCY_API_KEY="your-currency-key" \
     --from-literal=DIRECTIONS_API_KEY="your-maps-key" \
     --from-literal=WEATHER_API_KEY="your-weather-key"
   ```

## 3. GitHub Actions Configuration

Go to your GitHub Repository > Settings > Secrets and Variables > Actions. 

Create one Repository Secret:
- `DIGITALOCEAN_ACCESS_TOKEN` = (Paste the token generated in Step 1.1)

## 4. Deploy!

The GitHub action will build the multi-stage Dockerfiles, push them to the DOCR registry, and issue a rolling restart to your live pods without downtime.

---

## Alternative: Single Droplet Deployment with SSL (Docker Compose)

If you are bypassing Kubernetes for a simpler, single-VM deployment (e.g., a $12 DigitalOcean Droplet) and want to secure a custom domain with **HTTPS / SSL**, follow these steps:

### 1. DNS Setup
Point your domain's A-Record (e.g., `funspot.harmohanjohal.com`) to your DigitalOcean Droplet's public IPv4 address. Wait 5-15 minutes for DNS to propagate.

### 2. Configure Environment (`.env`)
On the server, ensure your `.env` file uses the custom domain instead of `localhost` or the raw IP:
```env
REACT_APP_API_URL=https://funspot.harmohanjohal.com/api/eventapp
REACT_APP_IMAGE_SERVICE_URL=https://funspot.harmohanjohal.com/api/imageservice
REACT_APP_WEB_SERVICES_URL=https://funspot.harmohanjohal.com/api/webservices
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://funspot.harmohanjohal.com
```

### 3. Generate Free SSL Certificates
Run the initialization script. This uses Certbot to prove you own the domain and generates the Let's Encrypt certificates.
```bash
chmod +x ./init-letsencrypt.sh
./init-letsencrypt.sh
```

### 4. Start the Secure Stack
Once the script finishes successfully, launch the full multi-container stack attached to the new automated SSL configuration:
```bash
docker-compose -f docker-compose.ssl.yml up -d --build
```
Your application is now live, securely served over `https://`, and the certificates will automatically renew every 60 days!
