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

// Current pricing as of May 2026
// Sources tracked in PRICING_DATA.md
const PRICING = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    enterprise: null, // custom
  },
  github_copilot: {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 30, // per seat
    enterprise: null,
    'api direct': null, // usage based
  },
  chatgpt: {
    plus: 20,
    team: 30, // per seat
    enterprise: null,
    'api direct': null,
  },
  gemini: {
    pro: 19.99,
    ultra: 249.99, // Google One AI Premium
    api: null,
  },
  windsurf: {
    free: 0,
    pro: 15,
    teams: 35,
  },
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

function auditCursor(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;
  const expectedCost = plan === 'pro' ? 20 * seats : plan === 'business' ? 40 * seats : 0;

  if (plan === 'business' && seats <= 3) {
    const savings = (40 - 20) * seats;
    return {
      toolId: 'cursor',
      toolName: 'Cursor',
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Pro plan',
      suggestedPlan: 'Pro',
      estimatedSavings: savings,
      reason: `Business plan ($40/seat) is designed for teams needing SSO and admin controls. With ${seats} seat(s), Pro ($20/seat) covers all core features at half the cost.`,
      severity: 'overspending',
    };
  }

  if (monthlySpend > expectedCost * 1.1 && expectedCost > 0) {
    return {
      toolId: 'cursor',
      toolName: 'Cursor',
      currentSpend: monthlySpend,
      recommendedAction: 'Verify your billing — you may be on a legacy plan',
      estimatedSavings: monthlySpend - expectedCost,
      reason: `Expected cost for ${seats} seat(s) on ${plan} is $${expectedCost}/mo. You're paying $${monthlySpend}/mo.`,
      severity: 'review',
    };
  }

  return {
    toolId: 'cursor',
    toolName: 'Cursor',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `You're on the right plan for your team size.`,
    severity: 'optimal',
  };
}

function auditGithubCopilot(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  if (plan === 'enterprise' && seats <= 5) {
    const savings = (39 - 19) * seats;
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Business plan',
      suggestedPlan: 'Business',
      estimatedSavings: savings,
      reason: `Enterprise ($39/seat) adds audit logs and SAML SSO. With only ${seats} seat(s), Business ($19/seat) covers all coding features you need.`,
      severity: 'overspending',
    };
  }

  if (plan === 'business' && seats === 1) {
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      currentSpend: monthlySpend,
      recommendedAction: 'Switch to Individual plan',
      suggestedPlan: 'Individual',
      estimatedSavings: 9,
      reason: `Individual plan ($10/mo) has identical coding features for solo developers. Business plan is only worth it for team management features.`,
      severity: 'overspending',
    };
  }

  return {
    toolId: 'github_copilot',
    toolName: 'GitHub Copilot',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Plan matches your team size well.`,
    severity: 'optimal',
  };
}

function auditClaude(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  if (plan === 'max' && seats >= 1) {
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentSpend: monthlySpend,
      recommendedAction: 'Evaluate if Max usage limits are necessary',
      suggestedPlan: 'Pro',
      estimatedSavings: (100 - 20) * seats,
      reason: `Claude Max ($100/seat) gives 5x more usage than Pro. Unless you're hitting Pro limits daily, Pro ($20/seat) saves $80/seat/month.`,
      severity: 'review',
    };
  }

  if (plan === 'team' && seats <= 2) {
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentSpend: monthlySpend,
      recommendedAction: 'Switch to Pro (individual)',
      suggestedPlan: 'Pro',
      estimatedSavings: (30 - 20) * seats,
      reason: `Team plan ($30/seat, 5-seat minimum billing) is designed for collaboration features. With ${seats} user(s), individual Pro ($20/seat) is more cost-effective.`,
      severity: 'overspending',
    };
  }

  return {
    toolId: 'claude',
    toolName: 'Claude',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Your Claude plan is appropriate for your usage.`,
    severity: 'optimal',
  };
}

function auditChatGPT(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  if (plan === 'team' && seats === 1) {
    return {
      toolId: 'chatgpt',
      toolName: 'ChatGPT',
      currentSpend: monthlySpend,
      recommendedAction: 'Downgrade to Plus',
      suggestedPlan: 'Plus',
      estimatedSavings: 10,
      reason: `ChatGPT Team ($30/seat) adds shared workspaces and admin controls. Solo users get identical AI access with Plus ($20/mo).`,
      severity: 'overspending',
    };
  }

  return {
    toolId: 'chatgpt',
    toolName: 'ChatGPT',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Plan is appropriate for your team size.`,
    severity: 'optimal',
  };
}

function auditAPITool(input: ToolInput, toolName: string): AuditResult {
  const { monthlySpend } = input;

  if (monthlySpend > 200) {
    return {
      toolId: input.id,
      toolName,
      currentSpend: monthlySpend,
      recommendedAction: 'Review usage and set spend caps',
      estimatedSavings: Math.round(monthlySpend * 0.2),
      reason: `API spend of $${monthlySpend}/mo is significant. Setting usage limits, caching responses, and batching requests typically cuts costs 15–25%.`,
      severity: 'review',
    };
  }

  return {
    toolId: input.id,
    toolName,
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `API spend looks reasonable. Keep monitoring.`,
    severity: 'optimal',
  };
}

function auditGemini(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  if (plan === 'ultra') {
    return {
      toolId: 'gemini',
      toolName: 'Gemini',
      currentSpend: monthlySpend,
      recommendedAction: 'Evaluate if Ultra is necessary vs Pro',
      suggestedPlan: 'Pro',
      estimatedSavings: 230 * seats,
      reason: `Gemini Ultra ($249.99/mo) vs Pro ($19.99/mo) — unless you need Google One storage and ultra-tier model access, Pro handles most tasks at 92% less cost.`,
      severity: 'overspending',
    };
  }

  return {
    toolId: 'gemini',
    toolName: 'Gemini',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Gemini plan looks appropriate.`,
    severity: 'optimal',
  };
}

function auditWindsurf(input: ToolInput): AuditResult {
  const { plan, monthlySpend, seats } = input;

  if (plan === 'teams' && seats <= 2) {
    return {
      toolId: 'windsurf',
      toolName: 'Windsurf',
      currentSpend: monthlySpend,
      recommendedAction: 'Switch to Pro (individual)',
      suggestedPlan: 'Pro',
      estimatedSavings: (35 - 15) * seats,
      reason: `Windsurf Teams ($35/seat) is built for shared billing and admin. With ${seats} seat(s), individual Pro ($15/seat) has identical AI features.`,
      severity: 'overspending',
    };
  }

  return {
    toolId: 'windsurf',
    toolName: 'Windsurf',
    currentSpend: monthlySpend,
    recommendedAction: 'No action needed',
    estimatedSavings: 0,
    reason: `Plan is well-matched to your team.`,
    severity: 'optimal',
  };
}

export function runAudit(tools: ToolInput[]): AuditSummary {
  const results: AuditResult[] = tools.map(tool => {
    switch (tool.id) {
      case 'cursor': return auditCursor(tool);
      case 'github_copilot': return auditGithubCopilot(tool);
      case 'claude': return auditClaude(tool);
      case 'chatgpt': return auditChatGPT(tool);
      case 'anthropic_api': return auditAPITool(tool, 'Anthropic API Direct');
      case 'openai_api': return auditAPITool(tool, 'OpenAI API Direct');
      case 'gemini': return auditGemini(tool);
      case 'windsurf': return auditWindsurf(tool);
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