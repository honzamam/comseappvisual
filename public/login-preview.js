// A finite, local presentation. No requests or stored data.
(() => {
  const demo = document.querySelector('[data-honza-demo]');
  if (!demo) return;
  const typing = demo.querySelector('[data-honza-typing]');
  const answer = demo.querySelector('[data-honza-answer]');
  const replay = demo.querySelector('[data-honza-replay]');
  const message = demo.querySelector('.honza-message');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  const reveal = () => {
    window.clearTimeout(timer);
    typing.hidden = true;
    answer.hidden = false;
    message.classList.add('is-revealing');
    replay.disabled = false;
  };
  const play = () => {
    window.clearTimeout(timer);
    message.classList.remove('is-revealing');
    if (motion.matches) { reveal(); return; }
    answer.hidden = true;
    typing.hidden = false;
    replay.disabled = true;
    timer = window.setTimeout(reveal, 2400);
  };
  replay.addEventListener('click', play);
  motion.addEventListener('change', () => { if (motion.matches) reveal(); });
  window.addEventListener('pagehide', reveal);
  play();
})();
