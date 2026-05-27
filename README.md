# AuditSphere — Free AI Spend Audit

AuditSphere helps startup founders and engineering managers find out exactly where they're overspending on AI tools like Cursor, Claude, ChatGPT, and GitHub Copilot. Enter your current subscriptions and get an instant audit with specific savings recommendations.

**Live URL:** https://audit-sphere-seven.vercel.app

---

## Screenshots

> [Add 3 screenshots here — homepage, results page with savings, share URL]
> Or add a Loom recording link: https://loom.com/...

---

## Quick Start

### Run locally

```bash
git clone https://github.com/itsabhi-21/AuditSphere.git
cd AuditSphere
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_key
GEMINI_API_KEY=your_gemini_key
```

```bash
npm run dev
```

Open http://localhost:3000

### Deploy

Push to GitHub. Connect repo to Vercel. Add environment variables in Vercel dashboard. Deploy.

---

## Decisions

1. **Next.js over plain React** — App Router gives us API routes, dynamic routes (/audit/[id]), and server-side rendering in one framework. No need for a separate Express backend.

2. **Supabase over MongoDB** — Assignment suggested Supabase. Relational structure fits our data model better — audits and leads have a clear foreign key relationship. RLS policies give us row-level security out of the box.

3. **Hardcoded audit rules over AI** — The assignment explicitly says "for the audit math itself, hardcoded rules are correct — knowing when not to use AI is part of the test." AI is only used for the personalized summary paragraph.

4. **Gemini over Anthropic API for summary** — Anthropic API requires paid credits. Gemini 2.5-flash has a free tier sufficient for this tool. The integration pattern is identical and can be swapped back.

5. **Honeypot over CAPTCHA for spam protection** — CAPTCHA adds user friction on a tool where conversion rate matters. Honeypot field catches bots silently with zero UX impact. Appropriate for a low-traffic lead gen tool at this stage.