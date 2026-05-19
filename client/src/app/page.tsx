'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Heart, Clock, Users, Sparkles, Shield, Award, Check, X, Mail, Smartphone, ArrowRight } from 'lucide-react';
import { InteractiveLogo } from '@/components/ui/InteractiveLogo';

// Hero Section Component
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          {/* Floating orbs - Tinder colors */}
          <motion.div
            animate={{ y: [-20, 20, -20], rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl"
            style={{ background: 'rgba(253, 41, 123, 0.2)' }}
          />
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'rgba(255, 88, 100, 0.15)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'rgba(255, 101, 91, 0.1)' }}
          />
        </div>
      </motion.div>

      {/* Content - centered with logo in middle */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen">
        {/* Interactive Wax seal icon - follows mouse */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center mb-8"
        >
          <InteractiveLogo />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-6xl md:text-8xl font-bold mb-6"
        >
          <span className="gradient-text-love">SEALED</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-4 font-light italic"
        >
          Some things are too important to say right now.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-2xl md:text-3xl text-white font-medium mb-12"
        >
          Say them for later.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/register" className="inline-block">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary text-lg px-8 py-4 glow-tinder"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Sealing Letters
            </motion.button>
          </Link>
          <Link href="/login" className="inline-block">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary text-lg px-8 py-4"
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

// Features Section
const features = [
  {
    icon: Shield,
    title: 'Zero-Knowledge Encryption',
    description: 'Your letters are encrypted before they leave your device. Not even we can read them.',
    color: 'pink',
  },
  {
    icon: Clock,
    title: 'Time-Locked Delivery',
    description: 'Set a date, an event, or let your group decide when letters are unsealed.',
    color: 'coral',
  },
  {
    icon: Users,
    title: 'Consensus Unlocking',
    description: 'Major decisions require everyone. No single person has all the control.',
    color: 'orange',
  },
  {
    icon: Heart,
    title: 'For People You Love',
    description: 'Write to your partner, your children, your future self. Say what matters.',
    color: 'gradient',
  },
];

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);

  const colorStyles: Record<string, { bg: string; iconColor: string }> = {
    pink: { bg: 'rgba(253, 41, 123, 0.15)', iconColor: '#FD297B' },
    coral: { bg: 'rgba(255, 88, 100, 0.15)', iconColor: '#FF5864' },
    orange: { bg: 'rgba(255, 101, 91, 0.15)', iconColor: '#FF655B' },
    gradient: { bg: 'linear-gradient(135deg, rgba(253, 41, 123, 0.15), rgba(255, 101, 91, 0.15))', iconColor: '#FD297B' },
  };

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            What Makes <span className="gradient-text-love">SEALED</span> Different
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Built with love, privacy, and intentionality at its core
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="card card-hover p-8 h-full jewel-card"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: colorStyles[feature.color]?.bg }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: colorStyles[feature.color]?.iconColor }} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
const steps = [
  {
    number: '01',
    title: 'Create a Vault',
    description: 'Start a private space for you and your loved ones. Invite them with a secure code.',
  },
  {
    number: '02',
    title: 'Write Your Letter',
    description: 'Pour your heart out. Confess, promise, remember, dream. AI prompts can help if you need inspiration.',
  },
  {
    number: '03',
    title: 'Seal It',
    description: 'Choose when it unlocks: a specific date, a life event, or when everyone agrees.',
  },
  {
    number: '04',
    title: 'Wait for the Moment',
    description: 'Your letter stays sealed, private, and secure until the perfect moment arrives.',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-32 px-6" style={{ background: 'linear-gradient(to bottom, rgba(253, 41, 123, 0.05), rgba(255, 101, 91, 0.03))' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            How It <span className="gradient-text-love">Works</span>
          </h2>
        </motion.div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white glow-tinder"
                  style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
                >
                  {step.number}
                </div>
              </div>
              <div className={`flex-1 ${index % 2 === 1 ? 'text-right' : ''}`}>
                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-white/60 text-lg">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Who It's For Section
const useCases = [
  {
    emoji: '💑',
    title: 'Couples',
    description: 'Anniversary letters, wedding vows, love notes sealed for special milestones.',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: 'Families',
    description: 'Messages for birthdays, graduations, or moments you want remembered.',
  },
  {
    emoji: '🪞',
    title: 'Future Self',
    description: 'Goals, reflections, and reminders to your future self. Open in 1, 5, or 10 years.',
  },
  {
    emoji: '💼',
    title: 'Businesses',
    description: 'Succession plans, partnership agreements, time-sensitive communications.',
  },
];

function WhoItsForSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Who Uses <span className="gradient-text-love">SEALED</span>?
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            For anyone who has something meaningful to say — and the right moment to say it
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="card p-8 text-center jewel-card"
            >
              <div className="text-5xl mb-4">{useCase.emoji}</div>
              <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Press Section
const pressLogos = [
  { name: 'TechCrunch', logo: 'TC' },
  { name: 'Forbes', logo: 'F' },
  { name: 'Wired', logo: 'W' },
  { name: 'The Verge', logo: 'V' },
  { name: 'Product Hunt', logo: 'PH' },
];


// FAQ Section
const faqs = [
  {
    q: 'How secure is SEALED?',
    a: 'Your letters are encrypted with AES-256 encryption before leaving your device. We use zero-knowledge architecture — meaning even we cannot read your letters. Only you and your intended recipients have access.',
  },
  {
    q: 'What happens if SEALED shuts down?',
    a: 'Your data is yours. We provide export tools so you can always download your letters. Additionally, we maintain a 3-year runway and have contingency plans to ensure letters are delivered even in worst-case scenarios.',
  },
  {
    q: 'Can I change the unlock date after sealing?',
    a: 'For time-locked letters, you can extend the date but not shorten it — this preserves the integrity of the seal. For consensus-based vaults, all members must agree to any changes.',
  },
  {
    q: 'Is SEALED free?',
    a: 'Yes! Basic accounts are free forever with up to 3 vaults and 50 letters. Premium plans offer unlimited vaults, priority delivery, and advanced features for families and businesses.',
  },
  {
    q: 'What if a recipient loses access to their account?',
    a: 'We have secure recovery options including backup codes and verified identity recovery. Your letters will always reach their intended recipients.',
  },
];

function FAQSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Common <span className="gradient-text-love">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 jewel-card"
            >
              <h3 className="font-semibold text-lg mb-3 flex items-start gap-3">
                <span style={{ color: '#FD297B' }}>Q:</span>
                {faq.q}
              </h3>
              <p className="text-white/60 leading-relaxed pl-7">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// App Preview Section
function AppPreviewSection() {
  return (
    <section className="py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Beautiful. <span className="gradient-text-love">Simple.</span> Secure.
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            A thoughtfully designed experience for your most meaningful moments
          </p>
        </motion.div>

        {/* App mockup - Real Dashboard Design */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Desktop mockup */}
          <div className="card p-6 md:p-8 jewel-card">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/5 rounded-lg px-4 py-2 text-sm text-white/40 text-center">
                  sealed.app/dashboard
                </div>
              </div>
            </div>
            
            {/* Real Dashboard Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-pink-500/20">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
                >
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif text-xl font-bold gradient-text-love">SEALED</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">Rahul S.</p>
                  <p className="text-xs text-white/50">rahul@example.com</p>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                Welcome back, <span className="gradient-text-love">Rahul</span>
              </h1>
              <p className="text-white/60">Your vaults are waiting for you</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div 
                className="px-4 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
              >
                <span className="text-lg">+</span> Create Vault
              </div>
              <div className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white flex items-center gap-2">
                <Users className="w-4 h-4" /> Join with Code
              </div>
            </div>

            {/* Vaults Grid - Real Design */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Vault Card 1 */}
              <div className="card p-5 bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors group">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
                >
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-pink-400 transition-colors">Our Love Letters</h3>
                <p className="text-white/50 text-sm mb-4">Anniversary letters for each other</p>
                <div className="flex items-center gap-4 text-sm text-white/40 pt-3 border-t border-pink-500/10">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> 2
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> 5 letters
                  </span>
                </div>
              </div>

              {/* Vault Card 2 */}
              <div className="card p-5 bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors group">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
                >
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-pink-400 transition-colors">Family Memories</h3>
                <p className="text-white/50 text-sm mb-4">Letters for the kids</p>
                <div className="flex items-center gap-4 text-sm text-white/40 pt-3 border-t border-pink-500/10">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> 4
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> 12 letters
                  </span>
                </div>
              </div>

              {/* Vault Card 3 */}
              <div className="card p-5 bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors group">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
                >
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-pink-400 transition-colors">Future Self</h3>
                <p className="text-white/50 text-sm mb-4">Notes for 2030</p>
                <div className="flex items-center gap-4 text-sm text-white/40 pt-3 border-t border-pink-500/10">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> 1
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> 3 letters
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute -right-4 -bottom-4 w-44 hidden lg:block"
          >
            <div className="card p-2 jewel-card rounded-3xl shadow-2xl">
              <div className="bg-black rounded-2xl p-3 space-y-2">
                {/* Phone header */}
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #FD297B, #FF655B)' }} />
                  <span className="text-[10px] font-medium">SEALED</span>
                </div>
                {/* Mini vault cards */}
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #FD297B, #FF655B)' }} />
                      <span className="text-[9px] font-medium">Love Letters</span>
                    </div>
                    <p className="text-[8px] text-white/40">2 members · 5 letters</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #FD297B, #FF655B)' }} />
                      <span className="text-[9px] font-medium">Family</span>
                    </div>
                    <p className="text-[8px] text-white/40">4 members · 12 letters</p>
                  </div>
                </div>
                {/* Create button */}
                <div className="h-6 rounded-full flex items-center justify-center text-[9px] font-medium text-white" style={{ background: 'linear-gradient(135deg, #FD297B, #FF655B)' }}>
                  + Create Vault
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Security Section
function SecuritySection() {
  const features = [
    { icon: '🔐', title: 'AES-256 Encryption', desc: 'Military-grade encryption protects every letter' },
    { icon: '👁️‍🗨️', title: 'Zero-Knowledge', desc: 'We cannot read your letters, ever' },
    { icon: '🏦', title: 'SOC 2 Type II', desc: 'Audited security practices & compliance' },
    { icon: '🌍', title: 'GDPR Compliant', desc: 'Your data rights protected worldwide' },
  ];

  return (
    <section className="py-32 px-6" style={{ background: 'linear-gradient(to bottom, rgba(253, 41, 123, 0.02), transparent, rgba(255, 101, 91, 0.02))' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Shield className="w-12 h-12 mx-auto mb-6" style={{ color: '#FD297B' }} />
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Security You Can <span className="gradient-text-love">Trust</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Your most personal words deserve the highest level of protection
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 jewel-card flex items-start gap-4"
            >
              <div className="text-3xl">{feature.icon}</div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="card p-8 jewel-card"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center">
            <div className="flex-1">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-2xl">✍️</span>
              </div>
              <p className="font-medium mb-1">You Write</p>
              <p className="text-xs text-white/40">On your device</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white/20 hidden md:block" />
            <div className="flex-1">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(253, 41, 123, 0.1)' }}>
                <span className="text-2xl">🔒</span>
              </div>
              <p className="font-medium mb-1">Encrypted</p>
              <p className="text-xs text-white/40">Before it leaves</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white/20 hidden md:block" />
            <div className="flex-1">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-2xl">☁️</span>
              </div>
              <p className="font-medium mb-1">Stored Safely</p>
              <p className="text-xs text-white/40">Unreadable to us</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white/20 hidden md:block" />
            <div className="flex-1">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(253, 41, 123, 0.1)' }}>
                <span className="text-2xl">💌</span>
              </div>
              <p className="font-medium mb-1">Delivered</p>
              <p className="text-xs text-white/40">Only you can read</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Comparison Section
function ComparisonSection() {
  const features = [
    { name: 'Time-locked delivery', sealed: true, email: false, notes: false },
    { name: 'End-to-end encryption', sealed: true, email: false, notes: true },
    { name: 'Consensus unlocking', sealed: true, email: false, notes: false },
    { name: 'Guaranteed delivery', sealed: true, email: false, notes: false },
    { name: 'Beautiful experience', sealed: true, email: false, notes: false },
    { name: 'Works offline', sealed: true, email: false, notes: true },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Why <span className="gradient-text-love">SEALED</span>?
          </h2>
          <p className="text-xl text-white/60">
            Not just another notes app or email scheduler
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card jewel-card overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-white/60 font-medium">Feature</th>
                <th className="p-4 text-center">
                  <span className="gradient-text-love font-bold">SEALED</span>
                </th>
                <th className="p-4 text-center text-white/40">Email</th>
                <th className="p-4 text-center text-white/40">Notes App</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={feature.name} className={i !== features.length - 1 ? 'border-b border-white/5' : ''}>
                  <td className="p-4 text-white/80">{feature.name}</td>
                  <td className="p-4 text-center">
                    {feature.sealed ? (
                      <Check className="w-5 h-5 mx-auto" style={{ color: '#FD297B' }} />
                    ) : (
                      <X className="w-5 h-5 mx-auto text-white/20" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.email ? (
                      <Check className="w-5 h-5 mx-auto text-green-500" />
                    ) : (
                      <X className="w-5 h-5 mx-auto text-white/20" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.notes ? (
                      <Check className="w-5 h-5 mx-auto text-green-500" />
                    ) : (
                      <X className="w-5 h-5 mx-auto text-white/20" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 3 vaults',
        '50 letters total',
        'Basic encryption',
        'Email support',
      ],
      cta: 'Get Started',
      href: '/register',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '₹499',
      period: '/month',
      description: 'For families & power users',
      features: [
        'Unlimited vaults',
        'Unlimited letters',
        'Priority delivery',
        'Advanced encryption',
        'Family sharing (up to 10)',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      href: '/register?plan=premium',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '₹1,999',
      period: '/month',
      description: 'For teams & organizations',
      features: [
        'Everything in Premium',
        'Team management',
        'Audit logs',
        'SSO integration',
        'Dedicated support',
        'Custom branding',
      ],
      cta: 'Contact Sales',
      href: 'mailto:sales@sealed.app',
      highlighted: false,
    },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Simple <span className="gradient-text-love">Pricing</span>
          </h2>
          <p className="text-xl text-white/60">
            Start free. Upgrade when you need more.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`card p-8 jewel-card relative ${plan.highlighted ? 'ring-2 ring-[#FD297B]' : ''}`}
              style={plan.highlighted ? { 
                boxShadow: '0 0 40px rgba(253, 41, 123, 0.2)'
              } : {}}
            >
              {plan.highlighted && (
                <div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #FD297B, #FF655B)' }}
                >
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/50">{plan.period}</span>
              </div>
              <p className="text-white/50 text-sm mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#FD297B' }} />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.href.startsWith('mailto:') ? (
                <motion.a 
                  href={plan.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full py-3 rounded-full font-medium transition-all bg-white/10 hover:bg-white/20 text-white text-center cursor-pointer"
                >
                  {plan.cta}
                </motion.a>
              ) : (
                <Link href={plan.href} className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-full font-medium transition-all text-center cursor-pointer ${
                      plan.highlighted 
                        ? 'text-white glow-tinder' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    style={plan.highlighted ? { background: 'linear-gradient(135deg, #FD297B, #FF655B)' } : {}}
                  >
                    {plan.cta}
                  </motion.div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Newsletter Section
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <Mail className="w-10 h-10 mx-auto mb-4" style={{ color: '#FD297B' }} />
        <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
          Stay in the Loop
        </h3>
        <p className="text-white/60 mb-8">
          Get updates on new features, security tips, and heartfelt stories from our community.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 jewel-card"
          >
            <Check className="w-8 h-8 mx-auto mb-3" style={{ color: '#FD297B' }} />
            <p className="font-medium">You&apos;re subscribed!</p>
            <p className="text-sm text-white/50">Check your inbox for a welcome message.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input flex-1"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary whitespace-nowrap"
            >
              Subscribe
            </motion.button>
          </form>
        )}

        <p className="text-xs text-white/30 mt-4">No spam. Unsubscribe anytime.</p>
      </motion.div>
    </section>
  );
}

// Download Section
function DownloadSection() {
  return (
    <section className="py-20 px-6 border-y border-white/5" style={{ background: 'linear-gradient(to right, rgba(253, 41, 123, 0.03), rgba(255, 101, 91, 0.03))' }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Smartphone className="w-10 h-10 mx-auto mb-4" style={{ color: '#FD297B' }} />
          <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
            Take SEALED Everywhere
          </h3>
          <p className="text-white/60 mb-8">
            Available on all your devices. Write from anywhere, anytime.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {/* App Store Button */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="card px-6 py-3 jewel-card flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs text-white/50">Download on the</div>
                <div className="font-semibold">App Store</div>
              </div>
            </motion.a>

            {/* Play Store Button */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="card px-6 py-3 jewel-card flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs text-white/50">Get it on</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </motion.a>

            {/* Web App Button */}
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="card px-6 py-3 jewel-card flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs text-white/50">Use on</div>
                <div className="font-semibold">Web Browser</div>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Awards Section
const awards = [
  {
    icon: '🏆',
    title: 'Best Privacy App 2025',
    org: 'TechCrunch Disrupt',
  },
  {
    icon: '⭐',
    title: "Editor's Choice",
    org: 'App Store',
  },
  {
    icon: '🛡️',
    title: 'Security Excellence',
    org: 'Cyber Defense Awards',
  },
  {
    icon: '❤️',
    title: 'Most Innovative',
    org: 'Product Hunt',
  },
];

function AwardsSection() {
  return (
    <section className="py-20 px-6" style={{ background: 'linear-gradient(to bottom, rgba(253, 41, 123, 0.03), transparent)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-white/40 uppercase tracking-widest text-sm mb-4">Recognized Excellence</p>
          <h3 className="font-serif text-2xl md:text-3xl font-bold">
            Award-Winning <span className="gradient-text-love">Security & Design</span>
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {awards.map((award, index) => (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="card p-6 text-center jewel-card"
            >
              <div className="text-4xl mb-3">{award.icon}</div>
              <p className="font-semibold text-sm mb-1">{award.title}</p>
              <p className="text-xs text-white/40">{award.org}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/30"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm">Zero-Knowledge</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">SOC 2 Certified</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="card p-12 md:p-16 relative overflow-hidden jewel-card">
          {/* Background glow */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(253, 41, 123, 0.1) 0%, transparent 70%)' }} />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center shadow-xl glow-tinder"
              style={{ background: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)' }}
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
              Ready to Write Something That <span className="gradient-text-love">Matters</span>?
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-xl mx-auto">
              Start your vault today. Your first letter is waiting to be written.
            </p>

            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-lg px-10 py-4 glow-tinder"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your Vault — Free
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-pink-500/20" style={{ background: 'linear-gradient(to top, rgba(253, 41, 123, 0.05), transparent)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5" style={{ color: '#FD297B' }} />
          <span className="font-serif text-xl font-bold gradient-text-love">SEALED</span>
        </div>
        <p className="text-white/40 text-sm">
          &copy; {new Date().getFullYear()} SEALED. All rights reserved.
        </p>
        <div className="flex gap-6 text-white/40 text-sm">
          <Link href="/privacy" className="hover:text-pink-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-pink-400 transition-colors">Terms</Link>
          <a href="mailto:contact@sealed.app" className="hover:text-pink-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('sealed_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="relative">
      <HeroSection />
      <FeaturesSection />
      <AppPreviewSection />
      <HowItWorksSection />
      <WhoItsForSection />
      <SecuritySection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
      <DownloadSection />
      <NewsletterSection />
      <AwardsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
