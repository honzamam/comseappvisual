// Pure calculations for the local monthly profit mock. Integer amounts are cents.
export function daysInMonth(period) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return null;
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
export function accrueMonthly(cents, day, days) {
  if (!Number.isSafeInteger(cents) || cents < 0 || !Number.isInteger(day) || !Number.isInteger(days) || day < 1 || day > days) throw new Error('Neplatné období nebo částka.');
  return Math.round(cents * day / days);
}
export function accruedSummary(rows, period, day) {
  const days = daysInMonth(period);
  if (!days || !Number.isInteger(day) || day < 1 || day > days) throw new Error('Vyberte platný den v měsíci.');
  const result = { monthly: 0, accrued: 0, other: 0, expected: 0, overdue: 0, days };
  const asOf = `${period}-${String(day).padStart(2, '0')}`;
  for (const row of rows.filter(row => row.period === period)) {
    if (row.repeat === 'monthly') result.monthly += row.cents;
    else result.other += row.cents;
    if (row.status !== 'paid') result[row.due < asOf ? 'overdue' : 'expected'] += row.cents;
  }
  result.accrued = accrueMonthly(result.monthly, day, days);
  result.remaining = result.monthly - result.accrued;
  result.deducted = result.accrued + result.other;
  return result;
}
// Synthetic daily snapshots, not a projection of actual revenue. The complete
// September series reconciles with the existing monthly examples (95k + 72k).
export function demoProfitToDate(period, day, scope) {
  if (period !== '2026-09' || !['all', 'store', 'outlet'].includes(scope)) return null;
  const shops = scope === 'all' ? ['store', 'outlet'] : [scope];
  let gross = 0, afterAds = 0;
  for (const shop of shops) {
    const daily = shop === 'store' ? 310000 : 230000;
    const last = shop === 'store' ? 510000 : 530000;
    for (let n = 1; n <= day; n++) {
      gross += shop === 'store' ? 450000 : 300000;
      afterAds += n === 30 ? last : daily;
    }
  }
  return { gross, afterAds };
}

// A schedule of costs belonging to the selected month, not a bank cash balance.
export function paymentSchedule(rows, period, asOf) {
  const items = rows.filter(row => row.period === period && row.cents > 0).map(row => {
    const paid = row.status === 'paid' && Boolean(row.paidOn) && row.paidOn <= asOf;
    return { ...row, paymentState: paid ? 'paid' : row.due < asOf ? 'overdue' : 'pending' };
  }).sort((a, b) => a.due.localeCompare(b.due) || a.id - b.id);
  const sum = { paid: 0, pending: 0, overdue: 0 };
  for (const row of items) {
    if (row.paymentState === 'paid') sum.paid += row.cents;
    else {
      sum.pending += row.cents;
      if (row.paymentState === 'overdue') sum.overdue += row.cents;
    }
  }
  const next = items.find(row => row.paymentState === 'pending') || null;
  return { items, ...sum, next };
}
