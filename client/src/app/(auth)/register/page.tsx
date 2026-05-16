'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { auth, setToken } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password requirements
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
  ];

  const allRequirementsMet = requirements.every(r => r.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequirementsMet) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await auth.register(email, password, name);
      setToken(response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full blur-3xl"
          style={{ background: 'conic-gradient(from 0deg, rgba(253, 41, 123, 0.15), transparent, rgba(255, 101, 91, 0.15))' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl"
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
            <h1 className="text-3xl font-serif font-bold mb-2 gradient-text-love">Create Your Vault</h1>
            <p className="text-white/60">Start writing letters that matter</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="input-label">Your Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we call you?"
                  className="input pl-12"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
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
              
              {/* Password requirements */}
              <div className="mt-3 space-y-1">
                {requirements.map((req, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <motion.div
                      animate={{ scale: req.met ? [1, 1.2, 1] : 1 }}
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    >
                      {req.met && <Check className="w-3 h-3 text-white" />}
                    </motion.div>
                    <span className={req.met ? 'text-emerald-400' : 'text-white/40'}>
                      {req.label}
                    </span>
                  </motion.div>
                ))}
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
              disabled={loading || !allRequirementsMet}
              whileHover={{ scale: allRequirementsMet ? 1.02 : 1 }}
              whileTap={{ scale: allRequirementsMet ? 0.98 : 1 }}
              className="btn-primary w-full py-4 mt-6 glow-tinder"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center text-white/60 relative z-10">
            Already have an account?{' '}
            <Link href="/login" className="text-pink-400 hover:text-orange-400 transition-colors font-medium underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
