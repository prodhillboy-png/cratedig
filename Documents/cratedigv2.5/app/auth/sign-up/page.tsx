'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail, Lock, ArrowRight, Disc3, User } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName,
            email_opt_in: emailOptIn,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

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

        <div className="rounded-3xl border border-[#1a1a1a] bg-[#0a0a0a] p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="mt-2 text-[#666]">Start discovering samples today</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#888]">Display Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444]" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-2xl border border-[#222] bg-[#111] py-4 pl-12 pr-4 text-white placeholder-[#444] transition-all focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#888]">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#222] bg-[#111] py-4 pl-12 pr-4 text-white placeholder-[#444] transition-all focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#888]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444]" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#222] bg-[#111] py-4 pl-12 pr-4 text-white placeholder-[#444] transition-all focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#888]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444]" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#222] bg-[#111] py-4 pl-12 pr-4 text-white placeholder-[#444] transition-all focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
                />
              </div>
            </div>

            {/* Email Opt-in */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailOptIn}
                  onChange={(e) => setEmailOptIn(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#333] bg-[#111] text-[#22C55E] focus:ring-[#22C55E] focus:ring-offset-0 accent-[#22C55E]"
                />
                <span className="text-sm text-[#888] leading-relaxed">
                  I&apos;d like to receive emails about new drumkit drops and CrateDig updates. You can unsubscribe at any time.
                </span>
              </label>
              <p className="text-xs text-[#555] leading-relaxed">
                By creating an account you agree to our Terms of Service and{' '}
                <Link href="/privacy-policy" className="text-[#22C55E] hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22C55E] py-4 font-semibold text-black transition-all hover:bg-[#16A34A] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Disc3 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#666]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-[#22C55E] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
