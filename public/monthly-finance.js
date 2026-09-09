import { readDemoCosts, scopedCents, proratedMonthlyCosts } from './company-costs.js';
import { accruedSummary, demoProfitToDate, paymentSchedule } from './profit-accrual.js';
function initMonthlyFinance() {
  const asOf = document.getElementById('finance-asof');
  const shop = document.getElementById('eshop-select');
  if (!asOf || !shop) return;
  const money = cents => new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
  const date = value => new Intl.DateTimeFormat('cs-CZ').format(new Date(`${value}T12:00:00`));
  const safe = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const set = (id, value) => { document.getElementById(id).textContent = value; };
  const filters = [...document.querySelectorAll('[data-finance-filter]')];
  let filter = 'pending';
  function render() {
    if (!asOf.checkValidity()) { asOf.reportValidity(); return; }
    const period = asOf.value.slice(0, 7);
    const day = Number(asOf.value.slice(8, 10));
    const sourceCosts = readDemoCosts();
    const rows = sourceCosts.map(cost => ({ ...cost, cents: scopedCents(cost, shop.value) }));
    const cost = accruedSummary(rows, period, day);
    cost.accrued = proratedMonthlyCosts(sourceCosts, period, day, cost.days, shop.value);
    cost.deducted = cost.accrued + cost.other;
    const profit = demoProfitToDate(period, day, shop.value);
    const net = profit ? profit.afterAds - cost.deducted : null;
    const schedule = paymentSchedule(rows, period, asOf.value);
    const month = new Intl.DateTimeFormat('cs-CZ', { month: 'long', year: 'numeric' }).format(new Date(`${period}-01T12:00:00`));
    const scope = shop.value === 'all' ? 'Celá firma Alfa' : shop.value === 'store' ? 'E-shop 1' : 'E-shop 2';
    set('finance-period-label', `1.–${day}. den · ${month} · ${scope}`);
    set('finance-net', net === null ? 'Zatím bez dat' : money(net));
    document.querySelector('.finance-net').classList.toggle('is-loss', net !== null && net < 0);
    set('finance-profit-title', net !== null && net < 0 ? 'Ztráta po nákladech' : 'Zisk po nákladech');
    set('finance-net-caption', net === null ? 'Pro tento měsíc nejsou ukázková data zisku.' : 'Po reklamě a průběžných nákladech');
    set('finance-before', profit ? money(profit.afterAds) : '—');
    set('finance-deducted', `− ${money(cost.deducted)}`);
    set('finance-formula', `Náklady na celý měsíc: ${money(cost.monthly)}. Do zvoleného dne započítáno ${day} z ${cost.days} dní, tedy ${money(cost.accrued)}.${cost.other ? ` Ostatní náklady: ${money(cost.other)} v plné výši.` : ''}`);
    set('finance-scope-note', shop.value === 'all' ? 'Souhrn je součet E-shopu 1 a E-shopu 2. Ukázkové společné náklady jsou rozdělené mezi oba.' : 'Zahrnuje vlastní náklady a 50 % společného softwaru i nájmu.');
    set('finance-payments-period', `Náklady za ${month} · ${scope} · stav k ${date(asOf.value)}`);
    set('finance-paid', money(schedule.paid));
    set('finance-pending', money(schedule.pending));
    set('finance-overdue', money(schedule.overdue));
    set('finance-overdue-caption', schedule.overdue ? 'Součást částky, která zbývá zaplatit' : 'Žádná z evidovaných plateb není po splatnosti');
    set('finance-next-payment', schedule.next ? `Nejbližší: ${date(schedule.next.due)} · ${money(schedule.next.cents)}` : schedule.pending ? 'Zbývají pouze platby po splatnosti' : 'V tomto výběru je vše uhrazené');
    const visible = schedule.items.filter(row => filter === 'all' || (filter === 'paid' ? row.paymentState === 'paid' : row.paymentState !== 'paid'));
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.financeFilter === filter)));
    document.querySelector('.finance-table-heading h3').textContent = { pending: 'Očekávané platby', paid: 'Uhrazené platby', all: 'Všechny platby' }[filter];
    document.getElementById('finance-payment-rows').innerHTML = visible.map(row => {
      const allocation = row.allocation === 'company' ? 'Režie firmy' : row.allocation === 'split' ? 'Sdíleno mezi e-shopy' : row.allocation === 'store' ? 'E-shop 1' : 'E-shop 2';
      const status = { paid: 'Uhrazeno', overdue: 'Po splatnosti', pending: 'K úhradě' }[row.paymentState];
      return `<tr><td><strong>${safe(row.title)}</strong></td><td>${allocation}${row.allocation === 'split' ? `<small>E-shop 1: ${row.share} % · E-shop 2: ${100 - row.share} %</small>` : ''}</td><td>${date(row.due)}${row.due.slice(0, 7) > period ? '<small>Následující období</small>' : ''}</td><td>${money(row.cents)}</td><td><span class="finance-payment-status ${row.paymentState}">${status}</span>${row.paymentState === 'paid' ? `<small>${date(row.paidOn)}</small>` : ''}</td></tr>`;
    }).join('');
    set('finance-table-total-label', { pending: 'Celkem k úhradě', paid: 'Celkem uhrazeno', all: 'Celkem evidované platby' }[filter]);
    set('finance-table-total', money(visible.reduce((sum, row) => sum + row.cents, 0)));
    document.getElementById('finance-empty').hidden = visible.length !== 0;
  }
  filters.forEach(button => button.addEventListener('click', () => { filter = button.dataset.financeFilter; render(); }));
  document.addEventListener('comse:costs', render);
  window.addEventListener('pageshow', event => { if (event.persisted) render(); });
  asOf.addEventListener('change', render);
  shop.addEventListener('change', render);
  render();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMonthlyFinance, { once: true });
else initMonthlyFinance();
