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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--paper-raised)',
    border: '1px solid var(--hairline)',
    borderRadius: 2,
    padding: '13px 16px',
    fontFamily: 'var(--font-serif)',
    fontSize: 15,
    color: 'var(--ink)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Contact</p>
          <h1 className="t-page mb-7">Get in touch.</h1>
          <p className="t-lead" style={{ maxWidth: '46ch' }}>
            Direct line:{' '}
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com"
              className="underline"
              style={{ color: 'var(--ink)', textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
            >
              lewis.oliver.wilson@googlemail.com
            </a>
          </p>
        </div>

        <div className="title-rule mb-16" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
          {/* Form */}
          <div className="lg:col-span-7">
            {status === 'sent' ? (
              <div className="sheet p-12 text-center">
                <span className="reg-mark mx-auto mb-6 block" />
                <h3 className="t-card text-[20px] mb-2">Message received.</h3>
                <p className="t-body">We reply within a few days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="t-meta block mb-2.5" style={{ fontSize: 10 }}>Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="t-meta block mb-2.5" style={{ fontSize: 10 }}>Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="t-meta block mb-2.5" style={{ fontSize: 10 }}>Subject</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 13 }}
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="t-meta block mb-2.5" style={{ fontSize: 10 }}>Message</label>
                  <textarea
                    required
                    rows={7}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="What are you building?"
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                {status === 'error' && (
                  <p className="font-mono text-[11px]" style={{ color: '#B3402E' }}>
                    Something went wrong. Email directly: lewis.oliver.wilson@googlemail.com
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-ink disabled:opacity-40"
                  style={{ cursor: status === 'sending' ? 'wait' : 'pointer' }}
                >
                  <Send size={12} />
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-5">
            <dl className="flex flex-col mb-10">
              {[
                { k: 'Response time', v: 'A few days' },
                { k: 'Studio enquiries', v: 'Subject: Construx Studio' },
                { k: 'Base', v: 'United Kingdom' },
                { k: 'Press', v: 'Same inbox' },
              ].map(({ k, v }) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-6 py-3.5 border-b"
                  style={{ borderColor: 'var(--hairline)' }}
                >
                  <dt className="t-meta" style={{ fontSize: 10 }}>{k}</dt>
                  <dd className="font-mono text-[12px] text-right" style={{ color: 'var(--ink)' }}>{v}</dd>
                </div>
              ))}
            </dl>

            <div className="sheet p-7 mb-8">
              <p className="t-card text-[16px] mb-3">Commissioning the studio?</p>
              <p className="t-body text-[13.5px] mb-5">
                Tell us what you&apos;re building, where it stands, and when you need
                it. We&apos;ll reply with an honest read on whether we&apos;re the
                right fit.
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Studio — Project Enquiry"
                className="btn-text"
              >
                Project enquiry <ArrowUpRight size={10} />
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/work-with-us" className="btn-text">
                Work with us <ArrowRight size={10} />
              </Link>
              <Link href="/ventures" className="btn-text">
                Project index <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
