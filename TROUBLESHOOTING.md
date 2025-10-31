# Troubleshooting White Screen Issue

If you're seeing a white screen on localhost:8080, follow these steps:

## Step 1: Check if Dev Server is Running

```bash
# Stop any running processes
taskkill /F /IM node.exe

# Navigate to project directory
cd C:\Users\ASUS\prd\med-fused-mind

# Install dependencies (if needed)
npm install

# Start the dev server
npm run dev
```

You should see output like:
```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

## Step 2: Check Browser Console

1. Open Chrome/Edge
2. Press `F12` or right-click → Inspect
3. Go to the **Console** tab
4. Look for red error messages
5. Share any errors you see

## Step 3: Clear Browser Cache

1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page (`Ctrl + F5`)

## Step 4: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for failed requests (red)
5. Check if `main.tsx` or other files are loading

## Step 5: Verify Port 8080

```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080
```

If another process is using it, either:
- Kill that process
- Change the port in `vite.config.ts`

## Step 6: Common Issues

### Issue: "Cannot find module" errors
**Solution:** 
```bash
npm install
```

### Issue: React Hook errors
**Solution:** Make sure you're using React 18.3+

### Issue: CORS errors
**Solution:** The vite config should handle this automatically

### Issue: Blank page with no errors
**Solution:** Check if `index.html` has the root div and script tag

## Step 7: Test with Build

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

If the preview works, the issue is with the dev server.

## Step 8: Manual Server Check

Try accessing: http://localhost:8080/src/main.tsx
(You should see the TypeScript source, not render it)

## Quick Fix Script

Run this PowerShell script to reset everything:

```powershell
# Stop all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Navigate to project
cd C:\Users\ASUS\prd\med-fused-mind

# Clean install
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
npm install

# Start dev server
npm run dev
```

## Still Having Issues?

Share:
1. Browser console errors (F12 → Console)
2. Dev server output
3. Network tab errors
4. Any error messages you see

