# Local Network Access

Access your Trade Journal from mobile, tablets, or other devices on the same WiFi network.

## Setup (Already Configured!)

The app is now configured to accept connections from your local network.

## How to Access from Mobile/Other Devices:

### Step 1: Find Your Computer's IP Address

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Look for something like `192.168.1.xxx` or `10.0.0.xxx`

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

**On Linux:**
```bash
hostname -I
```

### Step 2: Start the Server

```bash
npm run dev
```

You'll see output like:
```
[0] 🚀 Server running on http://localhost:5001
[0] 🌐 Network access: Find your IP and use http://YOUR_IP:5001
[1] ➜  Local:   http://localhost:3000/
[1] ➜  Network: http://192.168.1.5:3000/  ← Use this URL!
```

### Step 3: Access from Other Devices

On your mobile phone or other device:

**Frontend (Main App):**
```
http://YOUR_IP:3000
```

Example: `http://192.168.1.5:3000`

**Important Notes:**

✅ **Same WiFi Required**: All devices must be on the same WiFi network
✅ **Firewall**: You may need to allow ports 3000 and 5001 in your firewall
✅ **Server Must Run**: Your laptop must be running `npm run dev`
✅ **Share Database**: All devices share the same trades database

## Troubleshooting

### Can't connect from mobile?

1. **Check firewall:**
   
   On Mac:
   - System Preferences → Security & Privacy → Firewall
   - Allow incoming connections for Node

2. **Verify IP address:**
   - Make sure you're using the correct IP
   - Try pinging from your phone: `ping YOUR_IP`

3. **Check WiFi:**
   - Both devices on same network
   - Not using VPN
   - Not on guest WiFi

### Still not working?

Try accessing the health check endpoint from phone browser:
```
http://YOUR_IP:5001/api/health
```

Should return: `{"success":true,"message":"Server is running"}`

## Limitations

- ⚠️ Only works when laptop is on and server is running
- ⚠️ Only works on same WiFi network
- ⚠️ IP address may change when you reconnect to WiFi

For access from anywhere (not just local WiFi), see `DEPLOYMENT.md`
