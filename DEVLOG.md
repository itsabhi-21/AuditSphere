## Day 1 — 2026-05-21
**Hours worked:** 2 hrs
**What I did:** Set up Next.js + TypeScript + Tailwind. Created GitHub repo (AuditSphere). Created Supabase project and connected it to the app. Built initial spend input form with localStorage persistence.
**What I learned:** How Supabase client works with Next.js, how to structure environment variables properly.
**Blockers / what I'm stuck on:** Supabase setup took longer than expected — first time using it. Had to understand the difference between anon key and service key.
**Plan for tomorrow:** Fix UI theme, complete all 8 tools in the form, start building the audit engine logic.

## Day 2 — 2026-05-22
**Hours worked:** 2.5 hrs
**What I did:** Completely redesigned the UI from dark theme to clean white/violet SaaS design. Built the complete audit engine (auditEngine.ts) with pricing logic and plan mismatch detection for all 8 tools. Wired the form submit to run audit calculations. Created the results page with per-tool breakdown and savings hero block. Fixed a React hooks error — useRouter() was being called outside the component function.
**What I learned:** React hooks must be called inside component functions — calling useRouter() at module level causes an "invalid hook call" error. Debugging this taught me to read React error messages carefully.
**Blockers / what I'm stuck on:** Results page was 404 initially because file was named pages.tsx instead of page.tsx — spent 20 minutes on this.
**Plan for tomorrow:** Deploy to Vercel, wire email capture, add AI summary.

## Day 3 — 2026-05-23
**Hours worked:** 3 hrs
**What I did:** Deployed to Vercel (audit-sphere-seven.vercel.app). Created two API routes — /api/audit saves audit data to Supabase, /api/lead saves email leads. Fixed audit engine to add billing anomaly detection. Wired the "Send My Report" button to save leads. Hit and fixed a Supabase RLS error. Added honeypot spam protection to the lead form.
**What I learned:** Supabase enables RLS by default on all tables, which blocks all inserts until you explicitly create policies. Diagnosed from server logs — browser console only showed 500, real error was in Next.js terminal.
**Blockers / what I'm stuck on:** RLS error took 20 minutes to debug.
**Plan for tomorrow:** Add Gemini AI summary, fix Credex CTA rendering bug, start shareable URL.

## Day 4 — 2026-05-24
**Hours worked:** 2.5 hrs
**What I did:** Integrated Gemini 2.5-flash for AI-generated personalized summaries. Initially tried Anthropic API (credit balance error), then gemini-2.0-flash (deprecated), then gemini-1.5-flash-latest (404) before finding correct model. Fixed Credex CTA rendering raw HTML — JSX line break issue inside anchor tag. Refactored results page to move LeadCaptureForm and AISummary outside main component to fix React remounting bug.
**What I learned:** Gemini 2.0 Flash deprecated Feb 2026. JSX attribute line breaks cause rendering issues. Components defined inside other components remount on every render.
**Blockers / what I'm stuck on:** Finding correct Gemini model name — docs inconsistent across versions.
**Plan for tomorrow:** PRICING_DATA.md, PROMPTS.md, shareable URL feature.

## Day 5 — 2026-05-25
**Hours worked:** 1 hr
**What I did:** Written PRICING_DATA.md with verified sources for all 8 tools. Written PROMPTS.md documenting the Gemini prompt, why it was written that way, what didn't work, and fallback behavior. Had exam today so limited time.
**What I learned:** Importance of documenting decisions as you go — harder to reconstruct reasoning later.
**Blockers / what I'm stuck on:** Exam schedule limited available time.
**Plan for tomorrow:** Shareable URL, README, ARCHITECTURE, REFLECTION, all remaining md files.

## Day 6 — 2026-05-27
**Hours worked:** 3 hrs
**What I did:** Built shareable public audit URL at /audit/[id] with Supabase read policy. Created dynamic route with Next.js [id] folder structure. Added "Copy Link" share button on results page. Written README.md with quick start and 5 decisions. Written ARCHITECTURE.md with Mermaid system diagram, data flow, stack justification, and scaling notes. Written REFLECTION.md answering all 5 questions. Written ECONOMICS.md with unit economics and $1M ARR path. Written LANDING_COPY.md and METRICS.md.
**What I learned:** Next.js dynamic routes use folder names in square brackets. Supabase needs separate SELECT policy for public reads — INSERT policy doesn't cover SELECT.
**Blockers / what I'm stuck on:** User interviews — reached out to 6 people, no responses before deadline. Documenting honestly.
**Plan for tomorrow:** Tests, CI workflow, USER_INTERVIEWS.md, final commit, submit.

## Day 7 — 2026-05-28
**Hours worked:** 3 hrs
**What I did:** Written automated tests for audit engine covering all 8 tools and edge cases. Set up GitHub Actions CI workflow to run lint and tests on every push. Written USER_INTERVIEWS.md honestly documenting outreach attempts. Final Vercel deployment verified working. Submitted via Google Form.
**What I learned:** Writing tests after the fact forces you to think about edge cases you missed during development. CI setup is straightforward with Next.js — eslint runs out of the box.
**Blockers / what I'm stuck on:** None — submission complete.
**Plan for tomorrow:** N/A — submitted.