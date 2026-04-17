import Link from 'next/link'
import { Disc3, AlertCircle, ArrowRight } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]">
            <Disc3 className="h-6 w-6 text-black" />
          </div>
          <span className="text-2xl font-bold text-white">CrateDig</span>
        </Link>

        <div className="rounded-3xl border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
          <p className="mt-3 text-[#666]">
            Something went wrong during authentication. Please try again or contact support if the problem persists.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22C55E] px-6 py-3 font-medium text-black transition-all hover:bg-[#16A34A]"
            >
              Try Again
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111] border border-[#222] px-6 py-3 font-medium text-white transition-all hover:border-[#333]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
