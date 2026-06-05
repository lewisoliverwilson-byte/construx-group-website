'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const topics = [
  'Working together',
  'Partnership / collaboration',
  'Press enquiry',
  'Venture feedback',
  'Something else',
];

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message too short (min 20 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm({ name: '', email: '', topic: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type: string = 'text',
    placeholder: string = '',
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-text-dim">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={form[id]}
        onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
        placeholder={placeholder}
        autoComplete={id === 'email' ? 'email' : 'off'}
        className="w-full px-4 py-3 rounded-xl text-sm text-text-base placeholder:text-text-dim transition-all outline-none focus:border-construx/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]"
        style={{
          background: 'rgba(5,5,18,0.8)',
          border: errors[id] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
        }}
      />
      {errors[id] && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={11} /> {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4">
            // GET IN TOUCH
          </p>
          <h1 className="text-display text-text-base mb-5 leading-none">
            <span className="text-gradient-orange">Contact</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-md mx-auto">
            We respond to every message. Usually same day.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 mx-auto max-w-2xl">
        {status === 'success' ? (
          <div
            className="rounded-2xl px-8 py-12 text-center"
            style={{ background: 'rgba(5,5,18,0.88)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <CheckCircle className="mx-auto mb-4 text-emerald-400" size={36} />
            <h2 className="text-lg font-bold text-text-base mb-3">Message sent.</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              We've received your message and will get back to you shortly.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 text-xs text-construx hover:text-orange-400 transition-colors"
            >
              Send another →
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(5,5,18,0.88)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {field('name', 'Your name', 'text', 'Your name')}
                {field('email', 'Email address', 'email', 'you@company.com')}
              </div>

              {/* Topic dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="topic"
                  className="text-xs font-semibold uppercase tracking-widest text-text-dim"
                >
                  What&apos;s this about? <span className="text-text-dim normal-case tracking-normal">(optional)</span>
                </label>
                <select
                  id="topic"
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none focus:border-construx/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] appearance-none"
                  style={{
                    background: 'rgba(5,5,18,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: form.topic ? '#F0EFFF' : 'rgba(240,239,255,0.35)',
                  }}
                >
                  <option value="" disabled>
                    Select a topic…
                  </option>
                  {topics.map((t) => (
                    <option key={t} value={t} style={{ background: '#05050F', color: '#F0EFFF' }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="text-xs font-semibold uppercase tracking-widest text-text-dim"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us what you're working on or want to build…"
                  className="w-full px-4 py-3 rounded-xl text-sm text-text-base placeholder:text-text-dim resize-none transition-all outline-none focus:border-construx/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]"
                  style={{
                    background: 'rgba(5,5,18,0.8)',
                    border: errors.message ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                />
                {errors.message && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.message}
                  </p>
                )}
              </div>

              {status === 'error' && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <AlertCircle size={14} />
                  Something went wrong. Try again or email us directly.
                </div>
              )}
            </div>

            {/* Footer bar */}
            <div
              className="px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border"
              style={{ background: 'rgba(0,0,8,0.4)' }}
            >
              <p className="text-xs text-text-dim">
                Or email directly:{' '}
                <a
                  href="mailto:lewis.oliver.wilson@googlemail.com"
                  className="text-text-muted hover:text-construx transition-colors"
                >
                  lewis.oliver.wilson@googlemail.com
                </a>
              </p>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-black bg-construx hover:bg-orange-400 transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)] hover:shadow-[0_0_24px_rgba(249,115,22,0.5)] disabled:opacity-60 disabled:pointer-events-none"
              >
                {status === 'loading' ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={13} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
