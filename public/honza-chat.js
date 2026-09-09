// Shared visual-only assistant. No network, AI calls, credit usage or message storage.
(() => {
  if (document.getElementById('honza-chat-widget')) return;
  const widget = document.createElement('div');
  widget.id = 'honza-chat-widget';
  widget.className = 'honza-chat';
  widget.innerHTML = `
    <button class="honza-chat-launcher" type="button" aria-expanded="false" aria-controls="honza-chat-panel" aria-label="Honza AI — zeptej se mě na cokoliv">
      <span class="honza-chat-avatar"><img src="/images/honza-ai.webp" alt="" width="48" height="48" /><span aria-hidden="true"></span></span>
      <span class="honza-chat-invitation"><strong>Honza AI</strong><span>Zeptej se mě na cokoliv</span></span>
      <span class="honza-chat-spark" aria-hidden="true">✦</span>
    </button>
    <section id="honza-chat-panel" class="honza-chat-panel" role="dialog" aria-modal="false" aria-labelledby="honza-chat-title" hidden>
      <header class="honza-chat-header">
        <img src="/images/honza-ai.webp" alt="" width="44" height="44" />
        <div><h2 id="honza-chat-title">Honza AI</h2><p>Vždycky po ruce. I když ostatní spí.</p></div>
        <button class="honza-chat-close" type="button" aria-label="Zavřít chat">×</button>
      </header>
      <div class="honza-chat-context"><span aria-hidden="true">✦</span> Právě prohlížíš: <strong></strong></div>
      <div class="honza-chat-messages" role="log" aria-label="Konverzace s Honzou AI" aria-live="polite" aria-relevant="additions" tabindex="0">
        <div class="honza-chat-message honza-chat-message-ai"><span>Honza AI</span><p>Ahoj, jsem Honza 👋 Pomůžu ti zorientovat se v COMSE. Zeptej se mě na cokoliv — nebo si vyber téma dole.</p></div>
      </div>
      <div class="honza-chat-typing" role="status" aria-live="polite"></div>
      <div class="honza-chat-suggestions" aria-label="Navržené otázky">
        <button type="button">Jak fungují AI kredity?</button>
        <button type="button">Kam přiřadit náklady?</button>
        <button type="button">Co znamená PNO?</button>
      </div>
      <form class="honza-chat-form">
        <label class="honza-chat-sr-only" for="honza-chat-input">Zpráva pro Honzu AI</label>
        <textarea id="honza-chat-input" rows="1" maxlength="1000" placeholder="Honzo, poraď mi s…" required></textarea>
        <button class="honza-chat-send" type="submit" aria-label="Odeslat zprávu" disabled>↑</button>
      </form>
      <p class="honza-chat-footnote">Ukázkový chat · bez volání AI a čerpání kreditů</p>
    </section>`;
  document.body.append(widget);
  const $ = selector => widget.querySelector(selector);
  const launcher = $('.honza-chat-launcher');
  const panel = $('.honza-chat-panel');
  const input = $('#honza-chat-input');
  const send = $('.honza-chat-send');
  const log = $('.honza-chat-messages');
  const typing = $('.honza-chat-typing');
  const suggestions = [...widget.querySelectorAll('.honza-chat-suggestions button')];
  $('.honza-chat-context strong').textContent = document.title.split('|')[0].trim() || 'COMSE';
  let pending = false;
  let timer;
  function openChat() {
    panel.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    input.focus({ preventScroll: true });
  }
  function closeChat() {
    panel.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus({ preventScroll: true });
  }
  function appendMessage(text, isUser = false, link) {
    const item = document.createElement('div');
    item.className = `honza-chat-message honza-chat-message-${isUser ? 'user' : 'ai'}`;
    const name = document.createElement('span');
    name.textContent = isUser ? 'Ty' : 'Honza AI';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    item.append(name, paragraph);
    if (link) {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.label;
      item.append(anchor);
    }
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }
  function replyFor(text) {
    const q = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (/kredit|dobit|zustatek/.test(q)) return {
      text: 'V návrhu má firma společný účet AI kreditů pro svůj tým a e-shopy. V Nastavení najdeš zůstatek, historii i ukázkové dobití. Tenhle chat žádné kredity nečerpá.',
      link: { href: 'settings.html#ai-kredity', label: 'Otevřít AI kredity →' }
    };
    if (/naklad|zamestnan|mzda|finance/.test(q)) return {
      text: 'Pracuje zaměstnanec jen pro E-shop 2? Přiřaď celý jeho náklad právě tam. Společný náklad můžeš rozdělit procenty; nerozdělená režie zůstává na firmě. V ukázce Nákladů společnosti si můžeš vyzkoušet dopad.',
      link: { href: 'company-costs.html', label: 'Otevřít náklady společnosti →' }
    };
    if (/pno/.test(q)) return {
      text: 'PNO je podíl nákladů na reklamu vůči tržbám: náklady na reklamu ÷ tržby × 100. Například 1 000 Kč za reklamu při tržbách 10 000 Kč znamená PNO 10 %. Porovnávej vždy stejné období a stejný rozsah dat.',
      link: { href: 'dashboard.html', label: 'Přejít na přehled →' }
    };
    if (/produkt|stit|feed/.test(q)) return {
      text: 'V přehledu produktů najdeš ukázky výkonu a štítků. Vyber produkt a prohlédni si jeho detail. Konkrétní data tvého e-shopu v tomhle ukázkovém chatu nevyhodnocuji.',
      link: { href: 'product-overview.html', label: 'Prohlédnout produkty →' }
    };
    if (/ucet|agentur|opravnen|pristup/.test(q)) return {
      text: 'Majitel firmy spravuje své e-shopy i přístupy týmu. Agentura může spravovat více klientských firem, vždy podle jejich pověření. Návrh rolí najdeš v Nastavení.',
      link: { href: 'settings.html#typy-uctu', label: 'Prohlédnout typy účtů →' }
    };
    return { text: 'Tohle je zatím klikací ukázka Honzy s připravenými odpověďmi. Můžu ti ukázat, jak v COMSE fungují AI kredity, náklady, PNO, produkty nebo přístupy. Zkus jedno z těchto témat.' };
  }
  function sync() {
    send.disabled = pending || !input.value.trim();
    suggestions.forEach(button => { button.disabled = pending; });
  }
  function submit(text) {
    const message = text.trim().slice(0, 1000);
    if (!message || pending) return;
    appendMessage(message, true);
    input.value = '';
    pending = true;
    typing.textContent = 'Honza píše…';
    sync();
    timer = window.setTimeout(() => {
      const reply = replyFor(message);
      typing.textContent = '';
      appendMessage(reply.text, false, reply.link);
      pending = false;
      sync();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
  }
  launcher.addEventListener('click', openChat);
  $('.honza-chat-close').addEventListener('click', closeChat);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeChat(); }
  });
  input.addEventListener('input', sync);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submit(input.value);
    }
  });
  $('.honza-chat-form').addEventListener('submit', event => { event.preventDefault(); submit(input.value); input.focus(); });
  suggestions.forEach(button => button.addEventListener('click', () => { submit(button.textContent); input.focus(); }));
  window.addEventListener('pagehide', () => {
    if (!pending) return;
    window.clearTimeout(timer);
    pending = false;
    typing.textContent = '';
    appendMessage('Ukázková odpověď byla přerušena opuštěním stránky. Můžeš otázku poslat znovu.');
    sync();
  });
})();
