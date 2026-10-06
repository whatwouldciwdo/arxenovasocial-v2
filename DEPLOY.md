# Deploy arxenovasocial.com — aaPanel + Ubuntu

Stack: Next.js 14 (`next start`, port 3000) behind Nginx (aaPanel), managed by PM2.
Repo: https://github.com/whatwouldciwdo/arxenovasocial-v2

## 1. DNS
At your domain registrar add:
| Type | Host | Value |
|---|---|---|
| A | `@` | IP server |
| A | `www` | IP server |

## 2. Server prep (SSH, Ubuntu 22.04/24.04)
```bash
sudo apt update && sudo apt install -y git curl
# aaPanel (skip if already installed)
wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && sudo bash install.sh aapanel
```
Open ports in firewall / cloud security group: **80, 443, 22, aaPanel port** (shown after install).

## 3. Install Node.js + PM2 (aaPanel)
1. aaPanel → **App Store** → install **Nginx** and **PM2 Manager** (or Node.js version manager).
2. In Node version manager install **Node 20 LTS** and set it as the default.
   Alternative (SSH): `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs && sudo npm i -g pm2`
3. Verify: `node -v` (>= 18.17) and `pm2 -v`.

## 4. Pull the code
```bash
sudo mkdir -p /www/wwwroot && cd /www/wwwroot
sudo git clone https://github.com/whatwouldciwdo/arxenovasocial-v2.git arxenovasocial.com
cd arxenovasocial.com
sudo cp .env.production.example .env.production
```

## 5. Build
```bash
npm ci
npm run build
```
> `.env.production` must exist **before** build.

## 6. Run with PM2
```bash
pm2 start npm --name arxenovasocial -- start -- -p 3000
pm2 save
pm2 startup        # run the command it prints, so app starts on reboot
```
Check: `curl -I http://127.0.0.1:3000` → `200`.

## 7. Website + reverse proxy (aaPanel)
1. **Website → Add site** → domain `arxenovasocial.com` and `www.arxenovasocial.com`, PHP: *Static*, no DB.
2. Open the site → **Reverse proxy → Add reverse proxy**:
   - Name: `next`, Target URL: `http://127.0.0.1:3000`, Send domain: `$host`.
   (Or **Config** and put in the `server` block:)
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## 8. SSL
Site → **SSL → Let's Encrypt** → tick both domains → Apply (DNS must already point to the server) → enable **Force HTTPS**.

## 9. Update / redeploy
```bash
cd /www/wwwroot/arxenovasocial.com
git pull
npm ci
npm run build
pm2 restart arxenovasocial
```

## Troubleshooting
- 502 Bad Gateway: `pm2 logs arxenovasocial`, make sure the app runs on port 3000.
- Build out of memory: add swap `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`.
- Env changes require a rebuild (`npm run build`) and restart.
