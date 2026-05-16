'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { auth, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await auth.login(email, password);
      setToken(response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/2 w-full h-full blur-3xl"
          style={{ background: 'conic-gradient(from 0deg, rgba(253, 41, 123, 0.15), transparent, rgba(255, 101, 91, 0.15))' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(255, 88, 100, 0.1)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg glow-tinder"
            style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
          >
            <Lock className="w-6 h-6 text-white" />
          </motion.div>
          <span className="font-serif text-2xl font-bold gradient-text-love">SEALED</span>
        </Link>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card p-8 jewel-card"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2 gradient-text-love">Welcome Back</h1>
            <p className="text-white/60">Sign in to access your sealed letters</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="input-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-pink-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-pink-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-4 glow-tinder"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </form>

          {/* Register link */}
          <div className="mt-8 text-center text-white/60">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-pink-400 hover:text-orange-400 transition-colors font-medium">
              Create one
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
