'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Send, Lock, CalendarClock, Clock, Users,
  Loader2, Sparkles, Lightbulb, RefreshCw
} from 'lucide-react';
import { letters, ai } from '@/lib/api';

type UnlockType = 'automatic' | 'consensus';

export default function ComposePage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockType, setUnlockType] = useState<UnlockType>('automatic');
  const [unlockDate, setUnlockDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  const unlockOptions = [
    { type: 'automatic' as UnlockType, icon: CalendarClock, label: 'Automatic', description: 'Opens on a specific date' },
    { type: 'consensus' as UnlockType, icon: Users, label: 'Consensus', description: 'Opens when everyone agrees' },
  ];

  const loadPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await ai.getPrompts();
      setPrompts(res.data.prompts);
    } catch (error) {
      setPrompts([
        'What do you want them to know when they read this?',
        'Describe a moment you shared that changed everything.',
        'What promise do you want to make to them?',
      ]);
    } finally {
      setLoadingPrompts(false);
      setShowPrompts(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date is set for automatic unlock
    if (unlockType === 'automatic' && !unlockDate) {
      alert('Please select an unlock date');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        title,
        content,
        unlockType: 'date',
        unlockDate,
      };

      // Store event name in unlock_event field if provided
      if (eventName.trim()) {
        payload.unlockEvent = eventName;
      }

      await letters.create(vaultId, payload);
      router.push(`/vault/${vaultId}`);
    } catch (error) {
      console.error('Failed to create letter:', error);
      alert('Failed to seal letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/vault/${vaultId}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to vault</span>
          </Link>

          <button
            onClick={handleSubmit}
            disabled={loading || !title || !content || (unlockType === 'automatic' && !unlockDate)}
            className="btn-primary"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Seal Letter
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Letter Paper Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="letter-paper rounded-2xl shadow-2xl"
          >
            {/* Title */}
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your letter a title..."
              className="letter-title w-full text-3xl font-bold"
            />

            {/* Content */}
            <motion.textarea
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your heart out..."
              className="letter-textarea w-full min-h-[500px]"
            />
          </motion.div>

          {/* AI Prompts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <button
              onClick={loadPrompts}
              className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Lightbulb className="w-5 h-5" />
              <span>Need inspiration?</span>
            </button>

            <AnimatePresence>
              {showPrompts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-primary-400 font-medium">Writing prompts</span>
                    <button
                      onClick={loadPrompts}
                      disabled={loadingPrompts}
                      className="text-primary-400 hover:text-primary-300"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingPrompts ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {prompts.map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => {
                          setContent(content + (content ? '\n\n' : '') + prompt + '\n');
                          setShowPrompts(false);
                        }}
                        className="block w-full text-left text-sm text-white/70 hover:text-white p-2 rounded hover:bg-white/5 transition-colors"
                      >
                        "{prompt}"
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Unlock Type Selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-6 bg-white/5"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gold" />
              When should this letter unseal?
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {unlockOptions.map((option) => (
                <motion.button
                  key={option.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUnlockType(option.type)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    unlockType === option.type
                      ? 'border-primary-500 bg-primary-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <option.icon className={`w-6 h-6 mb-2 ${
                    unlockType === option.type ? 'text-primary-400' : 'text-white/40'
                  }`} />
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-white/50">{option.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Unlock type specific inputs */}
            <AnimatePresence mode="wait">
              {unlockType === 'automatic' && (
                <motion.div
                  key="automatic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="input-label">Unlock Date</label>
                    <input
                      type="date"
                      value={unlockDate}
                      onChange={e => setUnlockDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input max-w-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Event Name <span className="text-white/40">(optional)</span></label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={e => setEventName(e.target.value)}
                      placeholder="e.g., Our wedding day, Birthday, etc."
                      className="input"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      Add a meaningful name to associate with this date
                    </p>
                  </div>
                </motion.div>
              )}

              {unlockType === 'consensus' && (
                <motion.div
                  key="consensus"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-white/5 rounded-xl"
                >
                  <p className="text-white/70">
                    This letter will only unseal when <strong className="text-white">all vault members</strong> vote to unlock it.
                    No single person can open it alone.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
// Fixed seal letter submission v3
