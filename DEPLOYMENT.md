# SOCT Project Deployment Guide (Single Droplet)

This guide provides instructions for deploying the Event Management platform with automated SSL and CI/CD directly to a DigitalOcean Droplet.

## 1. Initial Server Requirements
- A DigitalOcean Droplet (Ubuntu 22.04+ recommended).
- Docker and the Docker Compose plugin installed.
```bash
apt-get update
apt-get install -y docker.io docker-compose-plugin
```

---

## 2. Automated Deployment (CI/CD)

The project includes a GitHub Actions pipeline for manual deployment to your server.

### GitHub Secrets Setup
To use the pipeline, go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** and add the following **New repository secrets**:

| Secret Name | Description |
| :--- | :--- |
| `SSH_HOST` | The IP Address of your DigitalOcean Droplet. |
| `SSH_USER` | The username for the server (e.g., `root`). |
| `SSH_PRIVATE_KEY` | The **Private** SSH key used to access your Droplet. |
| `ENV_FILE_CONTENT` | The full content of your production `.env` file. |

### Branching & Deployment Workflow
1.  **Develop**: Always commit and push your work to the `dev` branch.
2.  **Release**: When ready to deploy, merge `dev` into `main` and push to GitHub.
3.  **Execute**: 
    - Go to the **Actions** tab in your GitHub repository.
    - Select the **SSH Manual Deployment** workflow.
    - Click **Run workflow** and select the `main` branch.

The pipeline will automatically SSH into your server, pull the latest code from `main`, ensure SSL is configured, and restart your Docker containers securely.

---

## 3. Manual Initial Setup (Optional)

If you prefer to set up the first time manually before using the pipeline:

### 1. Get the Code
```bash
git clone https://github.com/harmohanjohal/FunSpot.git soct-project
cd soct-project
```

### 2. Configure Environment
Create your `.env` file based on the production template:
```env
REACT_APP_API_URL=https://funspot.harmohanjohal.com/api/eventapp
REACT_APP_IMAGE_SERVICE_URL=https://funspot.harmohanjohal.com/api/imageservice
REACT_APP_WEB_SERVICES_URL=https://funspot.harmohanjohal.com/api/webservices
JWT_SECRET=your_secure_random_key_here
CORS_ALLOWED_ORIGINS=https://funspot.harmohanjohal.com
JSON_FILE_PATH=/app/data/Events.json
```

### 3. High-Reliability SSL Launch
Run the automated bootstrap script:
```bash
chmod +x ./init-letsencrypt.sh
./init-letsencrypt.sh
```

### 4. Verify Successful Launch
```bash
docker compose -f docker-compose.ssl.yml ps
```

Visit `https://funspot.harmohanjohal.com` in your browser.

> [!TIP]
> **Cloudflare Proxy Warning**: If your first deployment fails SSL verification, ensure the Cloudflare Proxy (Orange Cloud) is **DISABLED** (Grey Cloud) temporarily. Once live, you can turn it back on.
