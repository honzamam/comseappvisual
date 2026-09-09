import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Load the actual browser ES module without changing the project's package type.
const source = readFileSync(new URL('../public/company-costs.js', import.meta.url));
const { allocate, scopedCents, totals, exampleCosts, monthlySummary, paymentGroup } = await import(`data:text/javascript;base64,${source.toString('base64')}`);

test('employee working only for shop 2 leaves shop 1 unchanged', () => {
  const employee = exampleCosts[0];
  assert.equal(scopedCents(employee, 'store'), 0);
  assert.equal(scopedCents(employee, 'outlet'), 4800000);
  assert.equal(totals(exampleCosts, '2026-09', 'store').total, totals(exampleCosts.slice(1), '2026-09', 'store').total);
});
test('company includes every expense once, including unallocated overhead', () => {
  assert.equal(totals(exampleCosts, '2026-09').total, 8600000);
  assert.equal(totals(exampleCosts, '2026-09', 'store').total, 2500000);
  assert.equal(totals(exampleCosts, '2026-09', 'outlet').total, 6100000);
  const overhead = exampleCosts.filter(c => c.allocation === 'company').reduce((sum, c) => sum + c.cents, 0);
  assert.equal(8600000, 2500000 + 6100000 + overhead);
});
test('split conserves every cent for uneven amounts and all allowed ratios', () => {
  for (const cents of [1, 3, 101, 19999, 10000000000]) {
    for (let share = 1; share <= 99; share++) {
      const parts = allocate({ cents, allocation: 'split', share });
      assert.equal(parts.store + parts.outlet + parts.company, cents);
      assert.ok(Number.isInteger(parts.store) && Number.isInteger(parts.outlet));
    }
  }
});
test('cost period determines financial result, independently of payment date', () => {
  const employee = { ...exampleCosts[0], status: 'paid', paidOn: '2026-10-15' };
  assert.deepEqual(totals([employee], '2026-09', 'outlet'), { total: 4800000, paid: 4800000, pending: 0 });
  assert.deepEqual(totals([employee], '2026-10', 'outlet'), { total: 0, paid: 0, pending: 0 });
  assert.equal(totals(exampleCosts, '2026-09').total, totals(exampleCosts, '2026-09').paid + totals(exampleCosts, '2026-09').pending);
});
test('unpaid costs still reduce financial result, with split payment status', () => {
  assert.deepEqual(totals(exampleCosts, '2026-09', 'outlet'), { total: 6100000, paid: 300000, pending: 5800000 });
});
test('invalid allocation or amount fails instead of silently dropping expenses', () => {
  for (const share of [NaN, -10, 0, 100, 50.5]) assert.throws(() => allocate({ cents: 100, allocation: 'split', share }));
  for (const cents of [0, -1, NaN, Infinity, 1.5]) assert.throws(() => allocate({ cents, allocation: 'company' }));
  assert.throws(() => allocate({ cents: 100, allocation: 'unknown' }));
  assert.throws(() => scopedCents(exampleCosts[0], 'unknown'));
});
test('recurrence is descriptive and never multiplies a cost into later periods', () => {
  const cost = { ...exampleCosts[0], repeat: 'yearly' };
  assert.equal(totals([cost], '2026-09').total, cost.cents);
  assert.equal(totals([cost], '2027-09').total, 0);
});

test('monthly profit deducts all four payment groups exactly once', () => {
  const sum = monthlySummary(exampleCosts, '2026-09');
  assert.equal(sum.before, 16700000);
  assert.equal(sum.after, 8100000);
  assert.deepEqual(sum.payments, { paid: 1800000, current: 2000000, later: 4800000, earlier: 0 });
  assert.equal(Object.values(sum.payments).reduce((a, b) => a + b, 0), sum.total);
  assert.equal(sum.payments.current + sum.payments.later + sum.payments.earlier, sum.pending);
});
test('payment timing changes the payment group, never monthly profit', () => {
  const changed = exampleCosts.map(c => c.id === 1 ? { ...c, status: 'paid', paidOn: '2026-10-15' } : c);
  assert.equal(monthlySummary(changed, '2026-09').after, monthlySummary(exampleCosts, '2026-09').after);
  assert.equal(monthlySummary(changed, '2026-09').payments.paid, 6600000);
  for (const [due, expected] of [['2026-08-31', 'earlier'], ['2026-09-01', 'current'], ['2026-09-30', 'current'], ['2026-10-01', 'later'], ['2027-01-01', 'later']]) {
    assert.equal(paymentGroup({ ...exampleCosts[0], due }, '2026-09'), expected);
  }
});
test('monthly summary respects shop allocation and excludes another cost month', () => {
  assert.equal(monthlySummary(exampleCosts, '2026-09', 'store').after, 7000000);
  assert.equal(monthlySummary(exampleCosts, '2026-09', 'outlet').after, 1100000);
  assert.equal(monthlySummary(exampleCosts, '2026-09', 'store').payments.later, 0);
  const nextMonth = { ...exampleCosts[0], period: '2026-10' };
  assert.equal(monthlySummary([...exampleCosts, nextMonth], '2026-09').total, 8600000);
  const missing = monthlySummary([nextMonth], '2026-10');
  assert.equal(missing.after, null);
  assert.equal(missing.total, 4800000);
});
test('loss remains negative instead of disappearing from profit summary', () => {
  const highCost = { ...exampleCosts[0], cents: 20000000 };
  assert.equal(monthlySummary([highCost], '2026-09').after, -3300000);
});
