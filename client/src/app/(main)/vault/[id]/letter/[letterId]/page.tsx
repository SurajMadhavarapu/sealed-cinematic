'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Lock, Mail, Clock, CalendarClock, Users,
  Loader2, Volume2, VolumeX, ThumbsUp, ThumbsDown, Unlock, Trash2
} from 'lucide-react';
import { letters, votes, auth } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Letter {
  id: number;
  title: string;
  content: string | null;
  unlock_type: 'date' | 'event' | 'consensus';
  unlock_date: string | null;
  unlock_event: string | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
  author_id: number;
  author_name: string;
}

interface VoteData {
  votes: { user_id: number; name: string; vote: 'yes' | 'no' }[];
  summary: { yes: number; no: number; total: number; required: number };
}

export default function LetterPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.id as string;
  const letterId = params.letterId as string;

  const [letter, setLetter] = useState<Letter | null>(null);
  const [voteData, setVoteData] = useState<VoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [showUnsealAnimation, setShowUnsealAnimation] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [needsJoin, setNeedsJoin] = useState(false);

  const controls = useAnimation();

  useEffect(() => {
    loadLetterData();
    loadCurrentUser();
  }, [vaultId, letterId]);

  const loadCurrentUser = async () => {
    try {
      const res = await auth.getMe();
      setCurrentUserId(res.data.user.id);
    } catch (error) {
      console.error('Failed to load current user');
    }
  };

  const loadLetterData = async () => {
    try {
      const [letterRes] = await Promise.all([
        letters.getOne(vaultId, letterId),
      ]);
      setLetter(letterRes.data.letter);

      // Load votes for locked letters so members can start voting optionally
      if (!letterRes.data.letter.is_unlocked) {
        try {
          const voteRes = await votes.get(vaultId, letterId);
          setVoteData(voteRes.data);
          setNeedsJoin(false);
        } catch (err: any) {
          // If user isn't a member, the API will return 403. Show a join prompt.
          setVoteData(null);
          setNeedsJoin(true);
        }
      }

      // Show unseal animation for unlocked letters on first view
      if (letterRes.data.letter.is_unlocked && !hasAnimated) {
        setShowUnsealAnimation(true);
        setHasAnimated(true);
      }
    } catch (error) {
      router.push(`/vault/${vaultId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote: 'yes' | 'no') => {
    try {
      const res = await votes.cast(vaultId, letterId, vote);
      if (res.data.unlocked) {
        // Reload letter data to get content
        await loadLetterData();
      } else {
        // Reload votes
        const voteRes = await votes.get(vaultId, letterId);
        setVoteData(voteRes.data);
      }
    } catch (error) {
      console.error('Failed to vote');
    }
  };

  const handleUnlock = async () => {
    try {
      await letters.unlock(vaultId, letterId);
      await loadLetterData();
    } catch (error) {
      console.error('Failed to unlock');
    }
  };

  const handleReadAloud = () => {
    if (!letter?.content) return;
    
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(letter.content);
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const handleDelete = async () => {
    if (!letter || currentUserId !== letter.author_id) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this letter? This cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await letters.delete(vaultId, letterId);
      router.push(`/vault/${vaultId}`);
    } catch (error) {
      console.error('Failed to delete letter:', error);
      alert('Failed to delete letter. Please try again.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Sealed letter view
  if (!letter?.is_unlocked) {
    return (
      <SealedLetterView
        letter={letter!}
        vaultId={vaultId}
        voteData={voteData}
        onVote={handleVote}
        onUnlock={handleUnlock}
        onDelete={handleDelete}
        isAuthor={currentUserId === letter?.author_id}
        isDeleting={isDeleting}
      />
    );
  }

  // Unsealed letter view with dramatic animation
  return (
    <div className="min-h-screen relative">
      {/* Unseal Animation */}
      <AnimatePresence>
        {showUnsealAnimation && (
          <UnsealAnimation onComplete={() => setShowUnsealAnimation(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/vault/${vaultId}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to vault</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadAloud}
              className="btn-ghost"
            >
              {isReading ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {currentUserId === letter?.author_id && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-ghost text-red-400 hover:text-red-300"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Letter Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: showUnsealAnimation ? 0 : 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="space-y-8"
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showUnsealAnimation ? 0 : 1, y: showUnsealAnimation ? 20 : 0 }}
            transition={{ delay: 0.7 }}
            className="text-4xl md:text-5xl font-serif font-bold gradient-text-gold"
          >
            {letter.title}
          </motion.h1>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showUnsealAnimation ? 0 : 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-4 text-white/50 text-sm"
          >
            <span>Written by {letter.author_name}</span>
            <span>·</span>
            <span>{formatDate(letter.created_at)}</span>
            <span>·</span>
            <span className="text-emerald-400">Unsealed {formatDate(letter.unlocked_at!)}</span>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showUnsealAnimation ? 0 : 1, y: showUnsealAnimation ? 30 : 0 }}
            transition={{ delay: 1.1 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            {letter.content?.split('\n').map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="text-xl leading-relaxed text-white/90 mb-6"
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>
        </motion.article>
      </main>
    </div>
  );
}

// Dramatic Unseal Animation Component
function UnsealAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 bg-dark flex items-center justify-center overflow-hidden"
    >
      {/* Background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              x: '50%',
              y: '50%',
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            transition={{
              duration: 2,
              delay: 1.5 + Math.random() * 1,
              ease: 'easeOut',
            }}
            className="absolute w-2 h-2 rounded-full bg-gold/50"
          />
        ))}
      </div>

      {/* Wax seal breaking animation */}
      <div className="relative">
        {/* Glow */}
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0.8, 0] }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute inset-0 bg-gold/30 rounded-full blur-3xl"
        />

        {/* Seal */}
        <motion.div
          initial={{ scale: 1, rotate: 0 }}
          animate={{
            scale: [1, 1.2, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-burgundy-500 to-burgundy-700 flex items-center justify-center shadow-2xl">
            <Lock className="w-12 h-12 text-gold" />
          </div>

          {/* Crack lines */}
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 128 128"
          >
            <motion.path
              d="M64 0 L64 64 M0 64 L64 64 M128 64 L64 64 M64 128 L64 64"
              stroke="rgba(212, 175, 55, 0.8)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 1.2 }}
            />
          </motion.svg>
        </motion.div>

        {/* "Unsealed" text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="absolute top-full mt-8 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-3xl font-serif font-bold gradient-text-gold">Unsealed</p>
          <p className="text-white/60 mt-2">Your letter awaits</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Sealed Letter View
function SealedLetterView({
  letter,
  vaultId,
  voteData,
  onVote,
  onUnlock,
  onDelete,
  isAuthor,
  isDeleting,
}: {
  letter: Letter;
  vaultId: string;
  voteData: VoteData | null;
  onVote: (vote: 'yes' | 'no') => void;
  onUnlock: () => void;
  onDelete: () => void;
  isAuthor: boolean;
  isDeleting: boolean;
}) {
  const getUnlockInfo = () => {
    switch (letter.unlock_type) {
      case 'date':
        const date = new Date(letter.unlock_date!);
        const now = new Date();
        const canUnlock = date <= now;
        return {
          icon: CalendarClock,
          text: canUnlock ? 'Ready to unseal!' : `Unseals on ${formatDate(letter.unlock_date!)}`,
          canUnlock,
        };
      case 'event':
        return {
          icon: Clock,
          text: letter.unlock_event,
          canUnlock: true, // Author can unlock event-based
        };
      case 'consensus':
        return {
          icon: Users,
          text: `${voteData?.summary.yes || 0}/${voteData?.summary.required || 0} votes to unseal`,
          canUnlock: false,
        };
    }
  };

  const unlockInfo = getUnlockInfo();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-burgundy-900/30" />

        <div className="relative z-10">
          {/* Wax seal */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-burgundy-500 to-burgundy-700 flex items-center justify-center shadow-2xl glow-primary"
          >
            <Lock className="w-10 h-10 text-gold" />
          </motion.div>

          <h1 className="text-3xl font-serif font-bold mb-4">{letter.title}</h1>

          <p className="text-white/60 mb-2">
            Written by {letter.author_name}
          </p>

          <div className="flex items-center justify-center gap-2 text-white/50 mb-8">
            <unlockInfo.icon className="w-5 h-5" />
            <span>{unlockInfo.text}</span>
          </div>

          {/* Date-based unlock - Only show if not yet unlocked */}
          {letter.unlock_type === 'date' && unlockInfo.canUnlock && (
            <button onClick={onUnlock} className="btn-primary glow-primary">
              <Unlock className="w-5 h-5 mr-2" />
              Unseal Now
            </button>
          )}

          {/* Event-based unlock - Auto-unlocks, no button needed */}
          {letter.unlock_type === 'event' && (
            <div className="text-center text-white/60 text-sm">
              <p>This letter will unlock when the event occurs.</p>
            </div>
          )}

          {/* Voting (optional for locked letters) */}
          {voteData && !letter.is_unlocked && (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(voteData.summary.required ? (voteData.summary.yes / voteData.summary.required) : 0) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary-500 to-emerald-500"
                />
              </div>

              <div className="text-sm text-white/60">
                {voteData.summary.yes} yes · {voteData.summary.no} no · {voteData.summary.total} votes · majority required: {Math.floor(voteData.summary.required / 2) + 1}
              </div>

              {/* Vote buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => onVote('yes')}
                  className="btn-primary flex-1 max-w-[150px]"
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Vote to Unseal
                </button>
                <button
                  onClick={() => onVote('no')}
                  className="btn-secondary flex-1 max-w-[150px]"
                >
                  <ThumbsDown className="w-5 h-5 mr-2" />
                  Keep Sealed
                </button>
              </div>
            </div>
          )}

          {isAuthor && (
           <button
             onClick={onDelete}
             disabled={isDeleting}
             className="btn-ghost text-red-400 hover:text-red-300 mt-8"
           >
             {isDeleting ? (
               <>
                 <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                 Deleting...
               </>
             ) : (
               <>
                 <Trash2 className="w-5 h-5 mr-2" />
                 Delete Letter
               </>
             )}
           </button>
          )}

          <Link href={`/vault/${vaultId}`}>
           <button className="btn-ghost mt-8">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to vault
           </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
