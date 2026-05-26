# 🎓 Admission Bot — Zero-Cost College Chatbot

**No AI API. No Docker. Just Node.js + MongoDB.**

A fully self-contained admission chatbot for colleges.  
All answers come from YOUR own `college-data.json` file — no external API calls, no monthly cost.

---

## ✅ What's Included

| Feature | Details |
|---------|---------|
| 🤖 Smart chatbot | Keyword-matching bot reads your own data |
| 🔐 OTP login | Phone number + OTP authentication |
| 💬 Chat UI | Modern React chat interface |
| 📊 Admin dashboard | Leads, conversations, FAQ editor |
| ✏️ Data editor | Edit all college info from admin panel |
| ❓ FAQ manager | Add/edit/delete Q&As — no code needed |
| 📥 Lead capture | Collect student details in chat |
| 📤 Export CSV | Download all leads as spreadsheet |
| 🔗 Widget embed | One `<script>` tag for any website |

---

## 🚀 Setup in 5 Minutes

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas free tier](https://cloud.mongodb.com))

---

### Step 1 — Server Setup

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/admission_bot
JWT_SECRET=any_long_random_string_at_least_32_chars
ADMIN_SECRET_KEY=secret_to_create_admin_users
NODE_ENV=development
```

```bash
npm install
npm run dev
# Server runs at http://localhost:5000
```

---

### Step 2 — Create Admin User

```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "phone": "9876543210",
    "password": "yourpassword",
    "secretKey": "your_ADMIN_SECRET_KEY_from_env"
  }'
```

---

### Step 3 — Client Setup

```bash
cd client
npm install
npm run dev
# Chat UI at http://localhost:5173
# Admin panel at http://localhost:5173/admin
```

---

### Step 4 — Customize Your College Data

Edit `server/src/data/college-data.json` with your college info:
- College name, phone, email, address
- Courses and fees
- Scholarships
- Hostel details
- Placement stats
- FAQ keywords and answers
- Bot name and welcome message

OR use the **Admin Panel → College Data** tab to edit without touching files!

---

## 🔗 Embed in Your College Website

Add before `</body>` in your PHP/HTML website:

```html
<script>
  window.ChatBotConfig = {
    widgetId: "my_college",
    apiBase: "http://your-server-ip:5000",
    chatUrl: "http://your-server-ip:5173"
  };
</script>
<script src="http://your-server-ip:5000/widget.js"></script>
```

That's it! The chatbot widget will appear on your website.

---

## 🌐 Production Deployment (VPS/Server)

### Server (Backend)
```bash
cd server
npm install
NODE_ENV=production node src/index.js
# Or use PM2:
npm install -g pm2
pm2 start src/index.js --name "admission-bot-server"
pm2 save
```

### Client (Frontend)
```bash
cd client
VITE_API_BASE=http://your-domain.com:5000 npm run build
# Serve dist/ folder with any static server (nginx, apache, etc.)
```

### Simple NGINX config
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /widget.js {
        proxy_pass http://localhost:5000;
        add_header Access-Control-Allow-Origin *;
    }

    # Chat UI
    location / {
        root /var/www/admission-bot/client/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/send-otp` | None | Send OTP |
| POST | `/api/auth/verify-otp` | None | Verify OTP → get JWT |
| POST | `/api/chat/session` | JWT | Start chat session |
| POST | `/api/chat/message` | JWT | Send message → get bot reply |
| POST | `/api/chat/lead` | JWT | Save student lead info |
| POST | `/api/admin/login` | None | Admin login |
| POST | `/api/admin/create` | SecretKey | Create admin user |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/leads` | Admin | View all leads |
| PATCH | `/api/admin/leads/:id` | Admin | Update lead status |
| GET | `/api/admin/leads/export` | Admin | Download CSV |
| GET | `/api/admin/conversations` | Admin | Chat sessions |
| GET | `/api/admin/conversations/:sid` | Admin | Messages in session |
| GET | `/api/admin/faqs` | Admin | Get all FAQs |
| POST | `/api/admin/faqs` | Admin | Add FAQ |
| PUT | `/api/admin/faqs/:id` | Admin | Edit FAQ |
| DELETE | `/api/admin/faqs/:id` | Admin | Delete FAQ |
| GET | `/api/admin/data` | Admin | Get college data |
| PATCH | `/api/admin/data/:section` | Admin | Edit college data section |
| GET | `/widget.js` | None | Embeddable widget |

---

## 🤖 How the Bot Works (No AI API)

The bot uses **keyword matching** against your `college-data.json`:

1. Student types: "What is BCA fee?"
2. Bot detects keywords: `bca`, `fee`
3. Bot finds BCA course in your data
4. Bot replies with your BCA fee data

To add custom Q&As:
- Use **Admin Panel → FAQ Manager**
- Add question, answer, and keywords
- Changes apply INSTANTLY — no restart needed!

---

## 📁 Project Structure

```
admission-bot/
├── widget/
│   └── widget.js          ← embed this on any website
├── server/
│   ├── src/
│   │   ├── data/
│   │   │   └── college-data.json  ← YOUR COLLEGE INFO HERE
│   │   ├── services/
│   │   │   └── botEngine.js       ← bot brain
│   │   ├── controllers/           ← business logic
│   │   ├── models/                ← MongoDB models
│   │   ├── routes/                ← API routes
│   │   ├── middleware/            ← auth, rate limit
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── client/
│   └── src/
│       ├── components/
│       │   ├── auth/              ← OTP screens
│       │   ├── chat/              ← chat UI
│       │   └── admin/             ← admin panel
│       ├── context/               ← auth state
│       ├── lib/                   ← API calls
│       └── App.jsx
└── README.md
```
