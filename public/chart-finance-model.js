import { scopedCents, proratedMonthlyCosts } from './company-costs.js';
import { daysInMonth, demoProfitToDate } from './profit-accrual.js';
// Synthetic receipts are settled on the same day; goods/ads paid on that day.
// Cashflow is a movement from zero, never a claimed connected bank balance.
export function financeChart(costs, period, day, scope, weeklyFinance) {
  const days = daysInMonth(period);
  if (!days || day < 1 || day > days) throw new Error('Neplatné období grafu.');
  if (!demoProfitToDate(period, day, scope)) return null;
  const rows = costs.map(c => ({ ...c, cents: scopedCents(c, scope) }));
  const current = rows.filter(c => c.period === period);
  const monthly = current.filter(c => c.repeat === 'monthly').reduce((n, c) => n + c.cents, 0);
  const other = current.filter(c => c.repeat !== 'monthly').reduce((n, c) => n + c.cents, 0);
  const profit = [], cash = [], receipts = [], expenses = [];
  let income = 0, outgo = 0, previousProfit = 0;
  for (let d = 1; d <= days; d++) {
    const date = `${period}-${String(d).padStart(2, '0')}`;
    const before = demoProfitToDate(period, d, scope).afterAds;
    const receipt = weeklyFinance.dailyRevenue[(d - 1) % 7] * 200;
    const tradingCosts = receipt - (before - previousProfit);
    const payments = rows.filter(c => (c.status === 'paid' ? c.paidOn : c.due) === date).reduce((n, c) => n + c.cents, 0);
    income += receipt;
    outgo += tradingCosts + payments;
    previousProfit = before;
    if (d <= day) profit.push(before - proratedMonthlyCosts(costs, period, d, days, scope) - other);
    cash.push(income - outgo);
    receipts.push(income);
    expenses.push(outgo);
  }
  const asOf = `${period}-${String(day).padStart(2, '0')}`;
  const overdue = rows.filter(c => c.status !== 'paid' && c.due < asOf).reduce((n,c)=>n+c.cents,0);
  const later = current.filter(c => c.status !== 'paid' && c.due.slice(0,7) > period).reduce((n,c)=>n+c.cents,0);
  return { profit, cash, receipts, expenses, monthly, days, later, overdue };
}
