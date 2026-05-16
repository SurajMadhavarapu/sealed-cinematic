'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, ArrowLeft, FileText, AlertTriangle, Scale, Ban, Heart } from 'lucide-react';

export default function TermsOfServicePage() {
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-bold gradient-text-love">Terms of Service</h1>
          </div>
          <p className="text-white/60">Last updated: March 11, 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 md:p-12 space-y-8"
        >
          {/* Agreement */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Agreement to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              By accessing or using SEALED, you agree to be bound by these Terms of Service. If you 
              disagree with any part of these terms, you may not access our service. These terms apply 
              to all visitors, users, and others who access or use SEALED.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Description of Service
            </h2>
            <p className="text-white/70 mb-4">
              SEALED is a time-locked letter service that allows users to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Create private vaults shared with loved ones</li>
              <li>Write encrypted letters with various unlock conditions</li>
              <li>Set time-based unlock dates for letters</li>
              <li>Use consensus-based unlocking requiring group agreement</li>
              <li>Receive AI-powered writing prompts for inspiration</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">User Accounts</h2>
            <div className="space-y-4 text-white/70">
              <p>
                <strong className="text-white">Account Creation:</strong> You must provide accurate, 
                complete information when creating an account. You are responsible for maintaining 
                the security of your account credentials.
              </p>
              <p>
                <strong className="text-white">Account Security:</strong> You are responsible for all 
                activities that occur under your account. Notify us immediately of any unauthorized 
                use of your account.
              </p>
              <p>
                <strong className="text-white">Age Requirement:</strong> You must be at least 13 years 
                old to use SEALED. By using our service, you represent that you meet this requirement.
              </p>
            </div>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">User Content</h2>
            <div className="space-y-4 text-white/70">
              <p>
                <strong className="text-white">Ownership:</strong> You retain ownership of all content 
                you create on SEALED, including letters, vault names, and descriptions.
              </p>
              <p>
                <strong className="text-white">License to Us:</strong> By posting content, you grant us 
                a limited license to store, encrypt, and deliver your content as necessary to provide 
                our service. We do not claim ownership of your content.
              </p>
              <p>
                <strong className="text-white">Responsibility:</strong> You are solely responsible for 
                the content you create. We do not review, approve, or endorse user content.
              </p>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Prohibited Uses
            </h2>
            <p className="text-white/70 mb-4">You agree NOT to use SEALED to:</p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Harass, abuse, or harm another person</li>
              <li>Send spam or unsolicited communications</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use the service for illegal threats or blackmail</li>
              <li>Share content that exploits minors</li>
            </ul>
          </section>

          {/* Time-Locked Letters */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Time-Locked Letters
            </h2>
            <div className="space-y-4 text-white/70">
              <p>
                <strong className="text-white">Unlock Conditions:</strong> Once a letter is sealed with 
                an unlock condition (date, event, or consensus), you may not be able to access or 
                modify it until the condition is met. Choose your unlock conditions carefully.
              </p>
              <p>
                <strong className="text-white">Irreversibility:</strong> Some unlock conditions may be 
                irreversible once set. We are not responsible for letters that remain locked due to 
                unmet conditions.
              </p>
              <p>
                <strong className="text-white">Consensus Unlocking:</strong> For letters requiring 
                consensus, all designated voters must agree to unlock. We cannot override this 
                mechanism on behalf of any user.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Disclaimers
            </h2>
            <div className="bg-white/5 rounded-lg p-4 border border-amber-500/30 text-white/70">
              <p className="mb-4">
                SEALED is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, 
                either express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Uninterrupted, secure, or error-free operation</li>
                <li>Accuracy or reliability of any information</li>
                <li>That defects will be corrected</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Limitation of Liability
            </h2>
            <p className="text-white/70">
              To the maximum extent permitted by law, SEALED and its operators shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including 
              but not limited to loss of data, loss of profits, or emotional distress, arising from 
              your use of or inability to use the service.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Termination</h2>
            <div className="space-y-4 text-white/70">
              <p>
                <strong className="text-white">By You:</strong> You may terminate your account at any 
                time by deleting it through the app settings. Your content will be permanently deleted 
                within 30 days.
              </p>
              <p>
                <strong className="text-white">By Us:</strong> We reserve the right to suspend or 
                terminate your account if you violate these terms or engage in harmful behavior. 
                We will provide notice when possible.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Changes to Terms</h2>
            <p className="text-white/70">
              We reserve the right to modify these terms at any time. We will provide notice of 
              significant changes by posting a notice on our website or sending you an email. 
              Your continued use of SEALED after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Governing Law</h2>
            <p className="text-white/70">
              These terms shall be governed by and construed in accordance with applicable laws, 
              without regard to conflict of law principles. Any disputes arising from these terms 
              or your use of SEALED shall be resolved in the appropriate courts.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4 text-amber-400">Contact Us</h2>
            <p className="text-white/70 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white">Email: <a href="mailto:legal@sealed.app" className="text-rose-400 hover:text-amber-400 transition-colors">legal@sealed.app</a></p>
            </div>
          </section>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link href="/privacy" className="text-rose-400 hover:text-amber-400 transition-colors">
            ← View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
