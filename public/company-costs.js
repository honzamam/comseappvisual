// Local prototype. Demo costs are shared in this browser tab; no remote requests.
export const categories = { people: 'Lidé a externisté', software: 'Software a nástroje', premises: 'Nájem a provoz', logistics: 'Logistika', services: 'Agentury a služby', other: 'Ostatní' };
const scopes = { all: 'Celá firma Alfa', store: 'E-shop 1', outlet: 'E-shop 2' };
const repeats = { none: 'Jednorázově', monthly: 'Měsíčně', yearly: 'Ročně' };
export const exampleCosts = [
  { id: 1, title: 'Zaměstnanec X', category: 'people', cents: 4800000, allocation: 'outlet', share: 50, period: '2026-09', due: '2026-10-15', paidOn: '', status: 'pending', repeat: 'monthly', note: 'Celkový náklad firmy. Pracuje výhradně pro E-shop 2.' },
  { id: 2, title: 'Expedice a balení', category: 'logistics', cents: 1200000, allocation: 'store', share: 50, period: '2026-09', due: '2026-09-08', paidOn: '2026-09-08', status: 'paid', repeat: 'monthly', note: 'Skladové služby pouze pro E-shop 1.' },
  { id: 3, title: 'Týmový software', category: 'software', cents: 600000, allocation: 'split', share: 50, period: '2026-09', due: '2026-09-05', paidOn: '2026-09-05', status: 'paid', repeat: 'monthly', note: 'Oba e-shopy používají nástroje stejným dílem.' },
  { id: 4, title: 'Nájem kanceláře', category: 'premises', cents: 2000000, allocation: 'split', share: 50, period: '2026-09', due: '2026-09-20', paidOn: '', status: 'pending', repeat: 'monthly', note: 'Společná kancelář: 50 % E-shop 1, 50 % E-shop 2.' }
];
const COST_STORE_KEY = 'comse.visual.costs.v1';
let costMemory;
export function readDemoCosts() {
  try {
    const raw = sessionStorage.getItem(COST_STORE_KEY);
    if (raw !== null) {
      const rows = JSON.parse(raw);
      if (!Array.isArray(rows) || rows.length > 5000) throw new Error('Invalid cost storage');
      const ids = new Set();
      for (const row of rows) {
        allocate(row);
        if (!Number.isSafeInteger(row.id) || ids.has(row.id) || !Object.hasOwn(categories, row.category) || !['paid', 'pending'].includes(row.status) || !['none', 'monthly', 'yearly'].includes(row.repeat) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period) || !/^\d{4}-\d{2}-\d{2}$/.test(row.due) || typeof row.title !== 'string' || typeof row.note !== 'string' || typeof row.paidOn !== 'string' || (row.status === 'paid' && !/^\d{4}-\d{2}-\d{2}$/.test(row.paidOn))) throw new Error('Invalid cost row');
        ids.add(row.id);
      }
      costMemory = rows;
    }
  } catch { /* Keep local fallback if storage is unavailable or malformed. */ }
  return (costMemory || exampleCosts).map(row => ({ ...row }));
}
export function saveDemoCosts(rows) {
  costMemory = rows.map(row => ({ ...row }));
  let stored = true;
  try { sessionStorage.setItem(COST_STORE_KEY, JSON.stringify(costMemory)); } catch { stored = false; }
  if (typeof document !== 'undefined') document.dispatchEvent(new Event('comse:costs'));
  return stored;
}
export function allocate(cost) {
  if (!Number.isSafeInteger(cost.cents) || cost.cents <= 0) throw new Error('Částka musí být kladná.');
  const result = { store: 0, outlet: 0, company: 0 };
  if (cost.allocation === 'split') {
    if (!Number.isInteger(cost.share) || cost.share < 1 || cost.share > 99) throw new Error('Podíl musí být celé číslo od 1 do 99 %.');
    result.store = Math.round(cost.cents * cost.share / 100);
    result.outlet = cost.cents - result.store;
  } else if (Object.hasOwn(result, cost.allocation)) result[cost.allocation] = cost.cents;
  else throw new Error('Vyberte platné přiřazení nákladu.');
  return result;
}
export function scopedCents(cost, scope) {
  const shares = allocate(cost);
  if (scope === 'all') return cost.cents;
  if (!Object.hasOwn(scopes, scope)) throw new Error('Neplatný rozsah.');
  return shares[scope];
}
export function totals(costs, period, scope = 'all') {
  return costs.filter(c => c.period === period).reduce((sum, c) => {
    const amount = scopedCents(c, scope);
    sum.total += amount;
    sum[c.status === 'paid' ? 'paid' : 'pending'] += amount;
    return sum;
  }, { total: 0, paid: 0, pending: 0 });
}
// Allocate rounding residuals once so the company is exactly the sum of shops
// and any unallocated overhead, even on intermediate days.
export function proratedMonthlyCosts(costs, period, day, days, scope = 'all') {
  const buckets = { store: 0, outlet: 0, company: 0 };
  for (const cost of costs.filter(c => c.period === period && c.repeat === 'monthly')) {
    const parts = allocate(cost);
    for (const key of Object.keys(buckets)) buckets[key] += parts[key];
  }
  const total = Math.round(Object.values(buckets).reduce((a,b)=>a+b,0) * day / days);
  const parts = Object.entries(buckets).map(([key,cents]) => ({ key, value: Math.floor(cents*day/days), fraction: cents*day/days % 1 }));
  let remainder = total - parts.reduce((n,p)=>n+p.value,0);
  parts.sort((a,b)=>b.fraction-a.fraction);
  for (const part of parts) if (remainder-- > 0) part.value += 1;
  return scope === 'all' ? total : parts.find(p=>p.key===scope).value;
}
export function paymentGroup(cost, period) {
  if (cost.status === 'paid') return 'paid';
  const dueMonth = cost.due.slice(0, 7);
  if (dueMonth < period) return 'earlier';
  return dueMonth === period ? 'current' : 'later';
}
export function monthlySummary(costs, period, scope = 'all') {
  const sum = totals(costs, period, scope);
  const payments = { paid: 0, current: 0, later: 0, earlier: 0 };
  for (const cost of costs.filter(c => c.period === period)) {
    payments[paymentGroup(cost, period)] += scopedCents(cost, scope);
  }
  const before = period === '2026-09' ? { store: 9500000, outlet: 7200000, all: 16700000 }[scope] : null;
  return { ...sum, payments, before, after: before == null ? null : before - sum.total };
}
export function renderMonthlySummary(costs, period, scope) {
  const root = document.getElementById('monthly-profit');
  if (!root) return;
  const sum = monthlySummary(costs, period, scope);
  const set = (id, value) => { document.getElementById(id).textContent = value; };
  const result = sum.after == null ? 'Chybí výchozí výsledek' : money(sum.after);
  set('monthly-profit', result);
  set('monthly-after', result);
  set('monthly-profit-label', sum.after != null && sum.after < 0 ? 'Celková ztráta po měsíčních nákladech' : 'Celkový zisk po měsíčních nákladech');
  root.closest('.monthly-result').classList.toggle('is-loss', sum.after != null && sum.after < 0);
  const month = /^\d{4}-\d{2}$/.test(period) ? new Intl.DateTimeFormat('cs-CZ', { month: 'long', year: 'numeric' }).format(new Date(`${period}-01T12:00:00`)) : 'Vyberte měsíc';
  set('monthly-scope', `${scopes[scope]} · ${month}${scope === 'all' ? ' · včetně režie firmy' : ' · bez nerozdělené režie firmy'}`);
  set('monthly-before', sum.before == null ? 'Není k dispozici' : money(sum.before));
  set('monthly-costs', money(sum.total));
  set('monthly-pending', money(sum.pending));
  for (const [key, value] of Object.entries(sum.payments)) set(`monthly-${key}`, money(value));
}
const money = cents => new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
const date = value => value ? value.split('-').reverse().join('. ') : '—';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function initCosts() {
  const $ = id => document.getElementById(id);
  if (!$('cost-form')) return;
  let costs = readDemoCosts();
  let nextId = Math.max(0, ...costs.map(c => c.id)) + 1;
  const form = $('cost-form');
  const options = Object.entries(categories).map(([key, name]) => `<option value="${key}">${name}</option>`).join('');
  $('cost-category').innerHTML = options;
  $('cost-type-filter').insertAdjacentHTML('beforeend', options);
  function assignment(c) {
    if (c.allocation === 'company') return 'Firma Alfa · nerozdělená režie';
    if (c.allocation === 'split') return `E-shop 1: ${c.share} % / E-shop 2: ${100 - c.share} %`;
    return `${scopes[c.allocation]} · 100 %`;
  }
  function render() {
    const scope = Object.hasOwn(scopes, $('eshop-select').value) ? $('eshop-select').value : 'all';
    const period = $('cost-period').value;
    renderMonthlySummary(costs, period, scope);
    const periodCosts = costs.filter(c => c.period === period);
    const impactScopes = scope === 'all' ? ['store', 'outlet', 'all'] : [scope];
    $('cost-impact').innerHTML = impactScopes.map(key => {
      const amount = totals(costs, period, key).total;
      const before = { store: 9500000, outlet: 7200000, all: 16700000 }[key];
      const overhead = periodCosts.filter(c => c.allocation === 'company').reduce((n, c) => n + c.cents, 0);
      return `<article><span>${scopes[key]}</span><strong>${period === '2026-09' ? money(before - amount) : 'Chybí výchozí výsledek'}</strong><p>${period === '2026-09' ? `${money(before)} − ${money(amount)}` : `Náklady: ${money(amount)}. Pro tento měsíc nemáme ukázkový výsledek po reklamě.`}</p><small>${key === 'all' ? `Včetně režie firmy ${money(overhead)}. Každý náklad pouze jednou.` : 'Po přiřazených nákladech, bez nerozdělené režie firmy.'}</small></article>`;
    }).join('');
    $('cost-categories').innerHTML = Object.entries(categories).map(([key, name]) => {
      const amount = periodCosts.filter(c => c.category === key).reduce((n, c) => n + scopedCents(c, scope), 0);
      return `<div><span>${name}</span><strong>${money(amount)}</strong></div>`;
    }).join('');
    const visible = periodCosts.filter(c => scopedCents(c, scope) > 0 && ($('cost-type-filter').value === 'all' || c.category === $('cost-type-filter').value) && ($('cost-payment-filter').value === 'all' || paymentGroup(c, period) === $('cost-payment-filter').value));
    $('cost-empty').hidden = visible.length > 0;
    $('cost-rows').innerHTML = visible.map(c => `<tr>
      <td><strong>${escape(c.title)}</strong><small>${categories[c.category]}</small>${c.note ? `<small>${escape(c.note)}</small>` : ''}</td>
      <td><strong>${money(scopedCents(c, scope))}</strong>${scope !== 'all' && c.allocation === 'split' ? `<small>z celkem ${money(c.cents)}</small>` : ''}</td>
      <td><span class="cost-badge ${c.allocation === 'company' ? 'cost-orange' : ''}">${assignment(c)}</span></td>
      <td><span class="cost-status ${c.status === 'paid' ? 'is-paid' : ''}">${c.status === 'paid' ? 'Zaplaceno' : 'Čeká na platbu'}</span><small>Splatnost: ${date(c.due)}</small><small>Platba: ${date(c.paidOn)}</small></td>
      <td>${repeats[c.repeat]}</td><td><button type="button" class="cost-remove" data-remove="${c.id}" aria-label="Odebrat ${escape(c.title)} z ukázky">Odebrat</button></td>
    </tr>`).join('');
  }
  function syncForm() {
    const split = form.elements.allocation.value === 'split';
    $('cost-split-fields').hidden = !split;
    form.elements.share.disabled = !split;
    form.elements.share.required = split;
    $('cost-share-rest').textContent = `${100 - Number(form.elements.share.value)} %`;
    const paid = form.elements.status.value === 'paid';
    $('cost-paid-field').hidden = !paid;
    form.elements.paidOn.required = paid;
    form.elements.paidOn.disabled = !paid;
  }
  $('add-cost').addEventListener('click', () => {
    form.reset();
    form.elements.period.value = $('cost-period').value || '2026-09';
    form.elements.allocation.value = $('eshop-select').value === 'all' ? 'company' : $('eshop-select').value;
    $('cost-form-error').textContent = '';
    syncForm();
    $('cost-dialog').showModal();
    form.elements.title.focus();
  });
  for (const id of ['close-cost', 'cancel-cost']) $(id).addEventListener('click', () => $('cost-dialog').close());
  for (const id of ['cost-allocation', 'cost-status']) $(id).addEventListener('change', syncForm);
  form.elements.share.addEventListener('input', syncForm);
  for (const id of ['eshop-select', 'cost-period', 'cost-type-filter', 'cost-payment-filter']) $(id).addEventListener('change', render);
  $('cost-rows').addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const removed = costs.find(c => c.id === Number(button.dataset.remove));
    costs = costs.filter(c => c !== removed);
    const stored = saveDemoCosts(costs);
    render();
    $('cost-feedback').textContent = `Náklad „${removed.title}“ odebrán. ${stored ? "Grafy na přehledu se aktualizují při návratu." : "Prohlížeč neumožnil uložení; změna platí jen na této stránce."}`;
    $('add-cost').focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const cost = { id: nextId, title: data.get('title').trim(), category: data.get('category'), cents: Math.round(Number(data.get('amount')) * 100), period: data.get('period'), allocation: data.get('allocation'), share: Number(data.get('share')), status: data.get('status'), due: data.get('due'), paidOn: data.get('paidOn') || '', repeat: data.get('repeat'), note: data.get('note').trim() };
    try {
      if (!cost.title) throw new Error('Vyplňte název nákladu.');
      allocate(cost);
      costs.push(cost);
      const stored = saveDemoCosts(costs);
      nextId += 1;
      $('cost-period').value = cost.period;
      // Always reveal the saved row, including company overhead added from a shop view.
      $('eshop-select').value = 'all';
      $('eshop-select').dispatchEvent(new Event('change'));
      $('cost-type-filter').value = 'all';
      $('cost-payment-filter').value = 'all';
      render();
      $('cost-feedback').textContent = `Náklad „${cost.title}“ přidán. ${stored ? "Promítne se také do grafů zisku a cashflow." : "Prohlížeč neumožnil uložení; změna platí jen na této stránce."}`;
      $('cost-dialog').close();
    } catch (error) { $('cost-form-error').textContent = error.message; }
  });
  $('reset-costs')?.addEventListener('click', () => {
    costs = exampleCosts.map(c => ({ ...c }));
    nextId = 5;
    saveDemoCosts(costs);
    render();
    $('cost-feedback').textContent = 'Obnovena výchozí ukázka nákladů.';
  });
  syncForm();
  render();
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCosts, { once: true });
  else initCosts();
}
