# How to run BizMind AI

## Quickest path (one double-click)

1. Open File Explorer to `c:\projects\New folder\BizMind-AI`
2. Double-click **`start.bat`**
3. Watch the console — you should see:
   ```
   [1/4] Cleaning up old Node processes (if any)...
   [2/4] Checking configuration...
   [3/4] Wiring up node_modules for Vite...
   [4/4] Starting BizMind AI on http://localhost:4000
   ✅ MongoDB connected: ...
   🎨 Vite middleware mounted. Frontend root: c:\projects\New folder\BizMind-AI
   🚀 BizMind AI Backend listening on http://0.0.0.0:4000
   ```
4. Open your browser at **http://localhost:4000**

That URL serves BOTH the React frontend and the API.

---

## Why `start.bat` does what it does

| Step | What | Why |
| --- | --- | --- |
| 1 | `for /f ... netstat -ano → taskkill /PID` | Kills only the Node process holding port 4000 (your other terminals stay safe) |
| 2 | Checks `bizmind-server\.env` exists | Server won't start without it |
| 3 | `mklink /J node_modules bizmind-client\node_modules` | Vite's root is the workspace root, but `node_modules` actually lives inside `bizmind-client\`. The junction (Windows symlink) makes Vite find every dep (`react`, `react-dom`, `motion`, etc.) without moving anything. |
| 4    | `cd bizmind-server && node server.js`                                                           | Starts the full stack: API + Vite middleware + React app on port 4000 |

> **Note:** `node_modules` at the workspace root is also auto-created by `server.js` at startup, so even running `node bizmind-server/server.js` directly works after the first time.

---

## If it still doesn't work

### Check 1 — Did Vite mount?

Look for `🎨 Vite middleware mounted. Frontend root: ...` in the console. If you see a `⚠️ Frontend NOT served` warning instead, open `http://localhost:4000/` and you'll see a fallback HTML page explaining what's missing.

### Check 2 — Did MongoDB connect?

Look for `✅ MongoDB connected: .../bizmind_ai`. If you see `⚠️ MongoDB connection failed`, the API still runs but every endpoint that touches the DB will 500.

Fix:

1. Open https://cloud.mongodb.com → your cluster → **Network Access**
2. Click **Add IP Address** → **Add Current IP Address** → Confirm
3. Wait ~30s for the change to propagate, then re-run `start.bat`

### Check 3 — Browser console errors

If the page loads but is blank, press **F12 → Console** and paste the errors here. Common ones:
- `Failed to resolve import "react"` → junction wasn't created. Run `start.bat` again and look for step 3.
- `404` for `src/main.tsx` → Vite root is wrong. Tell me.

### Check 4 — Port already in use

If you see `EADDRINUSE :::4000`, run `start.bat` again — step 1 kills the old process. If it persists, open Task Manager → Details → kill any `node.exe` → try again.

---

## What works out of the box

- **Frontend** (React + Vite) at http://localhost:4000
- **API health check** at http://localhost:4000/api/health
- **User registration & login** (needs MongoDB Atlas reachable)
- **File upload** (CSV / Excel / PDF) — needs MongoDB
- **Inventory, analytics, dashboard** — needs MongoDB

## What needs API keys

These features return 503 until you set real keys in `bizmind-server\.env`:

- **AI Chat** — set `GEMINI_API_KEY` (https://aistudio.google.com/app/apikey)
- **Fast AI recommendations** — set `GROQ_API_KEY` (https://console.groq.com/keys)

Open `bizmind-server\.env`, replace the two placeholder lines with your real keys, then re-run `start.bat`.

---

## Manually starting (if you don't want the .bat)

```powershell
cd "c:\projects\New folder\BizMind-AI\bizmind-server"
node server.js
```

Then open http://localhost:4000.

---

## Useful URLs

| URL                                      | What it is            |
| ---------------------------------------- | --------------------- |
| http://localhost:4000/                   | React frontend (SPA)  |
| http://localhost:4000/api/health         | API health check      |
| http://localhost:4000/api/auth/register  | POST — create account |
| http://localhost:4000/api/auth/login     | POST — log in         |
| http://localhost:4000/api/analytics/summary | GET — analytics     |