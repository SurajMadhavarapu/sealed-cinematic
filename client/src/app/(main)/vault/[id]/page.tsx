'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Lock, ArrowLeft, Plus, Users, Mail, Clock, Check, X,
  Loader2, Share2, Copy, UserPlus, CalendarClock, Vote
} from 'lucide-react';
import { vaults, letters } from '@/lib/api';
import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils';

interface Letter {
  id: number;
  title: string;
  unlock_type: 'date' | 'event' | 'consensus';
  unlock_date: string | null;
  unlock_event: string | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
  author_id: number;
  author_name: string;
  content: string | null;
}

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

interface VaultData {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function VaultPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.id as string;

  const [vault, setVault] = useState<VaultData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [letterList, setLetterList] = useState<Letter[]>([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    loadVaultData();
  }, [vaultId]);

  const loadVaultData = async () => {
    try {
      const [vaultRes, lettersRes] = await Promise.all([
        vaults.getOne(vaultId),
        letters.getAll(vaultId),
      ]);
      setVault(vaultRes.data.vault);
      setMembers(vaultRes.data.members);
      setUserRole(vaultRes.data.userRole);
      setLetterList(lettersRes.data.letters);
    } catch (error) {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const res = await vaults.generateInvite(vaultId);
      setInviteCode(res.data.inviteCode);
      setShowInviteModal(true);
    } catch (error) {
      console.error('Failed to generate invite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const sealedLetters = letterList.filter(l => !l.is_unlocked);
  const unsealdLetters = letterList.filter(l => l.is_unlocked);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{vault?.name}</h1>
              <p className="text-sm text-white/50">{members.length} members</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateInvite}
              className="btn-ghost text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </button>
            <Link href={`/vault/${vaultId}/compose`}>
              <button className="btn-primary text-sm">
                <Plus className="w-4 h-4 mr-2" />
                New Letter
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Letters column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sealed letters */}
            <section>
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-gold" />
                Sealed Letters
                <span className="text-sm font-normal text-white/40">({sealedLetters.length})</span>
              </h2>

              {sealedLetters.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-white/50">No sealed letters yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sealedLetters.map((letter, index) => (
                    <LetterCard key={letter.id} letter={letter} vaultId={vaultId} index={index} />
                  ))}
                </div>
              )}
            </section>

            {/* Unsealed letters */}
            {unsealdLetters.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-emerald-400" />
                  Unsealed Letters
                  <span className="text-sm font-normal text-white/40">({unsealdLetters.length})</span>
                </h2>

                <div className="space-y-4">
                  {unsealdLetters.map((letter, index) => (
                    <LetterCard key={letter.id} letter={letter} vaultId={vaultId} index={index} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                Members
              </h3>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-burgundy-600 flex items-center justify-center text-sm font-medium">
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-xs text-white/40 truncate">{member.email}</p>
                    </div>
                    {member.role === 'owner' && (
                      <span className="text-xs text-gold">Owner</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Vault info */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">About</h3>
              {vault?.description && (
                <p className="text-white/60 text-sm mb-4">{vault.description}</p>
              )}
              <p className="text-xs text-white/40">
                Created {formatDate(vault?.created_at || '')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card p-8 w-full max-w-md text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Share2 className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">Invite Code</h2>
              <p className="text-white/60 mb-6">Share this code to invite someone to your vault</p>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <code className="text-3xl font-mono tracking-widest text-gold">{inviteCode}</code>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
                }}
                className="btn-secondary w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </button>

              <p className="text-xs text-white/40 mt-4">Code expires in 24 hours</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Letter Card Component
function LetterCard({ letter, vaultId, index }: { letter: Letter; vaultId: string; index: number }) {
  const getUnlockIcon = () => {
    switch (letter.unlock_type) {
      case 'date': return <CalendarClock className="w-4 h-4" />;
      case 'event': return <Clock className="w-4 h-4" />;
      case 'consensus': return <Vote className="w-4 h-4" />;
    }
  };

  const getUnlockText = () => {
    if (letter.is_unlocked) {
      return `Unsealed ${formatDate(letter.unlocked_at!)}`;
    }
    switch (letter.unlock_type) {
      case 'date':
        return formatRelativeTime(letter.unlock_date!);
      case 'event':
        return letter.unlock_event;
      case 'consensus':
        return 'Waiting for consensus';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/vault/${vaultId}/letter/${letter.id}`}>
        <motion.div
          whileHover={{ scale: 1.01, y: -2 }}
          className={`card card-hover p-6 cursor-pointer relative overflow-hidden ${
            letter.is_unlocked ? 'border-emerald-500/30' : 'border-primary-500/20'
          }`}
        >
          {/* Sealed indicator */}
          {!letter.is_unlocked && (
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-burgundy-500 to-burgundy-700 flex items-center justify-center shadow-lg">
                <Lock className="w-4 h-4 text-gold" />
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              letter.is_unlocked ? 'bg-emerald-500/20' : 'bg-primary-500/20'
            }`}>
              {letter.is_unlocked ? (
                <Mail className="w-6 h-6 text-emerald-400" />
              ) : (
                <Lock className="w-6 h-6 text-primary-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1 pr-12">{letter.title}</h3>
              <p className="text-sm text-white/50 mb-3">
                By {letter.author_name} · {formatDate(letter.created_at)}
              </p>

              {/* Unlock status */}
              <div className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                letter.is_unlocked
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-white/60'
              }`}>
                {getUnlockIcon()}
                <span>{getUnlockText()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
