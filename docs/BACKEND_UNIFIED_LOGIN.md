
The Simbi **frontend** uses **one login form** for all users (buyer, seller, staff, admin). There are **no role toggles** on the login page.

The frontend calls:

- `POST /api/auth/login` — everyone
- `GET /api/auth/me` — session refresh for everyone

Admin-only features (team management, audit trail, change password while logged in) still use **`/api/admin/*`** routes with the same JWT.

We are **not** using `POST /api/admin/auth/login` from the frontend anymore.

---

## What the backend must do

### 1. `POST /api/auth/login` — resolve user type automatically

Given `{ email, password }`, the server must:

1. Look up the account in the correct table(s) — **buyers**, **sellers/staff**, and **admins** can share the same email in different tables.
2. Authenticate against the matching record (password hash).
3. Return **`userType`** so the frontend knows where to redirect:
   - `"buyer"` → buyer dashboard
   - `"seller"` → seller dashboard
   - `"staff"` → seller dashboard (with staff role in `user.role`)
   - `"admin"` → admin dashboard

**Resolution order (recommended):** If the same email exists in multiple tables, define explicit priority or reject with a clear error. Document the rule. Example: check admin first if password matches admin row, else seller, else buyer — or require unique emails across types.

4. For **admin** login:
   - Check `status === ACTIVE` (reject suspended/inactive with 401 + message).
   - Issue a JWT that works on **`/api/admin/*`** routes (same secret/claims as today).
   - Record audit log: `LOGIN` with the admin’s `id`.
   - **Do not** return `password`, `passwordResetToken`, or `mfaSecret`.

### 2. Login response shape (admin)

When `userType === "admin"`, include full admin profile in `data.user`:

```json
{
  "success": true,
  "data": {
    "userType": "admin",
    "accessToken": "eyJ...",
    "expiresIn": "7d",
    "refreshToken": "...",
    "user": {
      "id": "uuid",
      "email": "tariro@simbimarket.com",
      "firstName": "Tariro",
      "lastName": "Moyo",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "mfaEnabled": false,
      "lastLoginAt": "2026-05-26T09:00:00.000Z",
      "mustChangePassword": false
    }
  }
}
```

**Important:** For admins, `user.role` is the **admin JWT role** (`SUPER_ADMIN`, `FINOPS_ANALYST`, etc.), not the string `"admin"`. The frontend uses `userType: "admin"` for routing and `user.role` for RBAC.

Same fields should be returned for seller/buyer/staff as you already do today.

### 3. `GET /api/auth/me` — unified session

For any authenticated user, return profile consistent with login:

- **Admin:** same fields as login `user` object + `userType: "admin"`.
- **Buyer / seller / staff:** existing shape unchanged.

Frontend maps this into session storage for header display (name, email, admin role label).

### 4. JWT claims for admins

Token from unified login must:

- Be accepted by existing `authenticateAdmin` middleware on `/api/admin/*`.
- Include admin `id` and role claim used by RBAC (`SUPER_ADMIN`, etc.).
- **Not** require a separate admin-only login endpoint.

If today’s admin JWT is only issued by `/api/admin/auth/login`, **extend** `/api/auth/login` to issue the **same** token format when `userType === "admin"`.

### 5. Keep these admin-only endpoints (unchanged)

Frontend still calls these with `Authorization: Bearer <token>`:

| Method | Path | Purpose |
|--------|------|---------|
| PUT | `/api/admin/auth/change-password` | Logged-in admin changes password |
| GET | `/api/admin/auth/admins` | Super Admin lists team |
| POST | `/api/admin/auth/admins` | Super Admin invites admin |
| PUT | `/api/admin/auth/admins/:id` | Super Admin updates/suspends |
| GET | `/api/admin/audit/activity-logs` | Super Admin audit trail |

Optional: **`GET /api/admin/auth/me`** can remain for backward compatibility but frontend now uses **`GET /api/auth/me`** for admins.

### 6. Forgot / reset password

Frontend uses unified:

- `POST /api/auth/forgot-password` with `{ email, userType?: "admin" }` when needed
- `POST /api/auth/reset-password` with `{ token, newPassword, userType?: "admin" }`

Backend must resolve admin vs buyer vs seller from `userType` or by looking up which table owns the email.

After reset, admin signs in again via **`POST /api/auth/login`** only.

### 7. Edge cases

| Case | Expected behavior |
|------|-------------------|
| Admin email + wrong password | 401, generic “Invalid email or password” |
| Suspended admin | 401, message e.g. “Account is suspended…” |
| Same email is buyer and admin | Define rule: either one wins or login fails with “Multiple accounts” |
| Valid admin credentials | `userType: "admin"`, redirect to admin app |
| Valid buyer credentials | `userType: "buyer"` |

### 8. Audit trail on unified admin login

When login succeeds for an admin via `/api/auth/login`:

- Write `LOGIN` to activity log with that admin’s `id` (same as when using the old admin login endpoint).

---

## Acceptance checklist (backend)

- [ ] Admin can log in via `POST /api/auth/login` with no separate endpoint required by frontend.
- [ ] Response includes `userType: "admin"` and full `user` profile with `role: SUPER_ADMIN | …`.
- [ ] JWT from unified login works on all `/api/admin/*` routes.
- [ ] `GET /api/auth/me` returns admin profile for admin tokens.
- [ ] Suspended/inactive admins cannot log in.
- [ ] `LOGIN` audit row created on admin login.
- [ ] Sensitive fields never returned in API responses.
- [ ] Team + audit + change-password admin routes still work with unified JWT.

---

## Frontend behavior (for reference)

After login, frontend redirects by **`userType`** / **`role`** from response:

- `admin` → `/dashboard/admin`
- `seller` / `staff` → `/dashboard/seller`
- `buyer` → `/dashboard/buyer`

No login UI toggles. Single email + password form.
