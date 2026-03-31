# Loan module v2 (database + API contract)

## Apply migration

```bash
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
node database_migrations/run-loan-module-v2.js
```

Install driver once: `pnpm add -D pg` or `npm install pg --save-dev`.

## Prisma (optional)

If the backend uses Prisma, add models equivalent to `loan_module_v2.sql` to `schema.prisma`, then:

```bash
npx prisma generate
```

This frontend repo does not run Prisma migrations; SQL is the source of truth for the schema shape.

## Backend routes (must exist on API base URL)

- Admin: `{BASE}/api/admin/financial-partners` (CRUD + `/loan-applications` + `/:id/secrets`)
- Webhook (no auth): `POST {BASE}/api/webhooks/loans/:partnerSlug/status`

See product spec for payloads and HMAC rules.

The **Simbi Market** Next app calls the admin routes via `lib/api/admin-financial-partners.ts` (JWT from admin login).

## Partner webhook (bank → platform)

`POST /api/webhooks/loans/:partnerSlug/status`

Body: `applicationId`, `status`, `partnerReferenceId`, `rejectionReason`, `approvedAmount`, `signature`.

**Signature:** hex `HMAC-SHA256` of UTF-8 `applicationId|STATUS_UPPER` with secret `integrationSecretsJson.webhookSigningSecret` (or `webhookSecret` if your API uses that alias).

Map incoming `status` strings to your internal enum server-side.
