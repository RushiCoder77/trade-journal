# Deployment Guide

Deploy your Trade Journal to the cloud for access from anywhere in the world!

## Recommended: Railway (Free Tier Available)

Railway is perfect for full-stack apps with a database. Free plan includes 500 hours/month.

### Step-by-Step Railway Deployment

#### 1. Prepare Your App

Create a `Procfile` in your project root:
```
web: npm start
```

Add a start script to `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "client": "vite",
    "server": "node server/index.js",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server/index.js"
  }
}
```

#### 2. Sign Up for Railway

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Connect your GitHub account
6. Push your code to GitHub first:

```bash
cd /Users/rushikeshkadam/Projects/Trading
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Create a repo on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 3. Configure Railway

1. Select your repository
2. Railway will auto-detect Node.js
3. Add environment variables:
   - Click "Variables" tab
   - Add: `PORT` = `5001`
   - Add: `NODE_ENV` = `production`

4. Your app will deploy automatically!

#### 4. Update Frontend for Production

You'll need to build a production version. Update package.json:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "client": "vite",
    "server": "node server/index.js",
    "build": "vite build",
    "start": "concurrently \"node server/index.js\" \"npm run serve-frontend\"",
    "serve-frontend": "npx serve -s dist -l 3000",
    "preview": "vite preview"
  }
}
```

Add serve dependency:
```bash
npm install --save-dev serve
```

#### 5. Serve Static Frontend from Express

Update `server/index.js`:

```javascript
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ... rest of your imports

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}
```

---

## Alternative: Render (Easier, Also Free)

### 1. Sign Up for Render

1. Go to https://render.com/
2. Sign up with GitHub
3. Create new "Web Service"

### 2. Configure

- **Build Command:** `npm install && npm run build`
- **Start Command:** `node server/index.js`
- **Environment Variables:**
  - `NODE_ENV` = `production`

---

## Alternative: Vercel (Backend) + Vercel (Frontend)

### For Frontend Only:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### For Backend:

You'll need to use serverless functions. Create `api/` directory and convert Express to serverless.

---

## Alternative: Fly.io (Simple Full-Stack)

1. Install Fly CLI:
```bash
brew install flyctl  # On Mac
```

2. Login:
```bash
fly auth login
```

3. Launch:
```bash
fly launch
```

4. Deploy:
```bash
fly deploy
```

---

## Quick Option: Use ngrok (Temporary Public URL)

For quick sharing without deployment:

1. Install ngrok: https://ngrok.com/download

2. Start your local server:
```bash
npm run dev
```

3. In another terminal:
```bash
ngrok http 3000
```

4. Share the ngrok URL (e.g., `https://abc123.ngrok.io`)

⚠️ **Note:** Free ngrok URLs change every restart and are temporary.

---

## Recommended Approach

**Best for beginners:** Railway
- Free tier
- Automatic deploys from GitHub
- Handles database well
- Simple configuration

**Best for production:** Render or Railway
- Reliable uptime
- Free SSL certificates
- Custom domains
- Automatic scaling

---

## Cost

All mentioned services have **free tiers** that are perfect for personal projects:

- **Railway:** 500 hours/month free (enough for personal use)
- **Render:** Free tier with some limitations
- **Fly.io:** 3 VMs free
- **ngrok:** Free tier available (temporary URLs)

---

## After Deployment

Once deployed, you'll get a URL like:
- `https://trade-journal.up.railway.app`
- `https://trade-journal.onrender.com`

Access it from anywhere - your phone, laptop, tablet, anywhere with internet! 🌍

---

## Database Consideration

Your SQLite database file (`trades.db`) will work on Railway and Render, but:

⚠️ **Warning:** Some platforms restart and may lose your data.

**For production, consider:**
1. Using Railway's persistent volumes
2. Upgrading to PostgreSQL (Railway offers free tier)
3. Regular backups

Need help with any deployment method? Let me know!
