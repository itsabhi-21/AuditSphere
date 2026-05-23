'use client';

import { useState, useEffect } from 'react';
import {supabase} from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { runAudit, type ToolInput } from '@/lib/auditEngine';


const TOOLS = [
  { id: 'cursor', name: 'Cursor', plans: ['Hobby', 'Pro', 'Business', 'Enterprise'] },
  { id: 'github_copilot', name: 'GitHub Copilot', plans: ['Individual', 'Business', 'Enterprise'] },
  { id: 'claude', name: 'Claude', plans: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API Direct'] },
  { id: 'chatgpt', name: 'ChatGPT', plans: ['Plus', 'Team', 'Enterprise', 'API Direct'] },
  { id: 'anthropic_api', name: 'Anthropic API Direct', plans: ['Pay-as-you-go'] },
  { id: 'openai_api', name: 'OpenAI API Direct', plans: ['Pay-as-you-go'] },
  { id: 'gemini', name: 'Gemini', plans: ['Pro', 'Ultra', 'API'] },
  { id: 'windsurf', name: 'Windsurf', plans: ['Free', 'Pro', 'Teams'] },
];

type ToolEntry = {
  enabled: boolean;
  plan: string;
  monthlySpend: string;
  seats: string;
};

type FormData = {
  tools: Record<string, ToolEntry>;
  teamSize: string;
  useCase: string;
};

const defaultFormData: FormData = {
  tools: Object.fromEntries(
    TOOLS.map(t => [t.id, { enabled: false, plan: '', monthlySpend: '', seats: '1' }])
  ),
  teamSize: '',
  useCase: '',
};

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  useEffect(() => {
    const saved = localStorage.getItem('auditFormData');
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('auditFormData', JSON.stringify(formData));
  }, [formData]);

  const updateTool = (toolId: string, field: keyof ToolEntry, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: { ...prev.tools[toolId], [field]: value },
      },
    }));
  };

  const handleSubmit = async () => {
    const activeTools: ToolInput[] = Object.entries(formData.tools)
      .filter(([, v]) => v.enabled)
      .map(([id, v]) => ({
        id,
        plan: v.plan,
        monthlySpend: parseFloat(v.monthlySpend) || 0,
        seats: parseInt(v.seats) || 1,
      }));

    if (activeTools.length === 0) {
      alert('Please select at least one tool.');
      return;
    }

    const auditResult = runAudit(activeTools);

    // Save to Supabase in background
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: activeTools,
          teamSize: formData.teamSize,
          useCase: formData.useCase,
          totalMonthlySavings: auditResult.totalMonthlySavings,
          totalAnnualSavings: auditResult.totalAnnualSavings,
        }),
      });
      const data = await res.json();
      if (data.auditId) {
        localStorage.setItem('auditId', data.auditId);
      }
    } catch (e) {
      console.error('Failed to save audit:', e);
      // Don't block the user — continue anyway
    }

    localStorage.setItem('auditResult', JSON.stringify(auditResult));
    localStorage.setItem('auditMeta', JSON.stringify({
      teamSize: formData.teamSize,
      useCase: formData.useCase
    }));
    router.push('/results');
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl text-violet-600">AuditSphere</span>
          <span className="text-sm text-gray-500">Free AI Spend Audit</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Are you overpaying for<br />AI tools?
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Enter your current AI subscriptions and get an instant audit — what to cut, what to switch, and how much you&apos;ll save.
          </p>
        </div>

        {/* Team Info Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm">
          <h2 className="text-gray-900 font-semibold text-base mb-4">Tell us about your team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-sm mb-1.5 block font-medium">Team Size</label>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 5"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={formData.teamSize}
                onChange={e => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm mb-1.5 block font-medium">Primary Use Case</label>
              <select
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={formData.useCase}
                onChange={e => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
              >
                <option value="">Select use case</option>
                <option value="coding">Coding</option>
                <option value="writing">Writing</option>
                <option value="data">Data</option>
                <option value="research">Research</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-gray-900 font-semibold text-base mb-1">
            Which AI tools do you pay for?
          </h2>
          <p className="text-gray-400 text-sm mb-5">Check all that apply and fill in your current spend.</p>

          <div className="space-y-3">
            {TOOLS.map(tool => {
              const entry = formData.tools[tool.id];
              return (
                <div
                  key={tool.id}
                  className={`border rounded-xl p-4 transition-all cursor-pointer ${
                    entry.enabled
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={tool.id}
                      checked={entry.enabled}
                      onChange={e => updateTool(tool.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <label htmlFor={tool.id} className="text-gray-900 font-medium cursor-pointer select-none">
                      {tool.name}
                    </label>
                    {entry.enabled && entry.monthlySpend && (
                      <span className="ml-auto text-sm text-violet-600 font-semibold">
                        ${entry.monthlySpend}/mo
                      </span>
                    )}
                  </div>

                  {entry.enabled && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block">Plan</label>
                        <select
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          value={entry.plan}
                          onChange={e => updateTool(tool.id, 'plan', e.target.value)}
                        >
                          <option value="">Select</option>
                          {tool.plans.map(p => (
                            <option key={p} value={p.toLowerCase()}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block">Monthly Spend ($)</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          value={entry.monthlySpend}
                          onChange={e => updateTool(tool.id, 'monthlySpend', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block">Seats</label>
                        <input
                          type="number"
                          placeholder="1"
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          value={entry.seats}
                          onChange={e => updateTool(tool.id, 'seats', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-sm"
        >
          Get My Free Audit →
        </button>

        <p className="text-center text-gray-400 text-sm mt-4">
          No email required to see your results.
        </p>

      </div>
    </main>
  );
}