'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, ArrowLeft, Shield, Database, Eye, Trash2, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center glow-ruby"
              style={{ background: 'linear-gradient(to bottom right, #f43f5e, #ab1f4d, #791c3f)' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-bold gradient-text-love">Privacy Policy</h1>
          </div>
          <p className="text-white/60">Last updated: March 11, 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 md:p-12 space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Introduction</h2>
            <p className="text-white/70 leading-relaxed">
              SEALED (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, store, and protect your personal information when you use 
              our time-locked letter service.
            </p>
          </section>

          {/* What We Collect */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-white/70">
              <div>
                <h3 className="font-semibold text-white mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name (as you provide it)</li>
                  <li>Email address</li>
                  <li>Password (stored securely hashed, never in plain text)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Content You Create</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Vault names and descriptions</li>
                  <li>Letter titles, content, and unlock conditions</li>
                  <li>Voting decisions on consensus-locked letters</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Technical Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address (for security purposes)</li>
                  <li>Browser type and device information</li>
                  <li>Timestamps of account activity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Protect Your Data */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              How We Protect Your Data
            </h2>
            <div className="space-y-4 text-white/70">
              <p>
                <strong className="text-white">Encryption:</strong> All letter content is encrypted using 
                AES-256 encryption before being stored in our database. This means even we cannot read 
                your letters in their encrypted state.
              </p>
              <p>
                <strong className="text-white">Secure Transmission:</strong> All data transmitted between 
                your device and our servers is protected using HTTPS/TLS encryption.
              </p>
              <p>
                <strong className="text-white">Password Security:</strong> Your password is hashed using 
                bcrypt with salt rounds, making it computationally infeasible to reverse.
              </p>
              <p>
                <strong className="text-white">Access Controls:</strong> Only you and the members of your 
                vaults can access your letters, and only when unlock conditions are met.
              </p>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>To provide and maintain the SEALED service</li>
              <li>To authenticate your account and protect against unauthorized access</li>
              <li>To deliver your letters when unlock conditions are met</li>
              <li>To send you important service notifications (e.g., letter unlocked)</li>
              <li>To respond to your support requests</li>
              <li>To improve our service based on usage patterns (anonymized)</li>
            </ul>
          </section>

          {/* What We Don't Do */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">What We Don&apos;t Do</h2>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>We do NOT sell your personal information to third parties</li>
              <li>We do NOT read your encrypted letters</li>
              <li>We do NOT share your data with advertisers</li>
              <li>We do NOT use your content for AI training</li>
              <li>We do NOT send marketing emails without your consent</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Data Retention</h2>
            <div className="space-y-4 text-white/70">
              <p>
                We retain your data for as long as your account is active. Your letters are stored 
                until their unlock conditions are met and you choose to delete them, or until you 
                delete your account.
              </p>
              <p>
                When you delete your account, all your personal data, including letters you authored 
                and vault memberships, will be permanently removed within 30 days.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Your Rights
            </h2>
            <p className="text-white/70 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-white">Correction:</strong> Update or correct your account information</li>
              <li><strong className="text-white">Deletion:</strong> Delete your account and all associated data</li>
              <li><strong className="text-white">Export:</strong> Download your letters and data</li>
              <li><strong className="text-white">Withdraw Consent:</strong> Opt out of non-essential communications</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Cookies & Local Storage</h2>
            <p className="text-white/70">
              We use minimal cookies and local storage only for essential functionality:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mt-4">
              <li><strong className="text-white">Authentication Token:</strong> Stored in local storage to keep you logged in</li>
              <li><strong className="text-white">Session Data:</strong> Temporary data to maintain your session</li>
            </ul>
            <p className="text-white/70 mt-4">
              We do not use tracking cookies, advertising cookies, or third-party analytics.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Children&apos;s Privacy</h2>
            <p className="text-white/70">
              SEALED is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent and believe your child 
              has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Changes to This Policy</h2>
            <p className="text-white/70">
              We may update this Privacy Policy from time to time. We will notify you of any significant 
              changes by posting a notice on our website or sending you an email. Your continued use of 
              SEALED after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Us
            </h2>
            <p className="text-white/70 mb-4">
              If you have any questions about this Privacy Policy or your personal data, please contact us:
            </p>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white">Email: <a href="mailto:privacy@sealed.app" className="text-rose-400 hover:text-amber-400 transition-colors">privacy@sealed.app</a></p>
            </div>
          </section>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link href="/terms" className="text-rose-400 hover:text-amber-400 transition-colors">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
