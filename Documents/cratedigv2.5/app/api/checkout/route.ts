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
