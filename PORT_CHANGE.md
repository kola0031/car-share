# Port Change Notice

## Issue
Port 5000 is being used by macOS AirPlay Receiver (AirTunes) service, which causes a 403 Forbidden error.

## Solution
The backend server has been changed to run on **port 3001** instead of 5000.

## Updated Configuration

- **Backend Server**: `http://localhost:3001`
- **API Endpoints**: `http://localhost:3001/api/*`
- **Frontend API URL**: Updated in `.env` file

## Next Steps

1. **Restart your servers** (if running):
   ```bash
   # Stop current servers (Ctrl+C)
   # Then restart:
   npm run dev:all
   ```

2. **Verify the server is running**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

3. **Access the API root**:
   - Browser: `http://localhost:3001/`
   - Should show API information

## Alternative: Disable AirPlay Receiver (Optional)

If you prefer to use port 5000, you can disable AirPlay Receiver:

1. Go to **System Settings** → **General** → **AirDrop & Handoff**
2. Turn off **AirPlay Receiver**

Then revert the port back to 5000 in `server/.env` and `.env` files.

## Testing

After restarting, test the login:
- Email: `test@hostpilot.com`
- Password: `test123456`
- Login URL: `http://localhost:5173/login`

