import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = async name => import(`data:text/javascript;base64,${readFileSync(new URL(`../public/${name}`, import.meta.url)).toString('base64')}`);
const { daysInMonth, accrueMonthly, accruedSummary, demoProfitToDate, paymentSchedule } = await load('profit-accrual.js');
const { exampleCosts, scopedCents, monthlySummary } = await load('company-costs.js');
test('30,000 CZK becomes 15,000 CZK on day 15 of a 30-day month', () => {
  assert.equal(accrueMonthly(3000000, 15, 30), 1500000);
  assert.equal(accrueMonthly(3000000, 30, 30), 3000000);
});
test('uses calendar month length, including leap February; preserves cents at month end', () => {
  assert.equal(daysInMonth('2026-09'), 30);
  assert.equal(daysInMonth('2026-10'), 31);
  assert.equal(daysInMonth('2028-02'), 29);
  assert.equal(daysInMonth('2026-02'), 28);
  assert.equal(daysInMonth('2026-13'), null);
  assert.equal(accrueMonthly(3000001, 31, 31), 3000001);
  assert.equal(accrueMonthly(3000000, 15, 31), 1451613);
  assert.throws(() => accrueMonthly(3000000, 0, 30));
  assert.throws(() => accrueMonthly(3000000, 31, 30));
});
test('remaining accrual and outstanding payments are distinct', () => {
  const sum = accruedSummary(exampleCosts, '2026-09', 15);
  assert.equal(sum.accrued, 4300000);
  assert.equal(sum.remaining, 4300000);
  assert.equal(sum.expected, 6800000);
  assert.equal(sum.overdue, 0);
  assert.equal(demoProfitToDate('2026-09', 15, 'all').afterAds - sum.deducted, 3800000);
});
test('settlement removes expected payment without changing daily cost accrual', () => {
  const settled = exampleCosts.map(c => c.id === 1 ? { ...c, status: 'paid' } : c);
  const sum = accruedSummary(settled, '2026-09', 15);
  assert.equal(sum.expected, 2000000);
  assert.equal(sum.accrued, 4300000);
});
test('due today is expected, earlier due dates are separate, next-month due dates remain expected', () => {
  assert.equal(accruedSummary(exampleCosts, '2026-09', 20).expected, 6800000);
  const sum = accruedSummary(exampleCosts, '2026-09', 21);
  assert.equal(sum.expected, 4800000);
  assert.equal(sum.overdue, 2000000);
});
test('end of month matches the existing full-month example for every shop scope', () => {
  for (const scope of ['all', 'store', 'outlet']) {
    const costs = exampleCosts.map(c => ({ ...c, cents: scopedCents(c, scope) }));
    const accrued = accruedSummary(costs, '2026-09', 30);
    const profit = demoProfitToDate('2026-09', 30, scope);
    assert.equal(profit.afterAds - accrued.deducted, monthlySummary(exampleCosts, '2026-09', scope).after);
    assert.equal(accrued.remaining, 0);
  }
});
test('non-monthly costs stay whole; another cost month is excluded; missing profit stays unknown', () => {
  const sum = accruedSummary([{ ...exampleCosts[0], repeat: 'none', cents: 3000000 }, { ...exampleCosts[1], period: '2026-10' }], '2026-09', 15);
  assert.equal(sum.accrued, 0);
  assert.equal(sum.other, 3000000);
  assert.equal(sum.deducted, 3000000);
  assert.equal(demoProfitToDate('2026-10', 15, 'all'), null);
});

test('payment schedule shows a paid subtotal, outstanding subtotal and overdue subset', () => {
  const schedule = paymentSchedule(exampleCosts, '2026-09', '2026-09-15');
  assert.equal(schedule.paid, 1800000);
  assert.equal(schedule.pending, 6800000);
  assert.equal(schedule.overdue, 0);
  assert.equal(schedule.next.title, 'Nájem kanceláře');
  assert.deepEqual(schedule.items.map(row => row.id), [3, 2, 4, 1]);
  const later = paymentSchedule(exampleCosts, '2026-09', '2026-09-21');
  assert.equal(later.pending, 6800000);
  assert.equal(later.overdue, 2000000);
  assert.equal(later.next.id, 1);
});
test('payments are marked paid only on or after their recorded payment date', () => {
  assert.equal(paymentSchedule(exampleCosts, '2026-09', '2026-09-01').paid, 0);
  assert.equal(paymentSchedule(exampleCosts, '2026-09', '2026-09-05').paid, 600000);
  assert.equal(paymentSchedule(exampleCosts, '2026-09', '2026-09-08').paid, 1800000);
});
test('payment table excludes unrelated months and zero allocations', () => {
  const scopeRows = exampleCosts.map(c => ({ ...c, cents: scopedCents(c, 'store') }));
  const schedule = paymentSchedule(scopeRows, '2026-09', '2026-09-15');
  assert.equal(schedule.items.length, 3);
  assert.equal(schedule.paid, 1500000);
  assert.equal(schedule.pending, 1000000);
  assert.equal(schedule.next.id, 4);
  assert.deepEqual(paymentSchedule(scopeRows, '2026-10', '2026-10-15').items, []);
});
