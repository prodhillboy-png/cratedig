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
