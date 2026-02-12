# Troubleshooting Guide

## "Failed to save trade" Error

This error typically occurs when the backend server is not running or cannot be reached.

### Solution:

1. **Check if the backend is running:**
   
   Open your terminal and make sure you ran:
   ```bash
   npm run dev
   ```
   
   This command starts BOTH the frontend and backend together.

2. **Look for these messages in your terminal:**
   ```
   🚀 Server running on http://localhost:5000
   📊 Trade Journal API ready
   ✅ Database initialized
   ```
   
   If you don't see these messages, the backend is not running.

3. **If backend won't start:**
   
   Check for errors in the terminal. Common issues:
   - Port 5000 already in use
   - Missing dependencies
   
   **Fix for port already in use:**
   ```bash
   # On Mac/Linux, kill process on port 5000:
   lsof -ti:5000 | xargs kill -9
   
   # Then run again:
   npm run dev
   ```

4. **Verify server is accessible:**
   
   Open your browser and go to:
   ```
   http://localhost:5000/api/health
   ```
   
   You should see:
   ```json
   {"success":true,"message":"Server is running"}
   ```

5. **Check browser console:**
   
   Press `F12` (or Cmd+Option+I on Mac) and go to the Console tab.
   Look for detailed error messages that will tell you exactly what's wrong.

## Other Common Issues

### Database errors

**Symptom:** Server crashes or errors about database
**Solution:** 
- Delete `server/trades.db` and restart the server
- It will recreate the database automatically

### CORS errors

**Symptom:** Console shows "CORS policy" errors
**Solution:**
- Make sure Vite proxy is configured (already done)
- Restart both servers: `npm run dev`

### Frontend can't connect to backend

**Symptom:** All API calls fail
**Solution:**
- Make sure frontend is on port 3000
- Make sure backend is on port 5000
- Check firewall isn't blocking localhost connections

## Debug Mode

To see detailed API logs, open browser console (F12) and check the output when:
- Creating a trade
- Updating a trade
- Deleting a trade

All API calls now log detailed information to help diagnose issues.

## Still Having Issues?

1. Stop all servers (Ctrl+C in terminal)
2. Delete `node_modules` folder
3. Delete `package-lock.json`
4. Run: `npm install`
5. Run: `npm run dev`
