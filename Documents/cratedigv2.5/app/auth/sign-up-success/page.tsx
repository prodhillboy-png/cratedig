import Link from 'next/link'
import { Disc3, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
            <Mail className="h-8 w-8 text-[#22C55E]" />
          </div>
          
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-3 text-[#666]">
            We&apos;ve sent you a confirmation link. Click it to activate your account and start digging for samples.
          </p>

          <Link
            href="/auth/login"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#111] border border-[#222] px-6 py-3 font-medium text-white transition-all hover:border-[#22C55E] hover:bg-[#1a1a1a]"
          >
            Back to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
