## Day 1 — 2026-05-21
**Hours worked:** 2 hrs.
**What I did:** Set up Next.js + TypeScript + Tailwind.
Created Supabase project. Built initial spend input form for Cursor and Claude
with localStorage persistence.
**What I learned:** How to use Supabase
**Blockers / what I'm stuck on:** Setting up the Supabase as it was first time with supabase
**Plan for tomorrow:** Complete all 8 tools in the form, define the audit
engine data structures, start pricing research.


## Day 2 — 2026-05-22
**Hours worked:** 2.5 hrs
**What I did:** Completely redesigned the UI from dark theme to clean white/violet SaaS design. Built the complete audit engine (auditEngine.ts) with pricing logic and plan mismatch detection for all 8 tools. Wired the form submit to run audit calculations. Created the results page with per-tool breakdown and savings hero block. Fixed a React hooks error — useRouter() was being called outside the component function.
**What I learned:** React hooks must be called inside component functions — calling useRouter() at module level causes an "invalid hook call" error. Debugging this taught me to read React error messages carefully.
**Blockers / what I'm stuck on:** Results page was 404 initially because file was named pages.tsx instead of page.tsx — spent 20 minutes on this.
**Plan for tomorrow:** Deploy to Vercel, wire email capture, add Anthropic AI summary.



## Day 3 — 2026-05-23
**Hours worked:** 3 hrs
**What I did:** Deployed to Vercel successfully (audit-sphere-seven.vercel.app). Created two API routes — /api/audit saves audit data to Supabase, /api/lead saves email leads. Fixed audit engine to add billing anomaly detection (checks if actual spend matches expected price per seat). Wired the "Send My Report" button to save leads. Hit and fixed a Supabase RLS (Row Level Security) error — tables were blocking all inserts by default. Added honeypot spam protection to the lead form.
**What I learned:** Supabase enables RLS by default on all tables, which blocks all inserts until you explicitly create policies. Diagnosed this from server logs — the error message was "new row violates row-level security policy." Fixed with a SQL INSERT policy for the anon role.
**Blockers / what I'm stuck on:** RLS error took ~20 minutes to debug. The browser console only showed 500, the real error was in the Next.js server terminal.
**Plan for tomorrow:** Add Anthropic AI summary, fix Credex CTA button rendering bug, start shareable URL feature.



## Day 4 — 2026-05-24
**Hours worked:** 2.5 hrs
**What I did:** Integrated Gemini 2.5-flash API for AI-generated personalized audit summaries. Initially tried Anthropic API but hit credit balance error, then tried gemini-2.0-flash (deprecated) and gemini-1.5-flash-latest (404) before finding correct model name gemini-2.5-flash. Fixed Credex CTA button which was rendering raw HTML — caused by JSX line break inside the anchor tag attributes. Refactored results page to move LeadCaptureForm and AISummary outside the main component to fix React remounting bug. Added graceful fallback for AI summary API failures.
**What I learned:** Gemini 2.0 Flash was deprecated in February 2026. JSX attribute line breaks inside tags can cause unexpected rendering issues. Defining components inside other components causes React to remount them on every render.
**Blockers / what I'm stuck on:** Spent significant time finding the correct Gemini model name — documentation was inconsistent across versions. Also the Antropic AI was not supporting properly.
**Plan for tomorrow:** Build shareable URL (/audit/[id]) with Open Graph tags, write PRICING_DATA.md, start user interviews.