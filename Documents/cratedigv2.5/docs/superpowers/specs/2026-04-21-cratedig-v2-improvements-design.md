# CrateDig v2.5 — Functionality Improvements Design

**Date:** 2026-04-21  
**Scope:** Functionality-only improvements. No UI/visual changes.  
**Goal:** More daily users via real purchases, better pool management, stable admin flow.

---

## Section 1 — Code Audit & Cleanup

**Problems to fix:**

- Commit existing uncommitted changes (HTML entity fixes in `VIDEO_POOL`, error handling in admin drumkits save)
- Remove all `console.log` debug statements from `app/admin/drumkits/page.tsx`
- Replace `alert()` calls (admin drumkits save errors, pool builder copy) with `sonner` toasts — `sonner` is already installed
- `deleteDrumkit` has no error handling — add it
- Drumkits page cart is pure local state with no persistence or checkout — wired up in Section 4

**Files touched:** `app/admin/drumkits/page.tsx`, `components/sample-digger.tsx`

---

## Section 2 — Video Pool → Supabase

**Goal:** Eliminate the copy/paste-into-code workflow. Pool grows to 1000 tracks without ever touching source files.

**Supabase:**
- Table: `video_pool` — single row `{ id: 1, pool: jsonb }`
- RLS: public read, service-role write (pool builder uses anon key but admin-only write policy via `profiles.is_admin`)

**App load (`SampleDigger`):**
- On mount, fetch `video_pool` row from Supabase
- If fetch succeeds and pool is non-empty, use it
- If fetch fails or row is empty, fall back to hardcoded `VIDEO_POOL` constant (kept in file as seed)
- Pool stored in component state — no runtime API calls during digging

**Pool Builder changes:**
- "Build" button behavior unchanged — still calls YouTube API, finds new tracks, merges with existing
- Existing pool source for merge changes: read from Supabase `video_pool` row (not hardcoded constant) so it always builds on top of latest saved state
- Replace "Copy JSON" button with "Save to Supabase" button — upserts merged result into `video_pool` row
- Keep log output visible so user can see what was added
- No code edits, no redeployment needed after a build

**Files touched:** `components/sample-digger.tsx`

---

## Section 3 — Admin Drumkits (finish fixing)

**Gaps to close:**

- Add `stripe_price_id` text field to the admin form — admin pastes the Stripe Price ID (e.g. `price_xxx`) when creating/editing a kit
- Add pre-submit validation: if image or zip not uploaded, show a toast error and block save
- On `deleteDrumkit`: after deleting the DB row, also delete the cover image from `drumkit-covers` bucket and the zip from `drumkit-files` bucket using the stored paths

**Files touched:** `app/admin/drumkits/page.tsx`

---

## Section 4 — Stripe Purchases + Account Downloads

### 4a — Stripe Checkout

**Setup (manual, done in Stripe dashboard):**
- Admin creates a Product + Price per drumkit in Stripe dashboard
- Pastes the `price_xxx` ID into the admin drumkits form (Section 3)

**Checkout flow:**
- Drumkits page "Add to Cart" button opens Stripe Checkout directly (single-item checkout, no cart persistence needed for v1)
- Hitting buy → POST `/api/checkout` with `{ drumkit_id }` → server creates Stripe Checkout Session with the kit's `stripe_price_id`, success URL `/checkout/success?session_id={CHECKOUT_SESSION_ID}`, cancel URL `/drumkits`
- Stripe redirects to success page → `/api/checkout/verify` validates session, writes to `purchases` table

**New files:**
- `app/api/checkout/route.ts` — creates Stripe session
- `app/api/checkout/verify/route.ts` — validates session, inserts purchase
- `app/checkout/success/page.tsx` — minimal success page ("Purchase complete — go to Downloads")

### 4b — Purchases Table (Supabase)

```sql
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  drumkit_id uuid references drumkits not null,
  stripe_session_id text unique not null,
  created_at timestamptz default now()
);
-- RLS: users can only read their own rows
```

### 4c — Signed Download API

- `GET /api/download?drumkit_id=xxx`
- Verifies user is authenticated
- Checks `purchases` table for matching `user_id + drumkit_id`
- If found: generates a 60-minute signed URL from `drumkit-files` Supabase storage for the kit's `file_url` path
- Redirects user to signed URL

**New file:** `app/api/download/route.ts`

### 4d — Account Downloads (Avatar Dropdown)

- On the drumkits page, clicking the avatar opens a dropdown (already has avatar UI — extend it)
- Dropdown fetches `purchases` joined with `drumkits` for the current user
- Shows each purchase: kit name, cover thumbnail, Download button → hits `/api/download?drumkit_id=xxx`
- Sign Out button at bottom

**Files touched:** `app/drumkits/page.tsx`

---

## Supabase Tables Summary

| Table | Purpose |
|-------|---------|
| `video_pool` | Single JSONB row holding entire VIDEO_POOL |
| `purchases` | Records of completed Stripe purchases per user |
| `drumkits` | Existing — add `stripe_price_id` column if not already there |

---

## Environment Variables Needed

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx   (optional for webhooks, not used in v1)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## Out of Scope (future)

- User avatar image upload (noted for next session)
- Webhook-based purchase verification (v1 uses redirect verify)
- Cart with multiple items
- Discount codes
