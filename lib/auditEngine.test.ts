import { runAudit } from './auditEngine';

// Test 1: GitHub Copilot billing anomaly detection
test('GitHub Copilot: flags overpayment vs expected price', () => {
  const result = runAudit([{
    id: 'github_copilot',
    plan: 'individual',
    monthlySpend: 200,
    seats: 3,
  }]);
  expect(result.results[0].severity).toBe('overspending');
  expect(result.results[0].estimatedSavings).toBeGreaterThan(0);
});

// Test 2: Cursor Business overkill for small team
test('Cursor: Business plan flagged for teams of 3 or less', () => {
  const result = runAudit([{
    id: 'cursor',
    plan: 'business',
    monthlySpend: 120,
    seats: 3,
  }]);
  expect(result.results[0].severity).toBe('overspending');
  expect(result.results[0].suggestedPlan).toBe('Pro');
});

// Test 3: ChatGPT Team for solo user
test('ChatGPT: Team plan flagged for 1 seat', () => {
  const result = runAudit([{
    id: 'chatgpt',
    plan: 'team',
    monthlySpend: 30,
    seats: 1,
  }]);
  expect(result.results[0].severity).toBe('overspending');
  expect(result.results[0].estimatedSavings).toBe(10);
});

// Test 4: Claude Max flagged for review
test('Claude: Max plan flagged for review', () => {
  const result = runAudit([{
    id: 'claude',
    plan: 'max',
    monthlySpend: 100,
    seats: 1,
  }]);
  expect(result.results[0].severity).toBe('review');
  expect(result.results[0].estimatedSavings).toBe(80);
});

// Test 5: Optimal spend returns no savings
test('GitHub Copilot: correctly priced returns optimal', () => {
  const result = runAudit([{
    id: 'github_copilot',
    plan: 'individual',
    monthlySpend: 10,
    seats: 1,
  }]);
  expect(result.results[0].severity).toBe('optimal');
  expect(result.results[0].estimatedSavings).toBe(0);
});

// Test 6: Total savings calculation
test('runAudit: totalMonthlySavings sums correctly', () => {
  const result = runAudit([
    { id: 'chatgpt', plan: 'team', monthlySpend: 30, seats: 1 },
    { id: 'github_copilot', plan: 'individual', monthlySpend: 10, seats: 1 },
  ]);
  expect(result.totalMonthlySavings).toBe(10);
  expect(result.totalAnnualSavings).toBe(120);
});

// Test 7: showCredex true when savings > 500
test('runAudit: showCredex true when savings exceed $500', () => {
  const result = runAudit([{
    id: 'gemini',
    plan: 'ultra',
    monthlySpend: 249.99,
    seats: 3,
  }]);
  expect(result.showCredex).toBe(true);
});

// Test 8: Windsurf Teams flagged for small team
test('Windsurf: Teams plan flagged for 2 seats or less', () => {
  const result = runAudit([{
    id: 'windsurf',
    plan: 'teams',
    monthlySpend: 70,
    seats: 2,
  }]);
  expect(result.results[0].severity).toBe('overspending');
  expect(result.results[0].suggestedPlan).toBe('Pro');
});