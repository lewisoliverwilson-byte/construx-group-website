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
    'w-full bg-white/[0.04] border border-white/[0.09] rounded-lg px-4 py-3.5 text-[14px] text-white/85 font-light placeholder:text-white/22 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all';

  return (
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-20">
          <p className="t-eyebrow mb-5">Contact</p>
          <h1 className="t-page mb-6">Get in touch.</h1>
          <p className="t-lead max-w-md">
            Direct line:{' '}
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com"
              className="text-white/70 hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
            >
              lewis.oliver.wilson@googlemail.com
            </a>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            {status === 'sent' ? (
              <div className="card p-12 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}
                >
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
                <h3 className="t-card text-[20px] mb-2">Message received.</h3>
                <p className="t-body">We&apos;ll get back to you within a few days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="t-meta block mb-2.5" style={{ fontSize: 9 }}>Name</label>
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
                    <label className="t-meta block mb-2.5" style={{ fontSize: 9 }}>Email</label>
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
                  <label className="t-meta block mb-2.5" style={{ fontSize: 9 }}>Subject</label>
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
                  <label className="t-meta block mb-2.5" style={{ fontSize: 9 }}>Message</label>
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
                  className="btn-primary disabled:opacity-40"
                  style={{ cursor: status === 'sending' ? 'wait' : 'pointer' }}
                >
                  <Send size={13} />
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6">
              <p className="t-card text-[15px] mb-3">Direct line</p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com"
                className="font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5 break-all"
              >
                lewis.oliver.wilson@googlemail.com
                <ArrowUpRight size={10} className="flex-shrink-0" />
              </a>
            </div>
            <div className="card p-6">
              <p className="t-card text-[15px] mb-3">Construx Studio</p>
              <p className="t-body text-[12.5px] mb-4">
                For project enquiries, use the subject line &ldquo;Construx Studio —
                project&rdquo; or contact directly.
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Studio — Project Enquiry"
                className="btn-text t-meta"
                style={{ fontSize: 9.5 }}
              >
                Project enquiry <ArrowUpRight size={10} />
              </a>
            </div>
            <div className="card p-6">
              <p className="t-card text-[15px] mb-3">Response time</p>
              <p className="t-body text-[12.5px]">
                We reply to all messages within a few days. For urgent matters, email
                directly.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/work-with-us" className="btn-text t-meta" style={{ fontSize: 10 }}>
                Work with us <ArrowRight size={10} />
              </Link>
              <Link href="/ventures" className="btn-text t-meta" style={{ fontSize: 10 }}>
                Our ventures <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
