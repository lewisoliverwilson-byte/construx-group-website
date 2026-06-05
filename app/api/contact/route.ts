import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

function sanitize(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .slice(0, 4000);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRate(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: { name?: string; email?: string; topic?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name = '', email = '', topic = '', message = '' } = body;

  if (!name.trim() || !email.trim() || !message.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  if (message.trim().length < 10) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 });
  }

  const sName = sanitize(name);
  const sEmail = sanitize(email);
  const sTopic = sanitize(topic);
  const sMessage = sanitize(message);

  const subject = `[Construx] ${sTopic ? `[${sTopic}] ` : ''}Message from ${sName}`;

  const html = `
    <div style="font-family:'Space Grotesk',sans-serif;max-width:600px;background:#000008;color:#F0EFFF;padding:32px;border-radius:12px;border:1px solid rgba(249,115,22,0.2)">
      <div style="margin-bottom:24px">
        <div style="display:inline-block;background:#F97316;color:#000;font-weight:700;font-size:12px;padding:4px 12px;border-radius:6px;letter-spacing:0.1em;text-transform:uppercase">
          Construx Group
        </div>
        <h2 style="color:#F0EFFF;font-size:20px;margin:16px 0 4px">New contact form message</h2>
        <p style="color:rgba(240,239,255,0.5);font-size:13px;margin:0">${new Date().toUTCString()}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(240,239,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:0.1em;width:100px">Name</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#F0EFFF;font-size:14px">${sName}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(240,239,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Email</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#F97316;font-size:14px">${sEmail}</td></tr>
        ${sTopic ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(240,239,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Topic</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#F0EFFF;font-size:14px">${sTopic}</td></tr>` : ''}
      </table>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:16px">
        <p style="color:rgba(240,239,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Message</p>
        <p style="color:#F0EFFF;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap">${sMessage}</p>
      </div>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('[contact] No RESEND_API_KEY — logging submission:', { name: sName, email: sEmail, topic: sTopic });
    return NextResponse.json({ success: true });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Construx Group <onboarding@resend.dev>',
      to: ['lewis.oliver.wilson@googlemail.com'],
      replyTo: sEmail,
      subject,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact] Resend error:', err);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
