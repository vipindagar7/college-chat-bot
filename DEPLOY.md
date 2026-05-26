# 🚀 Deploy Guide — Chatbot alongside Feedback Portal (same domain)

## Final URL Structure
| URL | What it serves |
|-----|----------------|
| `mycollege.com/` | Your existing feedback portal (port 3000) — unchanged |
| `mycollege.com/chatbot` | Chatbot student UI |
| `mycollege.com/chatbot/admin` | Chatbot admin dashboard |
| `mycollege.com/chatbot-api/` | Chatbot backend API (port 3001) |
| `mycollege.com/widget.js` | Embeddable widget script |

---

## Step 1 — Upload project to server

```bash
# Upload zip and extract, or git clone
unzip admission-bot-v3.zip -d /var/www/
# Project is now at: /var/www/admission-bot
```

---

## Step 2 — Start chatbot backend on port 3001

```bash
cd /var/www/admission-bot/server

# Setup environment
cp .env.example .env
nano .env
# Set these values:
#   PORT=3001
#   MONGODB_URI=mongodb://localhost:27017/admission_bot
#   JWT_SECRET=any_long_random_string_here
#   ADMIN_SECRET_KEY=your_secret
#   ALLOWED_ORIGINS=https://mycollege.com,http://mycollege.com

npm install

# Start with PM2
pm2 start src/index.js --name "chatbot-api"
pm2 save

# Verify it's running on 3001
curl http://localhost:3001/health
# Should return: {"status":"ok",...}
```

---

## Step 3 — Build the React frontend

```bash
cd /var/www/admission-bot/client

npm install
npm run build
# This creates /var/www/admission-bot/client/dist/
```

---

## Step 4 — Configure NGINX

```bash
# Open your existing NGINX config
nano /etc/nginx/sites-available/default
# OR wherever your current config is:
nano /etc/nginx/sites-available/mycollege
```

**Add these 3 blocks INSIDE your existing `server { }` block,
BEFORE the final `location / { }` block:**

```nginx
# ── Chatbot Backend API ──────────────────────────────────────────
location /chatbot-api/ {
    rewrite ^/chatbot-api/(.*)$ /api/$1 break;
    proxy_pass         http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 60s;
    add_header Access-Control-Allow-Origin  * always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    if ($request_method = OPTIONS) { return 204; }
}

# ── Widget JS ────────────────────────────────────────────────────
location = /widget.js {
    rewrite ^ /widget.js break;
    proxy_pass  http://127.0.0.1:3001;
    add_header  Access-Control-Allow-Origin * always;
    add_header  Cache-Control "public, max-age=3600";
}

# ── Chatbot React Frontend ────────────────────────────────────────
location /chatbot {
    alias /var/www/admission-bot/client/dist;
    try_files $uri $uri/ /chatbot/index.html;
    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Test and reload
nginx -t && systemctl reload nginx
```

---

## Step 5 — Create admin user

```bash
curl -X POST http://mycollege.com/chatbot-api/auth/../admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "phone": "9876543210",
    "password": "yourpassword",
    "secretKey": "your_ADMIN_SECRET_KEY"
  }'
```

---

## Step 6 — Embed widget on your college website

```html
<!-- Add before </body> on any page -->
<script>
  window.ChatBotConfig = {
    widgetId: "my_college",
    apiBase: "https://mycollege.com",
    chatUrl: "https://mycollege.com/chatbot"
  };
</script>
<script src="https://mycollege.com/widget.js"></script>
```

---

## Verify everything works

```bash
# Backend alive?
curl http://localhost:3001/health

# NGINX routing working?
curl http://mycollege.com/chatbot-api/auth/send-otp  # should return 400 (missing body = good, not 404)
curl http://mycollege.com/widget.js                  # should return JavaScript
curl http://mycollege.com/chatbot                    # should return HTML

# PM2 status
pm2 status
```

---

## Troubleshooting

**502 on /chatbot-api/**
```bash
pm2 status           # Is chatbot-api running?
pm2 logs chatbot-api # Check errors
curl http://localhost:3001/health
```

**404 on /chatbot (white page or not found)**
```bash
ls /var/www/admission-bot/client/dist/   # dist folder must exist
# If empty: cd client && npm run build
```

**Feedback portal broken after NGINX change**
- You only ADDED blocks — you never touched the existing `location / {}` block
- Run `nginx -t` to check for syntax errors
- Run `pm2 status` to confirm feedback portal (port 3000) is still running

**CORS error in browser**
```bash
nano /var/www/admission-bot/server/.env
# Set: ALLOWED_ORIGINS=https://mycollege.com,http://mycollege.com
pm2 restart chatbot-api
```
