## Automated Tests

File: `src/lib/auditEngine.test.ts`

### How to run
npm test

### Test coverage

| Test | What it covers |
|------|---------------|
| GitHub Copilot billing anomaly | Flags when actual spend > expected price per seat |
| Cursor Business overkill | Flags Business plan for teams of 3 or less |
| ChatGPT Team solo user | Flags Team plan when seats = 1 |
| Claude Max review | Flags Max plan for cost review |
| GitHub Copilot optimal | Returns optimal when correctly priced |
| Total savings calculation | Verifies totalMonthlySavings sums correctly |
| showCredex threshold | Returns true when savings > $500 |
| Windsurf Teams small team | Flags Teams plan for 2 seats or less |

All 8 tests pass locally. CI pipeline runs these on every push to main.