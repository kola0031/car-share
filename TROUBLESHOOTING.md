# Troubleshooting Guide

## "Failed to Fetch" Error

If you're getting a "Failed to fetch" or "Unable to connect to server" error, follow these steps:

### 1. Check if Backend Server is Running

The backend server must be running on port 5000. Check by running:

```bash
# Check if server is running
curl http://localhost:5000/api/health
```

If you get a response like `{"status":"OK","message":"Server is running"}`, the server is running.

If not, start the backend server:

```bash
# Option 1: Run both frontend and backend
npm run dev:all

# Option 2: Run backend only
npm run dev:server
```

You should see: `🚀 Server running on http://localhost:5000`

### 2. Check Environment Variables

Make sure you have a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

And `server/.env` file:

```env
PORT=5000
JWT_SECRET=hostpilot-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### 3. Check CORS Configuration

The backend should have CORS enabled (which it does by default). If you're still having issues, check `server/index.js` to ensure:

```javascript
app.use(cors());
```

### 4. Check Browser Console

Open your browser's Developer Tools (F12) and check:
- **Console tab**: Look for specific error messages
- **Network tab**: Check if requests to `http://localhost:5000/api/*` are being made
  - If requests show as "pending" or "failed", the server isn't running
  - If requests show CORS errors, check CORS configuration

### 5. Common Issues

#### Port Already in Use
If port 5000 is already in use:

```bash
# Find what's using port 5000
lsof -ti:5000

# Kill the process (replace PID with the number from above)
kill -9 PID

# Or change the port in server/.env
PORT=5001
```

#### Firewall Blocking Connection
Make sure your firewall isn't blocking localhost connections.

#### Wrong API URL
Check that your frontend is using the correct API URL. In browser console, check:
```javascript
console.log(import.meta.env.VITE_API_URL);
```

### 6. Quick Test

Test the backend directly:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@hostpilot.com","password":"test123456"}'
```

If these work, the backend is fine and the issue is with the frontend connection.

### 7. Restart Everything

Sometimes a fresh start helps:

```bash
# Stop all processes (Ctrl+C)
# Then restart
npm run dev:all
```

### Still Having Issues?

1. Check the terminal where the backend is running for error messages
2. Check browser console for detailed error messages
3. Verify both servers are running (frontend on 5173, backend on 5000)
4. Try accessing the API directly: http://localhost:5000/api/health

