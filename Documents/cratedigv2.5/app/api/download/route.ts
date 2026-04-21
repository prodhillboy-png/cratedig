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
