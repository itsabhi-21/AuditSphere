# Metrics

## North Star Metric

**Audits completed per week**

Why: This is a lead-gen tool. Every completed audit is a potential
Credex customer. DAU/MAU don't apply — users audit their stack once
per quarter, not daily. "Audits completed" directly measures whether
the tool is delivering value and whether distribution is working.

## 3 Input Metrics

**1. Homepage → Audit completion rate**
Target: >35%. If below 25%, the form has too much friction or the
value proposition isn't clear on the landing page.

**2. Audit completion → Email capture rate**
Target: >15%. Measures whether the audit results are valuable enough
that users want to save them. Below 10% means the audit quality or
results page design needs work.

**3. Email capture → Credex consultation booked rate**
Target: >20% for high-savings audits (>$500/mo). This is the direct
revenue driver. Below 10% means the Credex CTA or offer isn't
compelling enough.

## What to instrument first

1. Pageview → form start → audit submit funnel (basic funnels)
2. Savings distribution histogram (how many audits find $0, $1-100,
   $100-500, $500+ savings)
3. Which tools appear most often in high-savings audits
4. Email capture conversion by savings tier

Simple implementation: log each audit to Supabase with savings amount.
Query weekly. No need for complex analytics at this stage.

## Pivot trigger

If after 500 audits:
- Median savings found < $50/mo → audit logic needs improvement,
  or target user is wrong (already optimized teams)
- Email capture rate < 8% → results page not compelling enough
- Zero Credex consultations booked → disconnect between audit
  users and Credex buyers, need to re-examine ICP

The tool should be paused and redesigned if 500 audits produce
zero Credex consultations. That means the lead gen thesis is broken.