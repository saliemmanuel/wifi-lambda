# Deployment Guide

This guide explains how to deploy the application to a VPS that already hosts other websites and has Docker installed.

## Prerequisites

- VPS with Docker and Docker Compose installed.
- Access to the VPS via SSH.
- A domain name pointing to the VPS IP address.

## Setup Steps

1.  **Copy Files to VPS**:
    Upload the project files to your VPS (e.g., `/var/www/wifi-lambda`).

    ```bash
    scp -r . user@your-vps-ip:/var/www/wifi-lambda
    ```

2.  **Configure Environment**:
    SSH into your VPS and navigate to the project directory.
    Create a `.env` file for production.

    ```bash
    cp .env.example .env
    nano .env
    ```

    Update the following variables:
    - `APP_ENV=production`
    - `APP_URL=https://your-domain.com`
    - `DB_HOST=db`
    - `REDIS_HOST=redis`
    - `APP_PORT=8080` (Or any other free port on your VPS)

3.  **Deploy**:
    Run the deployment script.

    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```

## Configuring Reverse Proxy (The "Other Sites" Part)

Since you have other sites running, port 80/443 is likely already in use by a web server (Nginx, Apache) or a proxy.

You need to configure your main web server to forward requests for your new domain to this Docker application running on port `8080` (or whatever you set `APP_PORT` to).

### Option A: If your host uses Nginx

Create a new server block file (e.g., `/etc/nginx/sites-available/wifi-lambda`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it and reload Nginx:
```bash
ln -s /etc/nginx/sites-available/wifi-lambda /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Option B: If your host uses Apache

Create a new VirtualHost:

```apache
<VirtualHost *:80>
    ServerName your-domain.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
</VirtualHost>
```

### Option C: If you use a Docker Proxy (like Nginx Proxy Manager)

If your other sites are also in Docker and you use a proxy container:
1. Connect this app's container to the proxy network (edit `docker-compose.yml`).
2. Point your domain to the proxy.

---

## Maintenance

To update the application later:
1. Pull new code.
2. Run `./deploy.sh`.
