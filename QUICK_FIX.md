# Quick Fix for White Screen

## Immediate Steps:

1. **Open Browser Console (F12)** and check for errors
2. **Stop all node processes** and restart dev server

## Quick Restart Script:

Run this in PowerShell:

```powershell
# Stop all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Navigate to project
cd C:\Users\ASUS\prd\med-fused-mind

# Start dev server
npm run dev
```

Then open http://localhost:8080 in your browser.

## If Still White Screen:

1. **Check Browser Console (F12 → Console tab)** - Look for red errors
2. **Check Network Tab (F12 → Network)** - See if files are loading
3. **Try Hard Refresh**: Ctrl + Shift + R or Ctrl + F5
4. **Clear Browser Cache**: Ctrl + Shift + Delete

## Common Fixes:

- **"Cannot find module"** → Run `npm install`
- **Port already in use** → Change port in `vite.config.ts` or kill the process
- **React errors** → Check browser console for specific error messages

Share the browser console errors for more specific help!

