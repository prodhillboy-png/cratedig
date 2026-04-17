import Link from 'next/link'
import { ArrowLeft, Disc3 } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | CrateDig',
  description: 'CrateDig Privacy Policy - How we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]">
                <Disc3 className="h-6 w-6 text-black" />
              </div>
              <span className="text-xl font-bold">CrateDig</span>
            </Link>
            <Link 
              href="/"
              className="flex items-center gap-2 rounded-full bg-[#111] border border-[#222] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] hover:border-[#333]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-[#666] mb-10">Last updated: April 2025</p>

        <div className="prose prose-invert prose-green max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">1. Introduction</h2>
            <p className="text-[#999] leading-relaxed">
              Welcome to CrateDig (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring you understand how we collect, use, and safeguard your personal information when you use our sample discovery platform and drumkit marketplace.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Account Information</h3>
                <p className="text-[#999] leading-relaxed">
                  When you create an account, we collect your email address, display name, and password (stored securely using industry-standard hashing).
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Usage Data</h3>
                <p className="text-[#999] leading-relaxed">
                  We collect information about how you use CrateDig, including the samples you discover, genres you explore, and drumkits you purchase or download.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Payment Information</h3>
                <p className="text-[#999] leading-relaxed">
                  Payment processing is handled by Stripe. We do not store your full credit card details. Stripe&apos;s privacy policy governs their handling of your payment information.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Communications Preferences</h3>
                <p className="text-[#999] leading-relaxed">
                  If you opt in to marketing emails, we store your preference to send you updates about new drumkit releases and CrateDig features.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>To provide and maintain the CrateDig service</li>
              <li>To process drumkit purchases and deliver digital products</li>
              <li>To personalize your sample discovery experience</li>
              <li>To send you transactional emails (purchase confirmations, account updates)</li>
              <li>To send marketing emails if you have opted in</li>
              <li>To improve our platform and develop new features</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">4. Data Sharing</h2>
            <p className="text-[#999] leading-relaxed mb-4">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li><strong className="text-white">Service Providers:</strong> Stripe (payments), Supabase (database), Vercel (hosting)</li>
              <li><strong className="text-white">Producers:</strong> When you purchase a drumkit, the producer may receive your email for delivery purposes</li>
              <li><strong className="text-white">Legal Requirements:</strong> If required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">5. Data Security</h2>
            <p className="text-[#999] leading-relaxed">
              We implement industry-standard security measures including encryption in transit (HTTPS), secure password hashing, and access controls. Your data is stored on secure servers provided by Supabase with row-level security policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">6. Your Rights</h2>
            <p className="text-[#999] leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Unsubscribe from marketing emails at any time</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">7. Cookies</h2>
            <p className="text-[#999] leading-relaxed">
              We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-[#999] leading-relaxed">
              CrateDig is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">9. Changes to This Policy</h2>
            <p className="text-[#999] leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#22C55E] mb-4">10. Contact Us</h2>
            <p className="text-[#999] leading-relaxed">
              If you have questions about this privacy policy or your data, please contact us at{' '}
              <a href="mailto:privacy@cratedig.site" className="text-[#22C55E] hover:underline">
                privacy@cratedig.site
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#1a1a1a] flex items-center justify-center gap-3">
          <span className="text-xs font-mono text-[#333]">crafted by</span>
          <span className="w-1 h-1 rounded-full bg-[#333]" />
          <span className="text-sm font-bold font-mono text-[#22C55E]/50">HILLBOY</span>
          <span className="w-1 h-1 rounded-full bg-[#333]" />
          <span className="text-xs font-mono text-[#333]">cratedig.site</span>
        </div>
      </main>
    </div>
  )
}
