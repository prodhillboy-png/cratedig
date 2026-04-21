# CrateDig Functionality Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Code audit/cleanup, move video pool to Supabase, finish admin drumkits, add Stripe checkout, and wire user account downloads — all without changing any UI.

**Architecture:** Sequential tasks — cleanup first, then Supabase pool migration, then admin fixes, then Stripe API routes, then wire the drumkits page. Each task commits independently. No test framework is installed so verification is manual browser/curl checks.

**Tech Stack:** Next.js 16 App Router, Supabase (@supabase/ssr), Stripe (npm install needed), TypeScript, Tailwind, sonner (already installed)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `components/sample-digger.tsx` | Fetch pool from Supabase on load; pool builder saves to Supabase |
| Modify | `app/admin/drumkits/page.tsx` | Remove logs/alerts, add stripe_price_id field, validation, storage cleanup on delete |
| Modify | `app/drumkits/page.tsx` | Add auth state, purchases dropdown from avatar, wire buy button to checkout |
| Create | `app/api/checkout/route.ts` | POST — create Stripe Checkout Session |
| Create | `app/api/checkout/verify/route.ts` | GET — verify paid session, insert into purchases |
| Create | `app/api/download/route.ts` | GET — verify ownership, return signed Supabase storage URL |
| Create | `app/checkout/success/page.tsx` | Success page — calls verify, shows download link |
| Create | `lib/supabase/admin.ts` | Service-role Supabase client for server-side writes |

---

## Task 1: Commit existing changes

**Files:** `components/sample-digger.tsx`, `app/admin/drumkits/page.tsx`, `package-lock.json`

- [ ] **Step 1: Stage and commit the pending HTML entity fixes and error handling**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/components/sample-digger.tsx cratedigv2.5/app/admin/drumkits/page.tsx cratedigv2.5/package-lock.json
git commit -m "Fix HTML entities in VIDEO_POOL titles and add error handling to drumkits save"
```

Expected: commit succeeds, `git status` shows clean working tree for these files.

---

## Task 2: Create Supabase tables

**Where:** Supabase dashboard → SQL Editor (https://supabase.com/dashboard)

- [ ] **Step 1: Create `video_pool` table**

Run this SQL in the Supabase dashboard SQL editor:

```sql
create table if not exists video_pool (
  id int primary key default 1,
  pool jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

alter table video_pool enable row level security;

create policy "public read video_pool"
  on video_pool for select using (true);

create policy "admin write video_pool"
  on video_pool for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

- [ ] **Step 2: Seed the table with current pool (empty object — pool builder will populate)**

```sql
insert into video_pool (id, pool) values (1, '{}'::jsonb)
on conflict (id) do nothing;
```

- [ ] **Step 3: Create `purchases` table**

```sql
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  drumkit_id uuid references drumkits not null,
  stripe_session_id text unique not null,
  created_at timestamptz default now()
);

alter table purchases enable row level security;

create policy "users read own purchases"
  on purchases for select using (auth.uid() = user_id);
```

- [ ] **Step 4: Confirm `drumkits` table has `stripe_price_id` column**

```sql
select column_name from information_schema.columns
where table_name = 'drumkits' and column_name = 'stripe_price_id';
```

If the column is missing, run:

```sql
alter table drumkits add column if not exists stripe_price_id text;
```

---

## Task 3: Install Stripe and add environment variables

- [ ] **Step 1: Install Stripe**

```bash
cd c:/Users/cesar/Documents/cratedigv2.5
npm install stripe
```

Expected: `stripe` appears in `package.json` dependencies.

- [ ] **Step 2: Add env vars to `.env.local`**

Open/create `cratedigv2.5/.env.local` and add:

```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

- `STRIPE_SECRET_KEY` — from Stripe dashboard → Developers → API keys → Secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Publishable key from same page
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → Project Settings → API → service_role key
- `NEXT_PUBLIC_APP_URL` — your Vercel production URL (e.g. `https://cratedig.vercel.app`). For local dev use `http://localhost:3000`

Also add these same vars to your Vercel project environment variables (Vercel dashboard → Settings → Environment Variables).

- [ ] **Step 3: Commit package changes (not .env.local — that stays local)**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/package.json cratedigv2.5/package-lock.json
git commit -m "Install stripe"
```

---

## Task 4: Create admin Supabase client

**File:** `cratedigv2.5/lib/supabase/admin.ts` (create)

- [ ] **Step 1: Create the file**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

This client bypasses RLS — only use it in server-side API routes, never in client components.

- [ ] **Step 2: Commit**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/lib/supabase/admin.ts
git commit -m "Add service-role Supabase admin client"
```

---

## Task 5: Clean up admin drumkits page

**File:** `cratedigv2.5/app/admin/drumkits/page.tsx`

- [ ] **Step 1: Replace all `console.log` and `console.error` calls and `alert()` with sonner toasts**

At the top of the file, add the sonner import after the existing imports:

```typescript
import { toast } from 'sonner'
```

- [ ] **Step 2: Remove all `console.log` lines from `uploadCover`**

Find and remove these 2 lines in `uploadCover`:
```typescript
console.log('[DropZone:cover] uploading to drumkit-covers →', path)
// ...
console.log('[DropZone:cover] upload complete, public URL →', publicUrl)
```

- [ ] **Step 3: Remove all `console.error` and `console.log` lines from `uploadZip`**

Find and remove these 2 lines in `uploadZip`:
```typescript
console.error('[DropZone:zip] upload error', error)
// ...
console.log('[DropZone:zip] upload complete, storage path →', data.path)
```

- [ ] **Step 4: Remove all `console.log` lines from drag event handlers**

Remove the `console.log` lines inside `onDragEnter`, `onDragLeave`, and `onDrop`.

- [ ] **Step 5: Replace `alert()` calls in `handleSubmit` with toasts**

Replace:
```typescript
alert(`Failed to update: ${error.message}`)
```
With:
```typescript
toast.error(`Failed to update: ${error.message}`)
```

Replace:
```typescript
alert(`Failed to save: ${error.message}`)
```
With:
```typescript
toast.error(`Failed to save: ${error.message}`)
```

- [ ] **Step 6: Add `stripe_price_id` to the form state**

In the `useState` for `form`, add `stripe_price_id: ''` to the initial state object:

```typescript
const [form, setForm] = useState({
  name: '',
  description: '',
  price: '',
  producer_name: '',
  image_url: '',
  file_url: '',
  tags: '',
  sample_count: '',
  is_featured: false,
  stripe_price_id: '',
})
```

- [ ] **Step 7: Add `stripe_price_id` to `resetForm`**

In `resetForm`, add `stripe_price_id: ''` to the reset object alongside the other fields.

- [ ] **Step 8: Add `stripe_price_id` to `editDrumkit`**

In `editDrumkit`, add:
```typescript
stripe_price_id: kit.stripe_price_id || '',
```
alongside the other fields being set from `kit`.

- [ ] **Step 9: Add `stripe_price_id` to `drumkitData` in `handleSubmit`**

In `handleSubmit`, add to `drumkitData`:
```typescript
stripe_price_id: form.stripe_price_id,
```

- [ ] **Step 10: Add pre-submit validation for uploads**

In `handleSubmit`, right after `setSaving(true)`, add:

```typescript
if (!form.image_url) {
  toast.error('Please upload a cover image before saving.')
  setSaving(false)
  return
}
if (!form.file_url) {
  toast.error('Please upload a ZIP file before saving.')
  setSaving(false)
  return
}
```

- [ ] **Step 11: Add the Stripe Price ID input field to the form JSX**

After the tags input field and before the featured checkbox, add:

```tsx
<div>
  <label className="block text-sm text-[#666] mb-2">Stripe Price ID</label>
  <input
    type="text"
    value={form.stripe_price_id}
    onChange={e => setForm({ ...form, stripe_price_id: e.target.value })}
    className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
    placeholder="price_xxx"
  />
</div>
```

- [ ] **Step 12: Add storage cleanup to `deleteDrumkit`**

Replace the existing `deleteDrumkit` function with:

```typescript
const deleteDrumkit = async (id: string) => {
  if (!confirm('Are you sure you want to delete this drumkit?')) return
  const supabase = createClient()

  const kit = drumkits.find(k => k.id === id)

  const { error } = await supabase.from('drumkits').delete().eq('id', id)
  if (error) {
    toast.error(`Failed to delete: ${error.message}`)
    return
  }

  if (kit?.image_url) {
    const coverPath = kit.image_url.split('/drumkit-covers/')[1]
    if (coverPath) await supabase.storage.from('drumkit-covers').remove([coverPath])
  }

  if (kit?.file_url) {
    await supabase.storage.from('drumkit-files').remove([kit.file_url])
  }

  await fetchDrumkits()
}
```

- [ ] **Step 13: Add error handling to `toggleActive`**

Replace:
```typescript
const toggleActive = async (id: string, currentState: boolean) => {
  const supabase = createClient()
  await supabase.from('drumkits').update({ is_active: !currentState }).eq('id', id)
  await fetchDrumkits()
}
```
With:
```typescript
const toggleActive = async (id: string, currentState: boolean) => {
  const supabase = createClient()
  const { error } = await supabase.from('drumkits').update({ is_active: !currentState }).eq('id', id)
  if (error) toast.error(`Failed to update status: ${error.message}`)
  await fetchDrumkits()
}
```

- [ ] **Step 14: Verify the app runs without errors**

```bash
cd c:/Users/cesar/Documents/cratedigv2.5
npm run dev
```

Navigate to `/admin/drumkits` (as admin). Confirm: no console.logs in terminal, form has Stripe Price ID field, try saving without image/zip — toast errors appear.

- [ ] **Step 15: Commit**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/app/admin/drumkits/page.tsx
git commit -m "Clean up admin drumkits: remove logs, add stripe_price_id field, validate uploads, clean storage on delete"
```

---

## Task 6: Migrate video pool to Supabase

**File:** `cratedigv2.5/components/sample-digger.tsx`

- [ ] **Step 1: Add pool state and Supabase fetch on mount**

In `SampleDigger`, add a new state variable for the live pool after the existing state declarations:

```typescript
const [livePool, setLivePool] = useState<VideoPool | null>(null)
```

Add a `useEffect` to fetch the pool from Supabase on mount (add after the auth `useEffect`):

```typescript
useEffect(() => {
  const supabase = createClient()
  supabase
    .from('video_pool')
    .select('pool')
    .eq('id', 1)
    .single()
    .then(({ data }) => {
      if (data?.pool && Object.keys(data.pool).length > 0) {
        setLivePool(data.pool as VideoPool)
      }
    })
}, [])
```

- [ ] **Step 2: Create a `getPool()` helper inside `SampleDigger`**

Add this just before `digCrate`:

```typescript
const getPool = useCallback((): VideoPool => {
  return livePool ?? VIDEO_POOL
}, [livePool])
```

- [ ] **Step 3: Update `digCrate` to use `getPool()`**

In `digCrate`, replace every reference to `VIDEO_POOL` with `getPool()`:

```typescript
// Replace:
Object.keys(VIDEO_POOL).forEach(g => {
  VIDEO_POOL[g].forEach(v => pool.push(v))
})
genreKey = Object.keys(VIDEO_POOL)[Math.floor(Math.random() * Object.keys(VIDEO_POOL).length)]
// ...
pool = VIDEO_POOL[selectedGenre] || []
```

```typescript
// With:
const activePool = getPool()
Object.keys(activePool).forEach(g => {
  activePool[g].forEach(v => pool.push(v))
})
genreKey = Object.keys(activePool)[Math.floor(Math.random() * Object.keys(activePool).length)]
// ...
pool = activePool[selectedGenre] || []
```

Also update the `deps` array of `digCrate` to include `getPool`.

- [ ] **Step 4: Update `countPool` call to use live pool**

Replace the `const poolCount = countPool()` line with:

```typescript
const poolCount = (() => {
  const p = livePool ?? VIDEO_POOL
  const seen: Record<string, boolean> = {}
  let n = 0
  Object.keys(p).forEach(g => p[g].forEach(v => { if (!seen[v.id]) { seen[v.id] = true; n++ } }))
  return n
})()
```

You can now delete the standalone `countPool()` function from the top of the file.

- [ ] **Step 5: Update `runPoolBuild` to seed from Supabase and save back**

At the top of `runPoolBuild`, replace the seed step:

```typescript
// OLD — seeds from hardcoded constant:
genres.forEach(g => { result[g] = (VIDEO_POOL[g] || []).slice() })

// NEW — seeds from live pool (Supabase) with fallback to hardcoded:
const activePool = livePool ?? VIDEO_POOL
genres.forEach(g => { result[g] = (activePool[g] || []).slice() })
```

- [ ] **Step 6: Replace "Copy JSON" with "Save to Supabase" in `runPoolBuild`**

At the end of `runPoolBuild`, after `setPbOutput(...)`, add:

```typescript
// Auto-save to Supabase
const supabase = createClient()
const { error: saveError } = await supabase
  .from('video_pool')
  .upsert({ id: 1, pool: result, updated_at: new Date().toISOString() })

if (saveError) {
  setPbLog(prev => [...prev, `⚠ Supabase save failed: ${saveError.message}`])
} else {
  setLivePool(result)
  setPbLog(prev => [...prev, `✓ Pool saved to Supabase — live immediately, no code edit needed.`])
}
```

Remove the `setPbOutput` line and the `copyPoolOutput` function entirely.

- [ ] **Step 7: Update the Pool Builder JSX**

Find the "Copy JSON" button in the pool builder JSX and remove it. Remove the `<pre>` block that shows `pbOutput` if present. The log lines are enough — the save is automatic now.

Also remove the `const [pbOutput, setPbOutput] = useState('')` state since it's no longer needed.

- [ ] **Step 8: Verify**

```bash
npm run dev
```

Open the app. Double-click "HILLBOY" in footer → pool builder opens. Run a build with a valid YouTube API key → confirm log shows "✓ Pool saved to Supabase". Check Supabase dashboard → `video_pool` table row has the new JSON. Reload the app → pool count should reflect the saved pool.

- [ ] **Step 9: Commit**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/components/sample-digger.tsx
git commit -m "Move video pool to Supabase — pool builder saves directly, no code edits needed"
```

---

## Task 7: Stripe checkout API route

**File:** `cratedigv2.5/app/api/checkout/route.ts` (create)

- [ ] **Step 1: Create the file**

```typescript
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { drumkit_id } = await req.json()

  if (!drumkit_id) {
    return NextResponse.json({ error: 'Missing drumkit_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Must be logged in to purchase' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('drumkit_id', drumkit_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
  }

  const { data: kit } = await supabase
    .from('drumkits')
    .select('stripe_price_id, name')
    .eq('id', drumkit_id)
    .eq('is_active', true)
    .single()

  if (!kit?.stripe_price_id) {
    return NextResponse.json({ error: 'Kit not available for purchase' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: kit.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/drumkits`,
    customer_email: user.email,
    metadata: { user_id: user.id, drumkit_id },
  })

  return NextResponse.json({ url: session.url })
}
```

- [ ] **Step 2: Verify the route exists**

```bash
npm run dev
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"drumkit_id":"fake"}'
```

Expected: `{"error":"Must be logged in to purchase"}` (401) — confirms the route is reachable.

- [ ] **Step 3: Commit**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/app/api/checkout/route.ts
git commit -m "Add Stripe checkout API route"
```

---

## Task 8: Checkout verify route + success page

**Files:**
- Create: `cratedigv2.5/app/api/checkout/verify/route.ts`
- Create: `cratedigv2.5/app/checkout/success/page.tsx`

- [ ] **Step 1: Create the verify route**

```typescript
// app/api/checkout/verify/route.ts
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not complete' }, { status: 400 })
  }

  const { user_id, drumkit_id } = session.metadata ?? {}

  if (!user_id || !drumkit_id) {
    return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await supabase.from('purchases').upsert(
    { user_id, drumkit_id, stripe_session_id: session.id },
    { onConflict: 'stripe_session_id' }
  )

  return NextResponse.json({ success: true, drumkit_id })
}
```

- [ ] **Step 2: Create the success page**

```tsx
// app/checkout/success/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertCircle } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return }
    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => setStatus(d.success ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent" />
        <span className="text-[#666]">Confirming your purchase...</span>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-[#22C55E] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Purchase Complete!</h1>
        <p className="text-[#666] mb-8">Your drumkit is ready. Find it in your Downloads.</p>
        <Link
          href="/drumkits"
          className="rounded-2xl bg-[#22C55E] px-6 py-3 font-medium text-black hover:bg-[#16A34A] transition-colors"
        >
          Go to Downloads
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-[#666] mb-8">If you were charged, contact support with your order confirmation email.</p>
      <Link
        href="/drumkits"
        className="rounded-2xl bg-[#111] border border-[#222] px-6 py-3 font-medium text-white hover:bg-[#1a1a1a] transition-colors"
      >
        Back to Drumkits
      </Link>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-[#666]">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 3: Verify route and page exist**

```bash
npm run dev
```

Navigate to `http://localhost:3000/checkout/success` — should render the error state (no session_id). Confirms page loads.

- [ ] **Step 4: Commit**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/app/api/checkout/verify/route.ts cratedigv2.5/app/checkout/success/page.tsx
git commit -m "Add checkout verify route and success page"
```

---

## Task 9: Download API route

**File:** `cratedigv2.5/app/api/download/route.ts` (create)

- [ ] **Step 1: Create the file**

```typescript
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const drumkitId = searchParams.get('drumkit_id')

  if (!drumkitId) {
    return NextResponse.json({ error: 'Missing drumkit_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Must be logged in' }, { status: 401 })
  }

  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('drumkit_id', drumkitId)
    .maybeSingle()

  if (!purchase) {
    return NextResponse.json({ error: 'Not purchased' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: kit } = await admin
    .from('drumkits')
    .select('file_url, name')
    .eq('id', drumkitId)
    .single()

  if (!kit?.file_url) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const { data: signed, error: signError } = await admin.storage
    .from('drumkit-files')
    .createSignedUrl(kit.file_url, 3600)

  if (signError || !signed) {
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl)
}
```

- [ ] **Step 2: Verify the route**

```bash
curl http://localhost:3000/api/download?drumkit_id=test
```

Expected: `{"error":"Must be logged in"}` — confirms route is live.

- [ ] **Step 3: Commit**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/app/api/download/route.ts
git commit -m "Add signed download API route with purchase verification"
```

---

## Task 10: Wire drumkits page — auth, checkout, downloads dropdown

**File:** `cratedigv2.5/app/drumkits/page.tsx`

- [ ] **Step 1: Add Supabase auth imports**

Add to the existing import block at the top:

```typescript
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'
```

- [ ] **Step 2: Add state for user, purchases, and dropdown**

Add these state variables inside `DrumkitsPage`, after the existing state:

```typescript
const [user, setUser] = useState<User | null>(null)
const [purchases, setPurchases] = useState<string[]>([]) // drumkit IDs owned
const [purchasedKits, setPurchasedKits] = useState<{ id: string; name: string; image_url: string }[]>([])
const [showAccountDropdown, setShowAccountDropdown] = useState(false)
const [checkingOut, setCheckingOut] = useState<string | null>(null) // drumkit_id being checked out
```

- [ ] **Step 3: Add auth + purchases useEffect**

Add after the existing `useEffect`:

```typescript
useEffect(() => {
  const supabase = createClient()
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user)
    if (user) fetchPurchases(user.id)
  })
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
    setUser(session?.user ?? null)
    if (session?.user) fetchPurchases(session.user.id)
    else { setPurchases([]); setPurchasedKits([]) }
  })
  return () => subscription.unsubscribe()
}, [])

const fetchPurchases = async (userId: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('purchases')
    .select('drumkit_id, drumkits(id, name, image_url)')
    .eq('user_id', userId)
  if (data) {
    setPurchases(data.map(p => p.drumkit_id))
    setPurchasedKits(data.map(p => (p.drumkits as unknown as { id: string; name: string; image_url: string })))
  }
}
```

- [ ] **Step 4: Replace `addToCart` with `handleBuy`**

Remove the `addToCart` function and replace with:

```typescript
const handleBuy = async (drumkitId: string) => {
  if (!user) {
    window.location.href = '/auth/login'
    return
  }
  if (purchases.includes(drumkitId)) return
  setCheckingOut(drumkitId)
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drumkit_id: drumkitId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.error ?? 'Checkout failed')
      setCheckingOut(null)
    }
  } catch {
    toast.error('Network error — please try again')
    setCheckingOut(null)
  }
}

const handleDownload = (drumkitId: string) => {
  window.location.href = `/api/download?drumkit_id=${drumkitId}`
}

const handleSignOut = async () => {
  const supabase = createClient()
  await supabase.auth.signOut()
  setShowAccountDropdown(false)
}
```

- [ ] **Step 5: Replace the cart button in the header with an account button**

Find the cart `<button>` in the header JSX and replace it with:

```tsx
{user ? (
  <div className="relative">
    <button
      onClick={() => setShowAccountDropdown(!showAccountDropdown)}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
        isDark ? 'bg-[#22C55E] text-black' : 'bg-[#22C55E] text-black'
      }`}
    >
      {user.email?.[0].toUpperCase()}
    </button>
    {showAccountDropdown && (
      <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl p-3 shadow-2xl z-50 ${
        isDark ? 'bg-[#111] border border-[#222]' : 'bg-white border border-[#e5e5e5]'
      }`}>
        <p className={`text-xs px-2 pb-2 mb-2 border-b truncate ${isDark ? 'text-[#666] border-[#222]' : 'text-[#999] border-[#e5e5e5]'}`}>
          {user.email}
        </p>
        <p className={`text-xs font-semibold px-2 mb-2 uppercase tracking-wider ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
          Downloads
        </p>
        {purchasedKits.length === 0 ? (
          <p className={`text-sm px-2 py-3 ${isDark ? 'text-[#555]' : 'text-[#aaa]'}`}>No purchases yet.</p>
        ) : (
          <div className="space-y-1 mb-2">
            {purchasedKits.map(kit => (
              <div key={kit.id} className={`flex items-center gap-3 rounded-xl px-2 py-2 ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-[#f5f5f5]'}`}>
                {kit.image_url ? (
                  <img src={kit.image_url} alt={kit.name} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className={`h-9 w-9 rounded-lg shrink-0 flex items-center justify-center ${isDark ? 'bg-[#222]' : 'bg-[#eee]'}`}>
                    <Package className="h-4 w-4 text-[#666]" />
                  </div>
                )}
                <span className={`text-sm flex-1 truncate ${isDark ? 'text-white' : 'text-black'}`}>{kit.name}</span>
                <button
                  onClick={() => handleDownload(kit.id)}
                  className="text-xs text-[#22C55E] hover:underline shrink-0"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={`w-full text-left text-sm px-2 py-2 rounded-xl transition-colors ${isDark ? 'text-[#666] hover:text-white hover:bg-[#1a1a1a]' : 'text-[#999] hover:text-black hover:bg-[#f5f5f5]'}`}
        >
          Sign Out
        </button>
      </div>
    )}
  </div>
) : (
  <a
    href="/auth/login"
    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
      isDark ? 'bg-[#111] border border-[#222] hover:bg-[#1a1a1a]' : 'bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5]'
    }`}
  >
    Sign In
  </a>
)}
```

- [ ] **Step 6: Wire the "Add to Cart" button in each drumkit card**

Find the card's `<button onClick={() => addToCart(kit.id)} ...>` and replace the entire button with:

```tsx
<button
  onClick={() => purchases.includes(kit.id) ? handleDownload(kit.id) : handleBuy(kit.id)}
  disabled={checkingOut === kit.id}
  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
    purchases.includes(kit.id)
      ? 'bg-[#22C55E] text-black hover:bg-[#16A34A]'
      : checkingOut === kit.id
      ? isDark ? 'bg-[#1a1a1a] text-[#666] cursor-wait' : 'bg-[#f5f5f5] text-[#999] cursor-wait'
      : 'bg-[#22C55E] text-black hover:bg-[#16A34A] active:scale-95'
  }`}
>
  {purchases.includes(kit.id) ? (
    'Download'
  ) : checkingOut === kit.id ? (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#666] border-t-transparent" />
  ) : (
    <>
      <ShoppingCart className="h-4 w-4" />
      Buy Now
    </>
  )}
</button>
```

- [ ] **Step 7: Remove unused `cart` state and `addToCart`**

Remove these lines (no longer needed):
```typescript
const [cart, setCart] = useState<string[]>([])
```
And the `addToCart` function if not already replaced.

Also remove the `Star` import from lucide-react if it's unused.

- [ ] **Step 8: Add `Package` to the lucide-react import**

The dropdown uses `Package` — make sure it's in the import:
```typescript
import { Disc3, ShoppingCart, Play, ArrowLeft, Search, Filter, ChevronDown, Sun, Moon, Package } from 'lucide-react'
```

- [ ] **Step 9: Close dropdown when clicking outside**

Add a `useEffect` after the other effects:

```typescript
useEffect(() => {
  if (!showAccountDropdown) return
  const close = (e: MouseEvent) => {
    if (!(e.target as Element).closest('[data-account-dropdown]')) setShowAccountDropdown(false)
  }
  document.addEventListener('mousedown', close)
  return () => document.removeEventListener('mousedown', close)
}, [showAccountDropdown])
```

Add `data-account-dropdown` attribute to the dropdown's wrapping `<div className="relative">`.

- [ ] **Step 10: Verify the full purchase flow**

```bash
npm run dev
```

1. Go to `/drumkits` — if not logged in, header shows "Sign In"
2. Click "Sign In" → log in → return to `/drumkits`
3. Click "Buy Now" on a kit that has a `stripe_price_id` set → redirects to Stripe Checkout
4. Complete test payment (use Stripe test card `4242 4242 4242 4242`) → lands on `/checkout/success`
5. Success page shows "Purchase Complete" → click "Go to Downloads"
6. On drumkits page, the purchased kit now shows "Download" and appears in the avatar dropdown
7. Click "Download" → file downloads via signed URL

- [ ] **Step 11: Commit**

```bash
cd c:/Users/cesar/Documents
git add cratedigv2.5/app/drumkits/page.tsx
git commit -m "Wire drumkits page: auth state, Stripe checkout, downloads dropdown from avatar"
```

---

## Task 11: Post-implementation audit

- [ ] **Step 1: Run TypeScript type check**

```bash
cd c:/Users/cesar/Documents/cratedigv2.5
npx tsc --noEmit
```

Fix any type errors reported before moving on.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Fix any lint errors.

- [ ] **Step 3: Audit checklist — verify each spec requirement**

| Requirement | Check |
|-------------|-------|
| No console.log in admin drumkits | Search file — zero matches |
| Alerts replaced with toasts | Search for `alert(` — zero matches |
| stripe_price_id in admin form | Visible on `/admin/drumkits` → Add Drumkit form |
| Upload validation (image + zip required) | Try saving without either → toast error |
| Storage cleanup on delete | Delete a kit → check Supabase storage buckets |
| Pool loads from Supabase | Check Network tab on load — request to `video_pool` table |
| Pool builder saves to Supabase | Run builder → check `video_pool` row updated |
| Purchases table has RLS | Confirm in Supabase dashboard |
| Checkout redirects to Stripe | Click "Buy Now" as logged-in user |
| Verify route records purchase | Check `purchases` table after test payment |
| Download generates signed URL | Click Download → file served |
| Avatar dropdown shows purchases | Log in → click avatar |
| Sign out works from dropdown | Click Sign Out → user cleared |

- [ ] **Step 4: Final commit if any fixes were needed from audit**

```bash
cd c:/Users/cesar/Documents
git add -p  # stage only the audit fixes
git commit -m "Audit fixes: resolve type errors and lint warnings"
```
