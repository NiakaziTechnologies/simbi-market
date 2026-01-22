# Deployment Guide

## Environment Variables Setup

### For Vercel Deployment

You need to set the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
NEXT_PUBLIC_SELLER_API_BASE_URL=https://simbi-three.vercel.app
JWT_SECRET=7d3cefb645b1105bef4e8bdd72f28f35e84350a644b4210b637f5b93674e25d9
JWT_REFRESH_SECRET=527cc57c3613f343961899c64a57179465259e1ae37441eefdb82e925d2cdb3e
```

**Important:** Make sure to set these for the **Production** environment.

### Why This Fixes the CORS Error

The CORS error occurs when the frontend tries to call an external API directly. By setting `NEXT_PUBLIC_SELLER_API_BASE_URL=/api/seller`, the frontend will use the Next.js API routes (same domain), which:

1. ✅ Avoids CORS issues (same-origin requests)
2. ✅ Keeps your API logic secure on the server
3. ✅ Allows you to add middleware, authentication, and rate limiting
4. ✅ Works seamlessly in both development and production

### Architecture

```
Frontend (Browser)
    ↓
Next.js API Routes (/api/seller/*)
    ↓
Your Backend Logic (in app/api/seller/)
```

## Deployment Steps

1. **Set environment variables in Vercel** (as described above)
2. **Push your code to GitHub**
3. **Vercel will automatically deploy**
4. **Test the login functionality**

## Local Development

For local development, create a `.env.local` file in your project root:

```
# For external backend (your simbi-three.vercel.app)
NEXT_PUBLIC_SELLER_API_BASE_URL=https://simbi-three.vercel.app

# For same-domain API routes (alternative)
# NEXT_PUBLIC_SELLER_API_BASE_URL=/api/seller

# JWT Secrets
JWT_SECRET=7d3cefb645b1105bef4e8bdd72f28f35e84350a644b4210b637f5b93674e25d9
JWT_REFRESH_SECRET=527cc57c3613f343961899c64a57179465259e1ae37441eefdb82e925d2cdb3e
```

**Choose your backend strategy:**
- **External Backend**: Use `https://simbi-three.vercel.app` (your current setup)
- **Same-Domain API**: Use `/api/seller` (Next.js API routes)

## Troubleshooting

### Still getting CORS errors?

1. Check that environment variables are set in Vercel
2. Redeploy after setting environment variables
3. Clear browser cache and try again
4. Check browser console for the actual API URL being called (should be `/api/seller/auth/login`, not an external URL)

### JWT errors?

Make sure the JWT secrets match between your frontend and any external backend services you're using.