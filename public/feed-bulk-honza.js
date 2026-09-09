export const examples = {
  shorten: 'Honzo, prosím zkrať popisky u všech produktů.',
  titles: 'Honzo, prosím zkrať názvy všech produktů a zachovej jejich označení.',
  expand: 'Honzo, prosím doplň do popisků všech produktů jejich použití podle známých údajů.',
};
const products = [
  { id: 'TRP-042', category: 'shoes', title: 'Trail Runner Pro – lehké běžecké boty pro trénink', name: 'Trail Runner Pro',
    original: 'Lehké běžecké boty Trail Runner Pro pro rychlý trénink i delší běhy. Prodyšný svršek, stabilní podrážka a pohodlné tlumení pro silnici i zpevněné cesty.',
    short: 'Trail Runner Pro: lehké běžecké boty s prodyšným svrškem a tlumením na silnici i zpevněné cesty.',
    usage: 'Použití: rychlý trénink a delší běhy na silnici nebo zpevněných cestách.' },
  { id: 'CBP-118', category: 'bags', title: 'City Backpack 24L – městský batoh s kapsou na notebook', name: 'City Backpack 24L',
    original: 'Městský batoh City Backpack 24L s přehledným vnitřním prostorem, kapsou na notebook a odolným materiálem. Vhodný pro práci, školu i každodenní cestování.',
    short: 'City Backpack 24L: městský batoh s kapsou na notebook pro práci, školu i cestování.',
    usage: 'Použití: cesta do práce, do školy a každodenní cestování s notebookem.' },
  { id: 'HBS-640', category: 'bottles', title: 'Hydro Bottle Steel – nerezová lahev pro sport a běžný den', name: 'Hydro Bottle Steel',
    original: 'Nerezová lahev Hydro Bottle Steel pro sport i běžný den. Udrží nápoj déle chladný, těsní při přenášení a díky odolnému tělu se hodí do batohu i auta.',
    short: 'Hydro Bottle Steel: odolná nerezová lahev pro sport i běžný den, do batohu i auta.',
    usage: 'Použití: sport, běžný den a přenášení nápoje v batohu nebo autě.' },
];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function prepareDemo(prompt, scope) {
  const text = normalize(prompt.trim());
  if (!text) throw new Error('Nejdřív mi napiš, co mám upravit.');
  if (!['all', 'shoes', 'bags'].includes(scope)) throw new Error('Vyber rozsah produktů.');
  if (text.includes('vsech') && scope !== 'all') throw new Error('V zadání píšeš o všech produktech, ale máš vybranou kategorii. Sjednoť prosím zadání a rozsah.');
  const kind = /(?:zkrat|skrat)/.test(text) ? (/nazv|nazev/.test(text) ? 'titles' : 'shorten') : /dopln/.test(text) ? 'expand' : null;
  if (!kind) throw new Error('V této klikací ukázce zkus některé z připravených zadání nahoře.');
  return products.filter(p => scope === 'all' || p.category === scope).map(p => ({
    id: p.id, name: p.name, field: kind === 'titles' ? 'title' : 'description',
    before: kind === 'titles' ? p.title : p.original,
    after: kind === 'titles' ? p.name : kind === 'shorten' ? p.short : `${p.original}\n\n${p.usage}`,
    approved: false,
  }));
}
export function editProposal(row, value) { return { ...row, after: value, approved: false }; }
export function approvedChanges(rows) { return rows.filter(row => row.approved && row.after.trim() && row.after !== row.before); }

if (typeof document !== 'undefined') {
  const modal = document.getElementById('bulk-rules-modal');
  if (modal) {
    const get = id => document.getElementById(`honza-bulk-${id}`);
    const prompt = get('prompt'), scope = get('scope'), results = get('results'), cards = get('cards');
    const status = get('status'), count = get('count'), apply = get('apply');
    let rows = [], opener;
    const el = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text !== undefined) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    const updateCount = () => {
      const approved = approvedChanges(rows).length;
      count.textContent = rows.length ? `${approved} / ${rows.length} návrhů schváleno` : 'Zatím žádné návrhy ke schválení';
      apply.disabled = approved === 0;
    };
    const invalidate = () => {
      const hadRows = rows.length > 0;
      rows = []; cards.replaceChildren(); results.hidden = true; updateCount();
      status.textContent = hadRows ? 'Zadání se změnilo. Připrav nové návrhy a znovu je zkontroluj.' : '';
    };
    const render = () => {
      cards.replaceChildren();
      rows.forEach((row, index) => {
        const card = el('article', undefined, 'honza-bulk-card');
        card.append(el('h4', `${row.name} · ${row.id}`));
        const diff = el('div', undefined, 'honza-bulk-diff');
        const before = el('div'); before.append(el('span', `Původní ${row.field}`), el('p', row.before));
        const proposed = el('label', 'Honzův návrh · můžeš upravit');
        const input = el('textarea'); input.rows = 4; input.value = row.after; input.maxLength = 3000;
        input.setAttribute('aria-label', `Upravit návrh pro ${row.name}`); proposed.append(input);
        diff.append(before, proposed); card.append(diff);
        const label = el('label', undefined, 'honza-bulk-approve'), check = el('input');
        check.type = 'checkbox'; check.checked = row.approved;
        label.append(check, el('span', 'Schvaluji tento návrh')); card.append(label);
        check.addEventListener('change', () => { rows[index].approved = check.checked; updateCount(); });
        input.addEventListener('input', () => { rows[index] = editProposal(rows[index], input.value); check.checked = false; updateCount(); });
        cards.append(card);
      });
      updateCount();
    };
    prompt.addEventListener('input', invalidate);
    scope.addEventListener('change', invalidate);
    modal.querySelectorAll('[data-honza-example]').forEach(button => button.addEventListener('click', () => {
      prompt.value = examples[button.dataset.honzaExample]; scope.value = 'all'; invalidate(); prompt.focus();
    }));
    get('generate').addEventListener('click', () => {
      invalidate();
      try {
        rows = prepareDemo(prompt.value, scope.value); render(); results.hidden = false;
        get('summary').textContent = `${rows.length} ukázkové produkty · ${rows[0].field} · ${scope.options[scope.selectedIndex].text}`;
        status.textContent = 'Tady jsou ukázkové návrhy pro tento typ úpravy. Projdi je a potvrď jen ty, které ti vyhovují.';
      } catch (error) { status.textContent = error.message; }
    });
    get('approve-all').addEventListener('click', () => {
      rows = rows.map(row => ({ ...row, approved: Boolean(row.after.trim() && row.after !== row.before) })); render();
    });
    apply.addEventListener('click', () => {
      const approved = approvedChanges(rows);
      if (!approved.length) return;
      status.textContent = `Potvrzeno ${approved.length} úprav v ukázce. Skutečný feed se nemění. Další zadání můžeš vyzkoušet nahoře.`;
      rows = []; cards.replaceChildren(); results.hidden = true; updateCount();
    });
    // Existing feed controls own opening/closing; add keyboard support for this dialog.
    document.querySelectorAll('[data-bulk-rules-open]').forEach(button => button.addEventListener('click', () => {
      opener = button;
      setTimeout(() => prompt.focus(), 0);
    }));
    modal.querySelectorAll('[data-bulk-rules-close]').forEach(button => button.addEventListener('click', () => opener?.focus()));
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        modal.querySelector('[data-bulk-rules-close]').click();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll('button, input, select, textarea')].filter(node => !node.disabled && !node.closest('[hidden]'));
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
}
