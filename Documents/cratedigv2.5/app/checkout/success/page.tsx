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
    const verify = async () => {
      if (!sessionId) { setStatus('error'); return }
      try {
        const r = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
        const d = await r.json()
        setStatus(d.success ? 'success' : 'error')
      } catch {
        setStatus('error')
      }
    }
    verify()
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
