'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, Plus, Users, Mail, LogOut, 
  Loader2, ChevronRight, Sparkles, X, Copy, Check
} from 'lucide-react';
import { auth, vaults, removeToken } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Vault {
  id: number;
  name: string;
  description: string;
  role: string;
  member_count: number;
  letter_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [vaultList, setVaultList] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, vaultsRes] = await Promise.all([
        auth.getMe(),
        vaults.getAll(),
      ]);
      setUser(userRes.data.user);
      setVaultList(vaultsRes.data.vaults);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8" style={{ color: '#FD297B' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-pink-500/20 backdrop-blur-lg sticky top-0 z-50 bg-dark/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)', boxShadow: '0 0 20px rgba(253, 41, 123, 0.3)' }}
            >
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold gradient-text-love">SEALED</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-white/50">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost text-white/60 hover:text-pink-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-serif font-bold mb-2">
            Welcome back, <span className="gradient-text-love">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/60 text-lg">Your vaults are waiting for you</p>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary glow-tinder"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Vault
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary"
          >
            <Users className="w-5 h-5 mr-2" />
            Join with Code
          </motion.button>
        </div>

        {/* Vaults Grid */}
        {vaultList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center jewel-card"
          >
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(253, 41, 123, 0.15)' }}
            >
              <Sparkles className="w-10 h-10" style={{ color: '#FD297B' }} />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">No vaults yet</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Create your first vault to start writing letters to your loved ones,
              or join an existing vault with an invite code.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary glow-tinder"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Vault
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {vaultList.map((vault, index) => (
                <motion.div
                  key={vault.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/vault/${vault.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="card card-hover p-6 h-full cursor-pointer group jewel-card"
                    >
                      {/* Vault icon */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500"
                        style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
                      >
                        <Lock className="w-6 h-6 text-white" />
                      </div>

                      {/* Vault info */}
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-400 transition-colors">
                        {vault.name}
                      </h3>
                      {vault.description && (
                        <p className="text-white/50 text-sm mb-4 line-clamp-2">
                          {vault.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-white/40 mt-auto pt-4 border-t border-pink-500/10">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {vault.member_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {vault.letter_count} letters
                        </span>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:text-pink-400 transition-all" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create Vault Modal */}
      <CreateVaultModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadData();
        }}
      />

      {/* Join Vault Modal */}
      <JoinVaultModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={() => {
          setShowJoinModal(false);
          loadData();
        }}
      />
    </div>
  );
}

// Create Vault Modal
function CreateVaultModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await vaults.create(name, description);
      setName('');
      setDescription('');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card p-8 w-full max-w-md jewel-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold gradient-text-love">Create a Vault</h2>
              <button onClick={onClose} className="text-white/40 hover:text-pink-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">Vault Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Our Love Letters"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="input-label">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this vault for?"
                  className="input min-h-[100px] resize-none"
                />
              </div>

              {error && (
                <p className="text-pink-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 glow-tinder"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Create Vault'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Join Vault Modal
function JoinVaultModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await vaults.join(code);
      setCode('');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card p-8 w-full max-w-md jewel-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold gradient-text-love">Join a Vault</h2>
              <button onClick={onClose} className="text-white/40 hover:text-pink-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">Invite Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter 12-character code"
                  className="input text-center text-2xl tracking-widest font-mono"
                  maxLength={12}
                  required
                />
              </div>

              {error && (
                <p className="text-pink-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 12}
                className="btn-primary w-full py-3 glow-tinder"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Join Vault'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
