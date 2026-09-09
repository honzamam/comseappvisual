// Shared synthetic shop fixtures for dashboard numbers and charts. No backend.
((global) => {
  const fixtures = {
    store: {
      name: 'E-shop 1', ads: [4000, 2000, 500],
      marketing: { revenue: [6000, 6600, 7000, 7500, 7000, 8500, 9400], orders: [9, 10, 10, 11, 10, 13, 15], customers: 70, returning: 18, discounts: 7000, gross: 21800, previous: 48000 },
      finance: { revenue: [5500, 6000, 6300, 6800, 6500, 7600, 8300], orders: [7, 8, 8, 9, 8, 10, 12], customers: 56, returning: 15, discounts: 5000, gross: 18000, previous: 44000 }
    },
    outlet: {
      name: 'E-shop 2', ads: [2500, 3200, 500],
      marketing: { revenue: [2200, 3200, 3400, 4600, 4300, 6300, 8250], orders: [3, 5, 6, 8, 7, 10, 11], customers: 45, returning: 12, discounts: 5450, gross: 11900, previous: 28000 },
      finance: { revenue: [1900, 2900, 3200, 4100, 3900, 6000, 7900], orders: [2, 3, 4, 5, 5, 7, 8], customers: 31, returning: 8, discounts: 3950, gross: 12000, previous: 26000 }
    }
  };
  const sum = values => values.reduce((a, b) => a + b, 0);
  function overview(scope = 'all', mode = 'marketing') {
    const selected = scope === 'all' ? Object.values(fixtures) : [fixtures[scope]];
    if (!['marketing', 'finance'].includes(mode) || selected.some(s => !s)) throw new Error('Neplatný ukázkový pohled.');
    const data = { dailyRevenue: Array(7).fill(0), dailyOrders: Array(7).fill(0), customers: 0, returning: 0, discounts: 0, gross: 0, previous: 0, channels: [0, 1, 2].map(() => ({ spend: 0, revenue: 0 })) };
    for (const shop of selected) {
      const current = shop[mode];
      for (let i = 0; i < 7; i++) { data.dailyRevenue[i] += current.revenue[i]; data.dailyOrders[i] += current.orders[i]; }
      for (const key of ['customers', 'returning', 'discounts', 'gross', 'previous']) data[key] += current[key];
      // Example channel attribution, in cents, preserving the exact total.
      const revenueCents = sum(current.revenue) * 100;
      const shares = [Math.round(revenueCents * .5), Math.round(revenueCents * .35)];
      shares.push(revenueCents - sum(shares));
      shop.ads.forEach((spend, i) => { data.channels[i].spend += spend; data.channels[i].revenue += shares[i] / 100; });
    }
    data.revenue = sum(data.dailyRevenue);
    data.orders = sum(data.dailyOrders);
    data.ads = sum(data.channels.map(c => c.spend));
    data.afterAds = data.gross - data.ads;
    data.pno = data.revenue ? data.ads / data.revenue * 100 : 0;
    data.roas = data.ads ? data.revenue / data.ads : 0;
    data.averageOrder = data.orders ? data.revenue / data.orders : 0;
    return data;
  }
  global.ComseDemo = { overview };
  if (typeof document === 'undefined') return;
  const shop = document.getElementById('eshop-select');
  if (!document.querySelector('[data-demo-metric]') || !shop) return;
  let mode = document.querySelector('[data-overview-tab].is-active')?.dataset.overviewTab || 'marketing';
  const number = n => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n);
  const money = n => `${number(n)} Kč`;
  const percent = n => `${new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(n)} %`;
  const decimal = n => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(n);
  function render() {
    const data = overview(shop.value, mode);
    const values = {
      revenue: money(data.revenue), revenueChange: `${data.revenue >= data.previous ? '+' : ''}${percent((data.revenue / data.previous - 1) * 100)} oproti minulému období`,
      orders: number(data.orders), ordersNote: mode === 'finance' ? 'zaplacené a vyřízené objednávky' : 'všechny objednávky',
      customers: number(data.customers), returningCustomers: `z toho vracející se ${number(data.returning)}`, averageOrder: money(data.averageOrder),
      discounts: money(data.discounts), discountShare: `${percent(data.discounts / data.revenue * 100)} z tržeb`, totalAds: money(data.ads), pno: percent(data.pno), roas: decimal(data.roas),
      scope: shop.value === 'all' ? 'Souhrn · E-shop 1 + E-shop 2' : fixtures[shop.value].name,
      split: shop.value === 'all' ? `${money(overview('store', mode).revenue)} + ${money(overview('outlet', mode).revenue)} = ${money(data.revenue)}` : `Zobrazená čísla a grafy patří pouze ${shop.value === 'store' ? 'E-shopu 1' : 'E-shopu 2'}.`
    };
    document.querySelectorAll('[data-demo-metric]').forEach(el => { el.textContent = values[el.dataset.demoMetric]; });
    data.channels.forEach((channel, i) => {
      const node = document.querySelector(`[data-demo-channel="${i}"]`);
      if (!node) return;
      node.querySelector('[data-channel-spend]').textContent = money(channel.spend);
      node.querySelector('[data-channel-pno]').textContent = percent(channel.spend / channel.revenue * 100);
      node.querySelector('[data-channel-roas]').textContent = decimal(channel.revenue / channel.spend);
    });
    document.dispatchEvent(new CustomEvent('comse:overview', { detail: { scope: shop.value, mode } }));
  }
  shop.addEventListener('change', render);
  document.querySelectorAll('[data-overview-tab]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.overviewTab; render(); }));
  render();
})(window);
