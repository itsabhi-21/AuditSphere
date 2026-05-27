'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type PublicAudit = {
  id: string;
  tools: Array<{ id: string; plan: string; monthlySpend: number; seats: number }>;
  total_monthly_savings: number;
  total_annual_savings: number;
  use_case: string;
  team_size: number;
  created_at: string;
};

export default function PublicAuditPage() {
  const params = useParams();
  const [audit, setAudit] = useState<PublicAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/audit/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.audit) setAudit(data.audit);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading audit...</p>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit not found</h1>
        <p className="text-gray-500 mb-4">This link may have expired or never existed.</p>
        <a href="/" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Run your own audit →
        </a>
      </div>
    </div>
  );

  if (!audit) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl text-violet-600">AuditSphere</span>
          <a href="/" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg font-medium">
            Audit my stack →
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className={`rounded-2xl p-8 mb-8 text-center ${
          audit.total_monthly_savings > 0 ? 'bg-violet-600' : 'bg-green-50 border border-green-200'
        }`}>
          {audit.total_monthly_savings > 0 ? (
            <>
              <p className="text-violet-200 text-sm font-medium mb-2 uppercase tracking-wide">
                Potential Savings Found
              </p>
              <div className="text-5xl font-bold text-white mb-1">
                ${audit.total_monthly_savings.toFixed(0)}
                <span className="text-2xl font-normal">/mo</span>
              </div>
              <div className="text-violet-200 text-lg mb-4">
                ${audit.total_annual_savings.toFixed(0)} saved per year
              </div>
              {audit.use_case && (
                <p className="text-violet-100 text-sm">Use case: {audit.use_case}</p>
              )}
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">✅</div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">Spending well!</h1>
              <p className="text-green-700">This stack is already optimized.</p>
            </>
          )}
        </div>

        <div className="bg-white border border-violet-200 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="font-bold text-gray-900 text-lg mb-2">
            Want to audit your own AI stack?
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Free, instant, no signup required.
          </p>
          <a href="/" className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Get My Free Audit →
          </a>
        </div>
      </div>
    </main>
  );
}