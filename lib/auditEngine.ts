export type ToolInput = {
  id: string;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditResult = {
  toolId: string;
  toolName: string;
  currentSpend: number;
  recommendedAction: string;
  suggestedPlan?: string;
  estimatedSavings: number;
  reason: string;
  severity: 'overspending' | 'optimal' | 'review';
};

export type AuditSummary = {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isOptimal: boolean;
  showCredex: boolean;
};

// Official pricing as of May 2026 — sources in PRICING_DATA.md
const EXPECTED_COST: Record<string, Record<string, number | null>> = {
  cursor:         { hobby: 0, pro: 20, business: 40, enterprise: null },
  github_copilot: { individual: 10, business: 19, enterprise: 39 },
  claude:         { free: 0, pro: 20, max: 100, team: 30, enterprise: null, 'api direct': null },
  chatgpt:        { plus: 20, team: 30, enterprise: null, 'api direct': null },
  gemini:         { pro: 19.99, ultra: 249.99, api: null },
  windsurf:       { free: 0, pro: 15, teams: 35 },
};

const TOOL_NAMES: Record<string, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API Direct',
  openai_api: 'OpenAI API Direct',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

// Helper: checks if user is paying more than expected for their plan
function getBillingAnomaly(
  toolId: string,
  toolName: string,
  plan: string,
  monthlySpend: number,
  seats: number
): AuditResult | null {
  const toolPricing = EXPECTED_COST[toolId];
  if (!toolPricing) return null;

  const pricePerSeat = toolPricing[plan];
  if (pricePerSeat === null || pricePerSeat === undefined) return null; // usage-based, skip

  const expected = pricePerSeat * seats;
  if (expected === 0) return null; // free plan

  if (monthlySpend > expected * 1.05) {
    const overcharge = Math.round(monthlySpend - expected);
    return {
      toolId,
      toolName,
      currentSpend: monthlySpend,
      recommendedAction: 'Verify your billing immediately',
      estimatedSavings: overcharge,
      reason: `${seats} seat(s) on ${plan} should cost $${expected}/mo at $${pricePerSeat}/seat. You're paying $${monthlySpend}/mo — $${overcharge} more than expected. Check for duplicate subscriptions or legacy billing.`,
      severity: 'overspending',
    };
  }

  return null;
}

function auditCursor(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  // Check billing anomaly first
  const anomaly = getBillingAnomaly('cursor', 'Cursor', plan, monthlySpend, seats);
  if (anomaly) return anomaly;

  // Business plan overkill for small teams
  if (plan === 'business' && seats <= 3) {
    const savings = (40 - 20) * seats;
    return {
      toolId: 'cursor',
      toolName: 'Cursor',
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Pro plan',
      suggestedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Business plan ($40/seat) adds SSO, audit logs, and admin controls — features only meaningful at 10+ seats. With ${seats} seat(s), Pro ($20/seat) is identical for day-to-day coding. Save $${savings}/mo.`,
      severity: 'overspending',
    };
  }

  // Hobby plan — free, nothing to optimize
  if (plan === 'hobby') {
    return {
      toolId: 'cursor',
      toolName: 'Cursor',
      currentSpend: monthlySpend,
      recommendedAction: 'No action needed',
      estimatedSavings: 0,
      reason: `You're on the free Hobby plan. Nothing to optimize here.`,
      severity: 'optimal',
    };
  }

  return {
    toolId: 'cursor',
    toolName: 'Cursor',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `${seats} seat(s) on ${plan} at $${monthlySpend}/mo is correctly priced. No savings opportunity identified.`,
    severity: 'optimal',
  };
}

function auditGithubCopilot(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  // Check billing anomaly first
  const anomaly = getBillingAnomaly('github_copilot', 'GitHub Copilot', plan, monthlySpend, seats);
  if (anomaly) return anomaly;

  // Enterprise overkill for small teams
  if (plan === 'enterprise' && seats <= 5) {
    const savings = (39 - 19) * seats;
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Business plan',
      suggestedPlan: 'Business',
      estimatedSavings: savings,
      reason: `Enterprise ($39/seat) adds SAML SSO and audit logs — only relevant for compliance-heavy orgs. With ${seats} seat(s), Business ($19/seat) has identical AI coding features. Save $${savings}/mo.`,
      severity: 'overspending',
    };
  }

  // Business plan for solo dev
  if (plan === 'business' && seats === 1) {
    const savings = monthlySpend - 10;
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      currentSpend: monthlySpend,
      recommendedAction: 'Switch to Individual plan',
      suggestedPlan: 'Individual',
      estimatedSavings: savings,
      reason: `Individual plan ($10/mo) has identical AI code completion for solo developers. Business plan's team management features have no value for 1 user. Save $${savings}/mo.`,
      severity: 'overspending',
    };
  }

  return {
    toolId: 'github_copilot',
    toolName: 'GitHub Copilot',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `${seats} seat(s) on ${plan} at $${monthlySpend}/mo is correctly priced. Plan matches your team size.`,
    severity: 'optimal',
  };
}

function auditClaude(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  // Check billing anomaly first
  const anomaly = getBillingAnomaly('claude', 'Claude', plan, monthlySpend, seats);
  if (anomaly) return anomaly;

  // Max plan — flag unless they're heavy users
  if (plan === 'max') {
    const savings = (100 - 20) * seats;
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentSpend: monthlySpend,
      recommendedAction: 'Evaluate if Max usage limits are necessary',
      suggestedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Claude Max ($100/seat) gives 5× more usage than Pro ($20/seat). Unless your team hits Pro's daily limits consistently, Pro saves $${savings}/mo. Try Pro for one month and monitor.`,
      severity: 'review',
    };
  }

  // Team plan for tiny teams (min billing is 5 seats)
  if (plan === 'team' && seats <= 2) {
    const savings = (30 - 20) * seats;
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentSpend: monthlySpend,
      recommendedAction: 'Switch to individual Pro plans',
      suggestedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Claude Team ($30/seat) has a 5-seat minimum billing floor. With ${seats} user(s), individual Pro ($20/seat) gives identical model access at lower cost. Save $${savings}/mo.`,
      severity: 'overspending',
    };
  }

  // API direct — usage based, flag if high
  if (plan === 'api direct' && monthlySpend > 100) {
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentSpend: monthlySpend,
      recommendedAction: 'Review API usage patterns',
      estimatedSavings: Math.round(monthlySpend * 0.2),
      reason: `At $${monthlySpend}/mo on Anthropic API, prompt caching and batching can cut costs 20–30%. Check if claude-haiku-4 covers your use case vs claude-sonnet-4 for routine tasks.`,
      severity: 'review',
    };
  }

  return {
    toolId: 'claude',
    toolName: 'Claude',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Your Claude plan is well-matched to your team size and usage.`,
    severity: 'optimal',
  };
}

function auditChatGPT(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  // Check billing anomaly first
  const anomaly = getBillingAnomaly('chatgpt', 'ChatGPT', plan, monthlySpend, seats);
  if (anomaly) return anomaly;

  // Team plan for solo user
  if (plan === 'team' && seats === 1) {
    return {
      toolId: 'chatgpt',
      toolName: 'ChatGPT',
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Plus',
      suggestedPlan: 'Plus',
      estimatedSavings: 10,
      reason: `ChatGPT Team ($30/seat) adds shared workspaces and admin controls — only useful with 2+ users. Solo users get identical GPT-4o access with Plus ($20/mo). Save $10/mo.`,
      severity: 'overspending',
    };
  }

  // Team plan — check if Claude or Gemini Pro is cheaper for their use case
  if (plan === 'team' && seats >= 5) {
    return {
      toolId: 'chatgpt',
      toolName: 'ChatGPT',
      currentSpend: monthlySpend,
      recommendedAction: 'Consider Claude Team as an alternative',
      estimatedSavings: 0,
      reason: `ChatGPT Team ($30/seat) and Claude Team ($30/seat) are similarly priced. If your primary use is writing or research, Claude's longer context window may deliver more value at the same cost.`,
      severity: 'review',
    };
  }

  // API direct — flag if high spend
  if (plan === 'api direct' && monthlySpend > 200) {
    return {
      toolId: 'chatgpt',
      toolName: 'ChatGPT',
      currentSpend: monthlySpend,
      recommendedAction: 'Review model usage and add spend caps',
      estimatedSavings: Math.round(monthlySpend * 0.2),
      reason: `At $${monthlySpend}/mo on OpenAI API, switching routine tasks from GPT-4o to GPT-4o-mini (94% cheaper) typically cuts costs 20–30% with minimal quality loss.`,
      severity: 'review',
    };
  }

  return {
    toolId: 'chatgpt',
    toolName: 'ChatGPT',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Plan is appropriate for your team size and spend.`,
    severity: 'optimal',
  };
}

function auditAPITool(input: ToolInput, toolName: string): AuditResult {
  const { monthlySpend, id } = input;

  if (monthlySpend > 500) {
    return {
      toolId: id,
      toolName,
      currentSpend: monthlySpend,
      recommendedAction: 'Implement prompt caching and model tiering',
      estimatedSavings: Math.round(monthlySpend * 0.25),
      reason: `At $${monthlySpend}/mo, three optimizations typically save 20–30%: (1) prompt caching for repeated context, (2) routing simple tasks to cheaper models, (3) setting hard monthly spend caps to avoid surprise bills.`,
      severity: 'review',
    };
  }

  if (monthlySpend > 200) {
    return {
      toolId: id,
      toolName,
      currentSpend: monthlySpend,
      recommendedAction: 'Review usage and set spend caps',
      estimatedSavings: Math.round(monthlySpend * 0.2),
      reason: `API spend of $${monthlySpend}/mo is growing. Setting usage limits and batching requests typically cuts costs 15–25% without affecting output quality.`,
      severity: 'review',
    };
  }

  return {
    toolId: id,
    toolName,
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `API spend of $${monthlySpend}/mo is within a reasonable range. Keep monitoring monthly.`,
    severity: 'optimal',
  };
}

function auditGemini(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  // Check billing anomaly first
  const anomaly = getBillingAnomaly('gemini', 'Gemini', plan, monthlySpend, seats);
  if (anomaly) return anomaly;

  // Ultra is massively expensive vs Pro
  if (plan === 'ultra') {
    const savings = Math.round((249.99 - 19.99) * seats);
    return {
      toolId: 'gemini',
      toolName: 'Gemini',
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Gemini Pro',
      suggestedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Gemini Ultra ($249.99/mo) vs Pro ($19.99/mo) — Ultra adds Google One storage perks and top-tier model access. For most business tasks, Pro's model is sufficient at 92% less cost. Save $${savings}/mo.`,
      severity: 'overspending',
    };
  }

  return {
    toolId: 'gemini',
    toolName: 'Gemini',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Gemini Pro ($19.99/mo) is one of the most cost-effective AI plans available. No savings opportunity here.`,
    severity: 'optimal',
  };
}

function auditWindsurf(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  // Check billing anomaly first
  const anomaly = getBillingAnomaly('windsurf', 'Windsurf', plan, monthlySpend, seats);
  if (anomaly) return anomaly;

  // Teams overkill for small teams
  if (plan === 'teams' && seats <= 2) {
    const savings = (35 - 15) * seats;
    return {
      toolId: 'windsurf',
      toolName: 'Windsurf',
      currentSpend: monthlySpend,
      recommendedAction: 'Switch to individual Pro plans',
      suggestedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Windsurf Teams ($35/seat) adds centralized billing and admin — only useful at 3+ seats. With ${seats} seat(s), individual Pro ($15/seat) has identical AI coding features. Save $${savings}/mo.`,
      severity: 'overspending',
    };
  }

  // Also compare with Cursor Pro if on Windsurf Pro
  if (plan === 'pro') {
    return {
      toolId: 'windsurf',
      toolName: 'Windsurf',
      currentSpend: monthlySpend,
      recommendedAction: 'No action needed',
      estimatedSavings: 0,
      reason: `Windsurf Pro ($15/seat) is one of the most affordable AI coding editors. Correctly priced for your team.`,
      severity: 'optimal',
    };
  }

  return {
    toolId: 'windsurf',
    toolName: 'Windsurf',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Plan is well-matched to your team size.`,
    severity: 'optimal',
  };
}

export function runAudit(tools: ToolInput[]): AuditSummary {
  const results: AuditResult[] = tools.map(tool => {
    switch (tool.id) {
      case 'cursor':         return auditCursor(tool);
      case 'github_copilot': return auditGithubCopilot(tool);
      case 'claude':         return auditClaude(tool);
      case 'chatgpt':        return auditChatGPT(tool);
      case 'anthropic_api':  return auditAPITool(tool, 'Anthropic API Direct');
      case 'openai_api':     return auditAPITool(tool, 'OpenAI API Direct');
      case 'gemini':         return auditGemini(tool);
      case 'windsurf':       return auditWindsurf(tool);
      default: return {
        toolId: tool.id,
        toolName: TOOL_NAMES[tool.id] || tool.id,
        currentSpend: tool.monthlySpend,
        recommendedAction: 'No action needed',
        estimatedSavings: 0,
        reason: 'No audit rules available for this tool.',
        severity: 'optimal' as const,
      };
    }
  });

  const totalMonthlySavings = results.reduce((sum, r) => sum + r.estimatedSavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal: totalMonthlySavings === 0,
    showCredex: totalMonthlySavings > 500,
  };
}