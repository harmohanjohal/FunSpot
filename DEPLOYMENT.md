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

## Single Droplet Deployment (SSL/HTTPS)

If you are setting up a **fresh DigitalOcean Droplet**, follow these steps to get SSL working immediately.

### 1. Initial Server Setup
On your new Droplet (Ubuntu 22.04+ recommended), install the modern Docker Compose plugin:
```bash
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 2. Get the Code
```bash
git clone https://github.com/harmohanjohal/FunSpot.git soct-project
cd soct-project
```

### 3. Configure Environment
Create your `.env` file based on the production template:
```env
REACT_APP_API_URL=https://funspot.harmohanjohal.com/api/eventapp
REACT_APP_IMAGE_SERVICE_URL=https://funspot.harmohanjohal.com/api/imageservice
REACT_APP_WEB_SERVICES_URL=https://funspot.harmohanjohal.com/api/webservices
JWT_SECRET=your_secure_random_key_here
CORS_ALLOWED_ORIGINS=https://funspot.harmohanjohal.com
JSON_FILE_PATH=/app/data/Events.json
```

### 4. High-Reliability SSL Launch
Run the automated bootstrap script. It will handle the Nginx "Challenge Mode" and fetch your certificates automatically.

```bash
chmod +x ./init-letsencrypt.sh
./init-letsencrypt.sh
```

### 5. Verify Successful Launch
Once the script finishes, check that all services are up:
```bash
docker compose -f docker-compose.ssl.yml ps
```

Visit `https://funspot.harmohanjohal.com` in your browser.

> [!TIP]
> **Cloudflare Proxy Warning**: During the first run of `init-letsencrypt.sh`, ensure the Cloudflare Proxy (Orange Cloud) is **DISABLED** (Grey Cloud) to allow Let's Encrypt validation. You can enable it back once the site is live.
