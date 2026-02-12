# Railway Deployment Guide

## Quick Deploy to Railway (Recommended)

Railway is the easiest way to deploy your Trade Journal app. It's free and takes about 5 minutes!

### Step 1: Prepare Your Code

1. **Make sure all changes are committed:**
```bash
git add .
git commit -m "Prepare for deployment"
```

2. **Push to GitHub:**
   
   If you haven't already:
```bash
# Create a new repo on GitHub.com, then:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Railway

1. **Go to Railway:**
   - Visit https://railway.app/
   - Click "Start a New Project"
   - Sign up/login with GitHub

2. **Deploy from GitHub:**
   - Click "Deploy from GitHub repo"
   - Select your Trade Journal repository
   - Railway will auto-detect it's a Node.js app

3. **Configure Environment Variables:**
   - Go to your project dashboard
   - Click "Variables" tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=5001
     ```

4. **Wait for deployment:**
   - Railway will automatically:
     - Install dependencies (`npm install`)
     - Build your frontend (`npm run build`)
     - Start the server (`npm start`)

5. **Get Your URL:**
   - Go to "Settings" tab
   - Click "Generate Domain"
   - You'll get a URL like: `https://your-app.up.railway.app`

### Step 3: Test Your Deployed App

Visit your Railway URL and:
- ✅ Create a trade
- ✅ Upload a chart image
- ✅ Check if data persists after refresh
- ✅ Test all features

---

## Alternative: Render.com

If Railway doesn't work, try Render:

1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV=production`

---

## Alternative: Vercel

For Vercel, you'll need to use their serverless functions. This requires more setup.

---

## Local Network Access (Already Set Up)

Your app is already configured for local network access:

1. **Start the server:**
```bash
npm run dev
```

2. **Find your IP:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

3. **Access from mobile:**
```
http://YOUR_IP:3000
```

See `LOCAL_NETWORK.md` for details.

---

## Important Notes for Production

### Database Persistence

⚠️ **SQLite on Railway/Render:**
- Your `trades.db` file is stored in the filesystem
- On free tiers, the filesystem is **ephemeral** (resets on restart/redeploy)
- For permanent storage, consider upgrading to:
  - Railway's persistent volumes (paid)
  - PostgreSQL database (free tier available on Railway/Render)

### Recommended for Production

If you want permanent data storage:

1. **Upgrade to PostgreSQL** (recommended for production)
   - Railway offers free PostgreSQL
   - Requires code changes (replace SQLite with PostgreSQL)

2. **Use Railway Volumes** (keeps SQLite file)
   - Paid feature on Railway
   - Simpler, no code changes needed

For now, SQLite works fine for testing and personal use!

---

## Troubleshooting

### Build fails on Railway?

Check the build logs. Common issues:
- Missing dependencies → Run `npm install` locally first
- Build errors → Test `npm run build` locally

### App crashes after deploy?

- Check the deployment logs
- Verify environment variables are set
- Make sure `npm start` works locally

### Can't access the app?

- Check if Railway generated the domain
- Verify the app is running (check logs)
- Test the health endpoint: `https://your-app.railway.app/api/health`

---

## Need Help?

Refer to the full `DEPLOYMENT.md` for more deployment options!

**Your app is now ready to deploy! 🚀**
