// Synthetic credits for one company in this browser tab. No AI or payment requests.
const STORAGE_KEY = 'comse.visual.ai-credits.alfa.v1';
export const initialLedger = [
  { date: '2026-09-09', title: 'AI doporučení produktů', actor: 'Zaměstnanec X', shop: 'E-shop 2', delta: -60 },
  { date: '2026-09-08', title: 'Návrhy produktových textů', actor: 'Majitel firmy', shop: 'E-shop 1', delta: -200 },
  { date: '2026-09-01', title: 'Připsání ukázkových kreditů', actor: 'Majitel firmy', shop: 'Firma Alfa', delta: 1500 }
];
export function balance(ledger) { return ledger.reduce((sum, row) => sum + row.delta, 0); }
export function transact(ledger, action, date) {
  const row = action === 'topup'
    ? { title: 'Dobití · simulace', actor: 'Majitel firmy', shop: 'Firma Alfa', delta: 500 }
    : action === 'use'
      ? { title: 'AI doporučení · simulace', actor: 'Zaměstnanec X', shop: 'E-shop 2', delta: -20 }
      : null;
  if (!row) throw new Error('Neznámá akce.');
  if (balance(ledger) + row.delta < 0) throw new Error('Na tuto akci chybí kredity. Nejprve doplňte zůstatek.');
  return [{ ...row, date }, ...ledger];
}
export function readLedger(raw) {
  try {
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows) || !rows.length || rows.length > 10000) throw new Error();
    for (const row of rows) {
      if (!row || !Number.isSafeInteger(row.delta) || Math.abs(row.delta) > 1000000 || !['date', 'title', 'actor', 'shop'].every(k => typeof row[k] === 'string' && row[k].length < 160) || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new Error();
    }
    if (balance(rows) < 0) throw new Error();
    return rows;
  } catch { return initialLedger.map(row => ({ ...row })); }
}
function initCredits() {
  let ledger;
  try { ledger = readLedger(sessionStorage.getItem(STORAGE_KEY)); }
  catch { ledger = readLedger(null); }
  const $ = id => document.getElementById(id);
  const format = n => new Intl.NumberFormat('cs-CZ').format(n);
  const escaped = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  function render() {
    const remaining = balance(ledger);
    document.querySelectorAll('[data-ai-balance]').forEach(el => { el.textContent = format(remaining); });
    if (!$('ai-credit-history')) return;
    $('ai-credit-added').textContent = format(ledger.reduce((sum, r) => sum + Math.max(0, r.delta), 0));
    $('ai-credit-used').textContent = format(-ledger.reduce((sum, r) => sum + Math.min(0, r.delta), 0));
    $('ai-credit-status').textContent = remaining < 20 ? 'Kredity nestačí na ukázkovou akci. Doplňte zůstatek.' : remaining < 100 ? 'Kredity docházejí. Je čas je doplnit.' : 'Připraveno pro další nápad.';
    $('ai-demo-use').disabled = remaining < 20;
    $('ai-credit-history').innerHTML = ledger.map(row => `<tr><td>${escaped(row.date.split('-').reverse().join('. '))}</td><td>${escaped(row.title)}</td><td>${escaped(row.actor)}<small>${escaped(row.shop)}</small></td><td class="${row.delta > 0 ? 'ai-credit-positive' : ''}">${row.delta > 0 ? '+' : '−'} ${format(Math.abs(row.delta))}</td></tr>`).join('');
  }
  function save(message) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ledger)); }
    catch { message += ' Prohlížeč neumožnil zapamatování; stav platí jen do opuštění stránky.'; }
    render();
    if ($('ai-credit-feedback')) $('ai-credit-feedback').textContent = message;
  }
  function run(action) {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    try {
      ledger = transact(ledger, action, date);
      save(action === 'topup' ? 'Připsáno 500 ukázkových kreditů. Žádná platba neproběhla.' : 'Odečteno 20 ukázkových kreditů za E-shop 2. Jde pouze o simulaci, AI se nespouštěla.');
    } catch (error) { $('ai-credit-feedback').textContent = error.message; }
  }
  $('ai-topup-open')?.addEventListener('click', () => $('ai-topup-dialog').showModal());
  $('ai-topup-cancel')?.addEventListener('click', () => $('ai-topup-dialog').close());
  $('ai-topup-form')?.addEventListener('submit', event => {
    event.preventDefault();
    if (!$('ai-topup-dialog').open) return;
    run('topup');
    $('ai-topup-dialog').close();
  });
  $('ai-demo-use')?.addEventListener('click', () => run('use'));
  $('ai-credit-reset')?.addEventListener('click', () => {
    ledger = initialLedger.map(row => ({ ...row }));
    save('Obnovena výchozí ukázka: 1 240 kreditů.');
  });
  // Refresh badges when returning via the browser's back/forward cache.
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    try { ledger = readLedger(sessionStorage.getItem(STORAGE_KEY)); } catch { /* Retain in-memory demo. */ }
    render();
  });
  render();
}
if (typeof document !== 'undefined') initCredits();
