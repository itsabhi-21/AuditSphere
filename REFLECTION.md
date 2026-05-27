
## 1. Hardest bug this week

The hardest bug was the Supabase Row Level Security error on the leads table.
When a user submitted their email, the frontend showed "Something went wrong"
but gave no useful information. My first hypothesis was that the column names
in my insert didn't match the table schema — I checked and they matched exactly.
My second hypothesis was a network issue — I tested with curl and the API route
was reachable. My third hypothesis was a data type mismatch — the audit_id
column was UUID type and I was passing null sometimes. I added a UUID regex
validator to only pass valid UUIDs, but the error persisted.

Finally I added detailed error logging to the catch block and checked the
Next.js server terminal instead of the browser console. The terminal showed
the exact message: "new row violates row-level security policy for table leads."
I had never worked with Supabase RLS before. I learned that Supabase enables
RLS by default on all tables, which blocks ALL operations until you explicitly
create policies. The fix was a single SQL statement:
`CREATE POLICY "Allow public lead inserts" ON leads FOR INSERT TO anon WITH CHECK (true);`

The lesson: always check server logs, not just browser console. The browser
shows a generic 500 — the server shows the real error.

## 2. A decision I reversed mid-week

I initially built the UI with a dark theme — dark slate background, indigo
accents. It looked like a developer tool but felt aggressive and hard to read
for extended use. A dark theme made sense for a coding editor but not for a
financial audit tool where the user needs to read numbers carefully.

I reversed this on Day 2 and rebuilt with a white/gray background and violet
accents — a standard SaaS aesthetic. The reasoning: the target user is an
engineering manager or founder, not a developer customizing their terminal.
They're used to tools like Notion, Linear, and Stripe — all of which use
clean white interfaces. The new design also screenshots better, which matters
for the shareable URL viral loop.

## 3. What I'd build in week 2

The most valuable week 2 feature would be a benchmark mode: "your AI spend
per developer is $X — companies your size typically spend $Y." Right now the
audit only compares against official pricing. But what founders actually want
to know is whether they're spending more or less than their peers.

I'd build this by collecting anonymized aggregate data from audits (already
stored in Supabase) and computing percentiles by team size and use case.
"You're in the top 20% of spenders for a 5-person coding team" is a much
stronger hook than "you could save $50/mo."

I'd also build the embeddable widget — a `<script>` tag that bloggers and
newsletter writers could drop into their content. This is the highest-leverage
distribution channel because it turns every piece of content about AI tools
into a lead generation surface for Credex.

## 4. How I used AI tools

I used Claude (claude.ai) extensively throughout this project for code
generation, debugging help, and architectural decisions.

For code generation: I used Claude to write boilerplate — the initial form
structure, API route scaffolding, and Tailwind styling. This saved 3-4 hours
of typing repetitive patterns.

For debugging: When I hit the Supabase RLS error, I described the symptoms to
Claude and it suggested checking server-side logs. That nudge led me to the
real error message.

What I didn't trust AI with: the audit engine pricing logic. I wrote and
verified every pricing rule manually against official vendor pages. AI has a
knowledge cutoff and pricing changes — wrong numbers in the audit engine would
directly undermine the product's credibility.

One specific time AI was wrong: Claude suggested using `claude-sonnet-4-20250514`
as the model string for the Anthropic API. This model was deprecated and
returned a 400 error. I caught this by reading the actual API error message,
not by trusting the suggestion blindly. I switched to Gemini 2.5-flash as an
alternative.

## 5. Self-ratings

- **Discipline: 6/10** — I started on Day 1 which is good, but had an exam
  mid-week which broke consistency on Day 5. Commits are spread across days
  but not as evenly as I'd like.

- **Code quality: 7/10** — TypeScript throughout, sensible abstractions
  (audit engine is a pure function, API routes are thin), no obvious bugs in
  the happy path. Would improve with more comprehensive error handling.

- **Design sense: 7/10** — The final UI is clean and functional. The results
  page screenshots well. Dark-to-light redesign on Day 2 was the right call.
  Would improve with better mobile responsiveness.

- **Problem solving: 8/10** — Debugged the RLS issue methodically, found the
  correct Gemini model through iteration, handled API failures gracefully with
  fallbacks. Good instinct to check server logs over browser console.

- **Entrepreneurial thinking: 6/10** — I understand the product and the user.
  The audit logic is defensible. Weak point is user interviews — I was unable
  to complete three conversations before the deadline due to exam schedule.