'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Send } from 'lucide-react';

const SUBJECTS = [
  'General enquiry',
  'Construx Studio — project',
  'Speculative application',
  'Partnership',
  'Press',
  'Other',
];

export default function ContactPage() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  const inputClass =
    'w-full bg-white/[0.04] border border-white/08 rounded-md px-4 py-3 text-[14px] text-white/82 font-light placeholder:text-white/22 focus:outline-none focus:border-white/20 transition-colors';

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Contact</p>
          <h1
            className="text-display text-white/90 mb-5"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            Get in touch.
          </h1>
          <p className="text-[15px] text-white/40 font-light max-w-md leading-relaxed">
            Direct line: <a href="mailto:lewis.oliver.wilson@googlemail.com" className="text-white/65 hover:text-white/88 transition-colors">lewis.oliver.wilson@googlemail.com</a>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Form */}
          <div className="lg:col-span-3">
            {status === 'sent' ? (
              <div className="glass rounded-xl p-10 text-center border-t-2 border-emerald-400/40">
                <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-5">
                  <span className="text-emerald-400 text-lg">✓</span>
                </div>
                <h3
                  className="text-[20px] text-white/88 mb-2"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
                >
                  Message received.
                </h3>
                <p className="text-[13px] text-white/38 font-light">We'll get back to you within a few days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/28 block mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/28 block mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/28 block mb-2">Subject</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className={inputClass}
                    style={{ cursor: 'pointer' }}
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s} style={{ background: '#000014' }}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/28 block mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="What's on your mind?"
                    className={inputClass}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                {status === 'error' && (
                  <p className="font-mono text-[10px] text-red-400/70">
                    Something went wrong. Email directly: lewis.oliver.wilson@googlemail.com
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex items-center gap-2.5 px-7 py-3.5 glass rounded-md text-[13px] text-white/75 hover:text-white border border-white/08 hover:border-white/18 transition-all font-light tracking-wide disabled:opacity-40"
                >
                  <Send size={13} />
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass rounded-lg p-5 border-t-2 border-white/06">
              <p
                className="text-[15px] text-white/72 mb-2"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
              >
                Direct line
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com"
                className="font-mono text-[11px] text-white/38 hover:text-white/65 transition-colors flex items-center gap-1.5"
              >
                lewis.oliver.wilson@googlemail.com
                <ArrowUpRight size={10} />
              </a>
            </div>
            <div className="glass rounded-lg p-5 border-t-2 border-white/06">
              <p
                className="text-[15px] text-white/72 mb-2"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
              >
                Construx Studio
              </p>
              <p className="text-[12px] text-white/32 font-light mb-3">
                For project enquiries, use the subject line "Construx Studio — project enquiry" or contact directly.
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Studio — Project Enquiry"
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/28 hover:text-white/55 transition-colors"
              >
                Project enquiry <ArrowUpRight size={10} />
              </a>
            </div>
            <div className="glass rounded-lg p-5 border-t-2 border-white/06">
              <p
                className="text-[15px] text-white/72 mb-2"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
              >
                Response time
              </p>
              <p className="text-[12px] text-white/32 font-light">
                We reply to all messages within a few days. For urgent matters, email directly.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/work-with-us" className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/22 hover:text-white/50 transition-colors flex items-center gap-1.5">
                Work with us <ArrowRight size={9} />
              </Link>
              <Link href="/ventures" className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/22 hover:text-white/50 transition-colors flex items-center gap-1.5">
                Our ventures <ArrowRight size={9} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
