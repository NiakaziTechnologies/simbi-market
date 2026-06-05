# Option B: Same-Origin API Proxy (Vue + Capacitor + Android)

Use this when your **app UI** is served securely (HTTPS or a trusted Capacitor origin) but your **API** runs on plain **HTTP** (IP + port on a VPS). The goal is: **the WebView never calls the raw `http://` API URL in production**—it calls your **own HTTPS origin**, which forwards to the API on the server.

This guide is written for a **Vue.js + Capacitor Android** app. The ideas apply to iOS too; Android has extra **cleartext HTTP** rules.

---

## The problem

### Mixed content / insecure requests

If the WebView loads your app from **HTTPS** (hosted web app, or Capacitor with HTTPS scheme) and your Vue app calls **`http://203.0.113.10:5003`**, the request can be **blocked**—same idea as a browser “mixed content” error.

### Android cleartext traffic

On **Android 9+**, WebViews and apps often **block unencrypted HTTP** unless you explicitly allow it (`usesCleartextTraffic`, Network Security Config). So even without “mixed content,” **`http://` to a random IP may fail on device**.

### Unsafe ports

Chromium (WebView) may block some ports (e.g. **6000**). Prefer common API ports (**5003**, **8080**, **3006**, or **80/443** behind a reverse proxy).

### Firewall

If the API is unreachable, fix binding (`0.0.0.0`), OS firewall, and cloud security groups—separate from proxy setup.

---

## Option B — What it is

**Do not** point the Android/WebView client at `http://your-server:port` in production.

Instead:

1. Expose a **public HTTPS URL** you control (your marketing site, admin portal, or a small “API gateway” host)—e.g. `https://app.example.com`.
2. Configure that host so path **`/api/backend/*`** (pick any prefix) **forwards** to `http://your-server:port/*` on the server.
3. In the Vue app, set the API **base URL** to that **HTTPS path** when running in production / on device—not to the IP.

**Flow:**

```
Android WebView (Vue app)
  → https://app.example.com/api/backend/api/auth/login
  → Your server (nginx / Caddy / Vercel / Node gateway) proxies internally
  → http://203.0.113.10:5003/api/auth/login
  → Response back over HTTPS to the app
```

The device only sees **HTTPS + same host** as your configured public origin. The HTTP hop happens **only on the server**.

---

## What you need (infrastructure)

| Piece | Role |
|--------|------|
| **Vue app** (Capacitor) | Uses HTTPS base URL for all API and media URLs in production |
| **Public HTTPS host** | Same domain you trust for API proxy (can be the site that hosts your built `dist/` or a dedicated subdomain) |
| **Reverse proxy / rewrite** | Maps `/api/backend/:path` → `http://internal-ip:port/:path` |
| **HTTP API** | Stays on VPS; no TLS required on the API itself if proxy handles HTTPS |

Examples of where to configure the proxy (pick what matches your deploy):

- **nginx** / **Caddy** on the VPS that also serves the Vue `dist`
- **Vite `server.proxy`** — **development only** (local machine)
- **Hosted frontend** (Netlify, Vercel, Cloudflare Pages) — platform “rewrites” or “redirects” to external URL
- **Small Node/Express** “gateway” on HTTPS that forwards to the API

---

## Vue app: base URL logic (concept)

Keep **one module** (e.g. `api/config`) that returns the base URL:

| Context | Base URL |
|--------|-----------|
| **Production / Capacitor on device** | `https://app.example.com/api/backend` (your proxy path—no trailing slash issues; be consistent) |
| **Local dev in browser** (`npm run dev`) | Direct API, e.g. `http://localhost:5003` or your VPS IP (optional: Vite dev proxy so you still use `/api/backend`) |
| **Override** | Env var e.g. `VITE_API_BASE_URL` when you later move to `https://api.example.com` |

**Rules:**

- If the app runs under **HTTPS** (or you treat Capacitor production builds as “secure”), use the **proxy URL**.
- Resolve the base URL when building each request (or via a shared HTTP client), not once at import time, if dev vs prod differs.
- **Images and file URLs** from the API must use the **same** base URL logic—not the raw `http://IP:port`.

Use your HTTP client (axios, fetch wrapper) so every call is:  
`baseURL + '/api/auth/login'` →  
`https://app.example.com/api/backend/api/auth/login`.

---

## Capacitor + Android specifics

### 1. Where the WebView loads from

- **Bundled app** (`webDir: dist`): Origin is often `https://localhost` or `capacitor://localhost` depending on Capacitor version and config. API calls to an **external HTTPS** proxy URL (`https://app.example.com/api/backend`) are usually fine—they are not “mixed” if the target is HTTPS.
- **Live reload / remote URL**: If you load `https://app.example.com` in the WebView, same-origin proxy paths on that host are ideal.

Decide your **production API base** to match how you ship the app (bundled vs remote URL) and stick to **HTTPS** for API in release builds.

### 2. Avoid relying on cleartext HTTP in release

Do **not** depend on `usesCleartextTraffic=true` for production if you can use Option B. Cleartext is a fallback for dev only; stores and security policies prefer HTTPS.

If you must allow HTTP temporarily for debugging, use a **debug** `network_security_config` and document removing it before release.

### 3. CORS

The proxy host must allow your app origin if the browser/WebView enforces CORS (cross-origin from `capacitor://` to `https://app.example.com` is cross-origin). Configure the **proxy/gateway** or API to send:

- `Access-Control-Allow-Origin` (your app origin or `*` only if acceptable)
- Methods and headers you use (`Authorization`, `Content-Type`, etc.)

Same-origin proxy on **the exact host** that serves your UI avoids CORS; cross-subdomain still needs CORS headers.

### 4. Capacitor HTTP plugin (alternative note)

`@capacitor-community/http` talks from **native** code and can bypass some WebView limits. That is a different pattern than Option B. This doc assumes **Option B: WebView fetch → HTTPS proxy → HTTP API**.

---

## Development vs production

| Environment | Typical setup |
|-------------|----------------|
| **Browser dev** | Vite proxy: `/api/backend` → `http://localhost:5003`, base URL `/api/backend` |
| **Android emulator/device dev** | Either same VPS proxy over HTTPS, or temporary direct HTTP + cleartext config (not for store release) |
| **Store release** | Only `https://…/api/backend` (or full `https://api.example.com` when you add TLS on API) |

---

## Proxy path design

- Choose a prefix that does **not** clash with your Vue router or static files, e.g. `/api/backend` or `/gateway`.
- Map so client path segments line up with your API’s paths (often `/api/...` on the backend).
- Test one endpoint (e.g. login) with curl against the **public HTTPS** URL before testing on device.

---

## Checklist (Vue + Capacitor Android)

1. API listens on `0.0.0.0` and port is open on the VPS.
2. Public **HTTPS** host has rewrite/proxy to `http://internal:port`.
3. `VITE_API_BASE_URL` (or equivalent) set for production builds to the **HTTPS proxy** URL.
4. All API + image URLs go through that config—no hardcoded `http://IP`.
5. CORS configured if UI origin and API host differ.
6. Release build: no cleartext-only dependency.
7. On device: Network tab / logging shows `https://app.example.com/api/backend/...`, not `http://IP:port`.
8. Redeploy proxy host after changing rewrite rules.

---

## Verify on Android

1. Install release or debug build with production env.
2. Trigger login (or any API call).
3. Confirm request URL is **HTTPS** and uses your **proxy path**.
4. No “mixed content,” “cleartext not permitted,” or blocked request in logcat/WebView inspector.

---

## Summary

**Option B for Vue + Capacitor Android:**  
Ship the app with an API base URL on **your HTTPS domain** (`/api/backend`). The server proxies to the real **HTTP** API. The WebView never talks to `http://IP:port` in production, which avoids mixed content and most cleartext issues while you keep the API on a simple HTTP port internally.

When you are ready to simplify further, you can later point `VITE_API_BASE_URL` at a dedicated **`https://api.example.com`** and drop the path proxy—but that is a separate migration, not required for Option B to work.
