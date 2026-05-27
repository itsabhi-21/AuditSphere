'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuditSummary } from '@/lib/auditEngine';

// ─── Lead Capture Form ───────────────────────────────────────────────────────

function LeadCaptureForm({ auditId, isOptimal }: { auditId: string | null; isOptimal: boolean }) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  

  const handleSubmit = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName: company, role, auditId }),
      });
      const data = await res.json();
      setStatus(data.success ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">✅</div>
        <h3 className="font-semibold text-green-800 mb-1">Report sent!</h3>
        <p className="text-green-700 text-sm">
          Check your inbox. We&apos;ll notify you when new savings apply to your stack.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-1">
        {isOptimal
          ? 'Get notified when new optimizations apply to your stack'
          : 'Get this report in your inbox'}
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        No spam. We&apos;ll flag new savings opportunities as they appear.
      </p>

      {/* Honeypot — hidden from humans, filled by bots */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="space-y-3">
        <input
          type="email"
          placeholder="you@company.com *"
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company name (optional)"
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your role (optional)"
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || !email}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
        >
          {status === 'loading' ? 'Sending...' : 'Send My Report →'}
        </button>
        {status === 'error' && (
          <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}

// ─── AI Summary Block ─────────────────────────────────────────────────────────

function AISummary({ loading, summary }: { loading: boolean; summary: string | null }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <h2 className="font-semibold text-gray-900">Your Personalized Summary</h2>
        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
          AI Generated
        </span>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed">
          {summary ?? 'Based on your current AI subscriptions, there are opportunities to optimize your spending. Review the breakdown below and consider the recommended plan changes to reduce your monthly costs.'}
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const [audit, setAudit] = useState<AuditSummary | null>(null);
  const [meta, setMeta] = useState<{ teamSize: string; useCase: string } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => {
    const savedAudit = localStorage.getItem('auditResult');
    const savedMeta = localStorage.getItem('auditMeta');
    const savedAuditId = localStorage.getItem('auditId');

    if (!savedAudit) {
      router.push('/');
      return;
    }
    if (savedAuditId) {
      setAuditId(savedAuditId);
      setShareUrl(`${window.location.origin}/audit/${savedAuditId}`);
    }
    const auditData: AuditSummary = JSON.parse(savedAudit);
    setAudit(auditData);
    if (savedMeta) setMeta(JSON.parse(savedMeta));
    if (savedAuditId) setAuditId(savedAuditId);

    // Fetch AI-generated summary
    setSummaryLoading(true);
    fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tools: auditData.results,
        totalMonthlySavings: auditData.totalMonthlySavings,
        totalAnnualSavings: auditData.totalAnnualSavings,
        useCase: savedMeta ? JSON.parse(savedMeta).useCase : '',
        teamSize: savedMeta ? JSON.parse(savedMeta).teamSize : '',
      }),
    })
      .then(r => r.json())
      .then(data => { if (data.summary) setSummary(data.summary); })
      .catch(() => null)
      .finally(() => setSummaryLoading(false));

  }, [router]);

  if (!audit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your audit...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl text-violet-600">AuditSphere</span>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← New Audit
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Hero savings block */}
        <div className={`rounded-2xl p-8 mb-8 text-center ${
          audit.isOptimal ? 'bg-green-50 border border-green-200' : 'bg-violet-600'
        }`}>
          {audit.isOptimal ? (
            <>
              <div className="text-4xl mb-3">✅</div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">You&apos;re spending well!</h1>
              <p className="text-green-700">Your current AI stack is optimized. We&apos;ll notify you when better options appear.</p>
            </>
          ) : (
            <>
              <p className="text-violet-200 text-sm font-medium mb-2 uppercase tracking-wide">
                Potential Savings Found
              </p>
              <div className="text-5xl font-bold text-white mb-1">
                ${audit.totalMonthlySavings.toFixed(0)}
                <span className="text-2xl font-normal">/mo</span>
              </div>
              <div className="text-violet-200 text-lg mb-4">
                ${audit.totalAnnualSavings.toFixed(0)} saved per year
              </div>
              <p className="text-violet-100 text-sm">
                Based on your current plans and team size
                {meta?.useCase ? ` (${meta.useCase})` : ''}
              </p>
            </>
          )}
        </div>
        

        {shareUrl && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 shadow-sm flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Share this audit</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">{shareUrl}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied!');
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
            >
              Copy Link
            </button>
          </div>
        )}

        {/* Credex CTA — only for high savings */}
        {audit.showCredex && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  You could save even more with Credex
                </h3>
                <p className="text-amber-800 text-sm mb-3">
                  Credex sells discounted AI credits — Claude, ChatGPT Enterprise, Cursor and more —
                  sourced from companies that overforecast. Your savings could be even higher.
                </p>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Book a Credex Consultation →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        <AISummary loading={summaryLoading} summary={summary} />

        {/* Per-tool breakdown */}
        <h2 className="text-gray-900 font-semibold text-lg mb-4">Tool-by-tool breakdown</h2>
        <div className="space-y-4 mb-8">
          {audit.results.map(result => (
            <div
              key={result.toolId}
              className={`bg-white border rounded-2xl p-5 shadow-sm ${
                result.severity === 'overspending' ? 'border-red-200' :
                result.severity === 'review' ? 'border-amber-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    result.severity === 'overspending' ? 'bg-red-500' :
                    result.severity === 'review' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{result.toolName}</h3>
                    <p className="text-gray-500 text-sm">${result.currentSpend}/mo current spend</p>
                  </div>
                </div>
                {result.estimatedSavings > 0 && (
                  <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Save ${result.estimatedSavings}/mo
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-800 mb-1">{result.recommendedAction}</p>
                <p className="text-sm text-gray-500">{result.reason}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lead capture */}
        <LeadCaptureForm auditId={auditId} isOptimal={audit.isOptimal} />

      </div>
    </main>
  );
}