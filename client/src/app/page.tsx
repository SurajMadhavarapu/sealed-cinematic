'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronDown, Heart, LockKeyhole, Mail, CalendarDays, Users, Menu, X } from 'lucide-react';
import './landing.css';

const questions = [
  ['How does a sealed letter work?', 'Create a vault, invite someone you trust, and write a letter. Choose a future date or unanimous approval from your vault members to unlock it.'],
  ['Who can read my letters?', 'Vault members can read letters through the app once they unlock. Members who join later can also read earlier unlocked letters.'],
  ['Are my letters end-to-end encrypted?', 'Not yet. This is a prototype: letter content is currently readable on the server. Please use fictional test content while encryption and recovery are being developed.'],
  ['Can I open a letter early?', 'Date-based letters stay locked until their chosen date. Group letters open when every current member votes yes. An unlocked letter stays unlocked.'],
];

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<'date' | 'group'>('date');
  const [previewOpen, setPreviewOpen] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('sealed_token')) router.replace('/dashboard');
  }, [router]);

  return (
    <div className="rose-site">
      <a className="rose-skip" href="#main-content">Skip to content</a>
      <header className="rose-header">
        <nav className="rose-container rose-nav" aria-label="Main navigation">
          <Link href="/" className="rose-brand"><span className="rose-mark"><Heart size={18} fill="currentColor" /></span>sealed<span className="rose-brand-dot">.</span></Link>
          <div className="rose-desktop-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a><a href="#faq">FAQ</a></div>
          <div className="rose-nav-actions"><Link href="/login" className="rose-login">Log in</Link><Link href="/register" className="rose-button small">Get started <ArrowRight size={15} /></Link><button className="rose-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
        </nav>
        {menuOpen && <nav id="mobile-navigation" className="rose-mobile-links" aria-label="Mobile navigation">{[['Features', '#features'], ['How it works', '#how-it-works'], ['Privacy', '#privacy'], ['FAQ', '#faq']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>}
      </header>
      <main id="main-content">
        <section className="rose-container rose-hero">
          <div className="rose-hero-copy">
            <span className="rose-eyebrow"><span /> A LITTLE SOMETHING FOR LATER</span>
            <h1>Write it today.<br />Feel it <span>all over again.</span></h1>
            <p className="rose-intro">Some words deserve their own moment. Save a letter for your future self, your favorite person, or the people you call home.</p>
            <div className="rose-hero-actions"><Link className="rose-button" href="/register">Write your first letter <ArrowRight size={18} /></Link><a className="rose-text-link" href="#how-it-works">See how it works <ArrowRight size={16} /></a></div>
            <div className="rose-benefits"><span><Check /> Pick a date</span><span><Check /> Share a vault</span><span><Check /> Open together</span></div>
          </div>
          <div className="rose-preview-wrap">
            <div className="rose-preview">
              <div className="rose-preview-top"><span><Mail size={18} /> A letter for later</span><span className="rose-demo">DEMO</span></div>
              <div className="rose-mode" role="group" aria-label="Example unlock method"><button aria-pressed={mode === 'date'} onClick={() => { setMode('date'); setPreviewOpen(false); }}><CalendarDays size={16} /> On a date</button><button aria-pressed={mode === 'group'} onClick={() => { setMode('group'); setPreviewOpen(false); }}><Users size={16} /> Together</button></div>
              <div className="rose-paper"><span className="rose-paper-label">TO MY FUTURE SELF</span><h2>Look how far you&apos;ve come.</h2><p>I hope you still make time for the little things. The long walks. The loud laughs. The people who feel like sunshine.</p><p className="rose-signature">With love, your past self ♡</p></div>
              <div className="rose-rule"><span>{mode === 'date' ? <CalendarDays size={17} /> : <Users size={17} />}{mode === 'date' ? 'Opens on your chosen date' : 'Opens when everyone agrees'}</span><LockKeyhole size={15} /></div>
              <button className="rose-button rose-preview-button" onClick={() => setPreviewOpen(!previewOpen)}>{previewOpen ? <Mail size={17} /> : <LockKeyhole size={17} />}{previewOpen ? 'Close the preview' : 'Preview a sealed letter'}<ArrowRight size={17} /></button>
              <div className="rose-preview-result" aria-live="polite">{previewOpen ? <p>{mode === 'date' ? 'Your real letter stays sealed until its date arrives.' : 'Every current vault member must vote yes to open your real letter.'} <Link href="/register">Create your vault →</Link></p> : <p>A fictional example. Nothing is saved or sent.</p>}</div>
            </div>
            <div className="rose-preview-caption"><Heart size={14} /> Good things are worth waiting for.</div>
          </div>
        </section>
        <div className="rose-occasions"><div className="rose-container"><span>FOR THE MOMENTS THAT MATTER</span><p>Future you <i>✳</i> Anniversaries <i>✳</i> New beginnings <i>✳</i> Just because</p></div></div>
        <section id="features" className="rose-container rose-section">
          <div className="rose-section-heading"><span className="rose-kicker">MORE THAN A MESSAGE</span><h2>A small letter.<br />A lasting feeling.</h2><p>A place for the things you want to remember, and the words you want to share.</p></div>
          <div className="rose-feature-grid">{[
            { Icon: Mail, title: 'Say it in a letter', text: 'A thank-you. A promise. A little encouragement. Give your words a home beyond the everyday conversation.' },
            { Icon: CalendarDays, title: 'Save the moment', text: 'Choose a date that means something. Your letter waits in its vault until that moment arrives.' },
            { Icon: Users, title: 'Make it yours, together', text: 'Invite your people to a shared vault. Choose group approval when you want everyone to decide together.' },
          ].map(({ Icon, title, text }, index) => <article className="rose-feature" key={title}><div className="rose-feature-top"><span className="rose-icon"><Icon size={22} /></span><span>0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
        <section id="how-it-works" className="rose-how"><div className="rose-container rose-how-grid"><div><span className="rose-kicker">A FEW CLICKS. A FUTURE MEMORY.</span><h2>From your heart<br />to the right moment.</h2><Link href="/register" className="rose-text-link">Make your first vault <ArrowRight size={17} /></Link></div><ol>{[['Create a vault', 'A shared space for you and the people you choose.'], ['Write something meaningful', 'Pick a future date or unanimous group approval.'], ['Come back to the feeling', 'Read together once your letter is unlocked.']].map(([title, text], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>
        <section id="privacy" className="rose-container rose-privacy"><span className="rose-icon"><LockKeyhole size={24} /></span><div><h2>Personal words deserve honest promises.</h2><p>SEALED is still a prototype. Access is controlled by vault membership and unlock rules, but letters are not yet end-to-end encrypted. Use fictional content while we build stronger protection.</p><Link href="/privacy" className="rose-text-link">Read our privacy details <ArrowRight size={16} /></Link></div><span className="rose-demo">IN DEVELOPMENT</span></section>
        <section id="faq" className="rose-container rose-section rose-faq"><div className="rose-section-heading"><span className="rose-kicker">A FEW THINGS TO KNOW</span><h2>Before you seal it.</h2></div><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} /></summary><p>{answer}</p></details>)}</div></section>
        <section className="rose-container rose-last"><Heart size={28} /><h2>For someone you love.<br />Including future you.</h2><p>The right words. A moment to look forward to.</p><Link href="/register" className="rose-button">Start your first vault <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="rose-container rose-footer"><div><Link href="/" className="rose-brand">sealed<span className="rose-brand-dot">.</span></Link><p>Words worth keeping. Moments worth waiting for.</p></div><nav aria-label="Footer"><Link href="/login">Log in</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav><span>© {new Date().getFullYear()} SEALED</span></footer>
    </div>
  );
}
