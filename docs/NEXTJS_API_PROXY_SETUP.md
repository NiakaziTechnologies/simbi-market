# Next.js: HTTPS Mixed-Content Fix (Same-Origin API Proxy)

Step-by-step instructions to apply the **same fix used in this project** to another **Next.js** app.

**Problem:** The site is live on **HTTPS** (e.g. Vercel → `https://www.example.com`) but the API is **HTTP** (e.g. `http://203.0.113.10:5003`). The browser blocks those calls (*Mixed Content*).

**Fix:** The browser only calls **`https://www.example.com/api/backend/...`**. Next.js **rewrites** that path to your real HTTP API on the server. The browser never sees the `http://` URL.

---

## Before you start

Gather:

| Item | Example |
|------|---------|
| Public site URL (HTTPS) | `https://www.example.com` |
| Real API base (HTTP) | `http://203.0.113.10:5003` |
| API path style | Usually `/api/auth/login`, `/api/products`, etc. |
| Existing Next routes under `/api` | e.g. `app/api/geocode` — avoid clashes |

Pick a **proxy prefix** that does not conflict with your own `app/api/*` routes. This project uses:

**`/api/backend`**

---

## Step 1 — Add a rewrite in `next.config`

Open `next.config.js`, `next.config.mjs`, or `next.config.ts`.

1. Define the real backend URL (use an env var in production):

   - `BACKEND_URL` = `http://YOUR_IP:YOUR_PORT` (no trailing slash)

2. Add an `async rewrites()` block:

   - **Source (public):** `/api/backend/:path*`
   - **Destination (internal):** `${BACKEND_URL}/:path*`

**How paths combine**

If your client calls:

`{baseURL}/api/auth/login`

and `baseURL` is `/api/backend`, the full path is:

`/api/backend/api/auth/login`

The rewrite sends that to:

`http://YOUR_IP:PORT/api/auth/login`

So `:path*` must capture `api/auth/login` — which matches `destination: ${backendUrl}/:path*`.

3. Redeploy after this change (Vercel / your host). Rewrites are applied at build/deploy time.

**Optional:** Use the same default IP/port in `next.config` as in your config module, or rely only on `BACKEND_URL` in the host’s environment variables.

---

## Step 2 — Central API config module

Create or update something like `lib/config.ts` (path is up to you).

### Constants

1. **`DEFAULT_PRODUCTION_API_URL`** — direct HTTP API, e.g. `http://203.0.113.10:5003`  
   Used for: rewrite target default, local dev fallback, SSR direct calls.

2. **`API_PROXY_PATH`** — public same-origin path, e.g. `/api/backend`  
   Used for: browser on HTTPS only.

### `getBaseURL()` logic (order matters)

1. If **`NEXT_PUBLIC_API_URL`** is set → use it (trim, strip trailing slash).  
   Use this when you later move to `https://api.example.com` and want to skip the proxy.

2. Else if **browser** and **`window.location.protocol === 'https:'`** → return **`API_PROXY_PATH`** (e.g. `/api/backend`).

3. Else if **server** (`typeof window === 'undefined'`) and **`BACKEND_URL`** is set → return that (direct HTTP for SSR).

4. Else → return **`DEFAULT_PRODUCTION_API_URL`** (good for `http://localhost:3000` local dev).

Export:

- `getApiBaseURL` (alias of `getBaseURL`)
- `API_CONFIG` with a **getter** `baseURL` that calls `getBaseURL()` every time (not a frozen string).

---

## Step 3 — Wire the HTTP client

Find your shared API layer (`api-client`, `fetch` wrapper, axios instance).

### Do

- Import **`getApiBaseURL()`** (or `API_CONFIG.baseURL` getter).
- Build each request URL as: **`getApiBaseURL() + endpoint`**  
  where `endpoint` is already `/api/...` (leading slash).

### Do not

- Store `baseURL` once in the constructor at module load if server and client differ.
- Hardcode `http://IP:port` in components.

If you had `this.baseURL = ...` in a class constructor, replace with **`resolveBaseURL()`** called inside `get`, `post`, `put`, `delete`, etc.

---

## Step 4 — Find and fix other callers

Search the repo for:

- `http://` + your server IP or port  
- `NEXT_PUBLIC_API_URL` fallbacks to raw HTTP  
- `fetch(\`http://`  
- `DEFAULT_PRODUCTION_API_URL` used for **images** or file URLs  

Update each to use **`getApiBaseURL()`** (same rules as the API client).

Typical places:

- Guest checkout / public `fetch` not using the shared client  
- Commerce / shipping helpers  
- Admin dashboards that prefix relative image paths with the API host  

**Images on HTTPS pages:** If `src` is still `http://203.0.113.10:5003/uploads/...`, images will be blocked too. They must use `/api/backend/uploads/...` or `https://...`.

---

## Step 5 — Environment variables (hosting)

On **Vercel** (or similar), set:

| Variable | When | Value |
|----------|------|--------|
| `BACKEND_URL` | Server / rewrites | `http://YOUR_IP:YOUR_PORT` |
| `NEXT_PUBLIC_API_URL` | Optional override | Full public API URL if you stop using the proxy (e.g. `https://api.example.com`) |

You do **not** need `NEXT_PUBLIC_API_URL` for the proxy trick if Step 2 detects HTTPS automatically.

For **local dev:**

- `npm run dev` on `http://localhost:3000` → config usually uses **direct** `DEFAULT_PRODUCTION_API_URL` (no mixed content on localhost).
- To test the proxy locally, open the app via HTTPS or temporarily force `API_PROXY_PATH` in config (not required for day-to-day dev).

---

## Step 6 — Deploy and verify

1. Commit and push; let the host rebuild.
2. Open the **live HTTPS** site → DevTools → **Network**.
3. Log in or trigger any API call.
4. Confirm:
   - Request URL is **`https://your-domain.com/api/backend/api/...`**
   - **Not** `http://IP:port/...`
   - Status is not *(blocked:mixed-content)*

**Quick curl test (from your machine):**

Request the public HTTPS proxy URL (replace host and path):

`https://www.example.com/api/backend/api/health`

You should get a response from your backend (or 404 from the API — but not mixed-content in the browser).

---

## Step 7 — Checklist

- [ ] Rewrite added in `next.config` (`/api/backend/:path*` → `BACKEND_URL/:path*`)
- [ ] `lib/config.ts` (or equivalent) with HTTPS → proxy path logic
- [ ] API client resolves base URL per request
- [ ] No remaining hardcoded `http://IP:port` in app code
- [ ] Image / asset URLs use the same base URL helper
- [ ] Proxy prefix does not clash with `app/api/*` routes
- [ ] `BACKEND_URL` set on production host
- [ ] Redeployed and verified on HTTPS production URL

---

## Troubleshooting

| Symptom | Likely cause | What to do |
|--------|----------------|------------|
| Still mixed content | Client still uses `http://IP:port` | Search codebase; fix config / env |
| 404 on proxy URL | Wrong path mapping | Check full URL: `/api/backend` + `/api/...`; adjust rewrite |
| 404 on direct IP | API route mismatch | Test `http://IP:port/api/...` with curl |
| Works locally, fails on Vercel | Rewrite not deployed / wrong `BACKEND_URL` | Check Vercel env + redeploy |
| `ERR_UNSAFE_PORT` | Browser blocks port (e.g. 6000) | Change API port or use 80/443 proxy |
| API unreachable | Firewall / bind address | API on `0.0.0.0`, open port on VPS + cloud |
| SSR errors | Server fetch wrong host | Set `BACKEND_URL` for server-side branch |

---

## Path prefix naming

If `/api/backend` clashes with your app:

- Use `/backend-proxy/:path*` or `/external-api/:path*`
- Update **`API_PROXY_PATH`** and the **rewrite `source`** to match
- Update **`getBaseURL()`** to return the same path

---

## Later: remove the proxy

When the API has its own HTTPS (e.g. `https://api.example.com`):

1. Set **`NEXT_PUBLIC_API_URL=https://api.example.com`**
2. Deploy — `getBaseURL()` will use that and skip the proxy path
3. Optionally remove rewrites from `next.config`

---

## Summary

| Layer | Production (HTTPS site) | Local dev (`http://localhost`) | SSR (Node) |
|-------|-------------------------|--------------------------------|------------|
| Browser | `/api/backend` | Direct `http://IP:port` or localhost API | — |
| Next rewrite | → `http://IP:port` | Same if you test proxy | — |
| Server fetch | — | — | `BACKEND_URL` or direct HTTP |

The “trick” is one sentence: **never let the HTTPS frontend call HTTP directly; call your own domain and let Next.js forward to the API.**
