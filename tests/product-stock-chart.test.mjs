import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../public/product-detail.html', import.meta.url), 'utf8');
function setup() {
  const listeners = {};
  const stock = { checked: true, addEventListener: (name, fn) => { listeners.toggle = fn; } };
  const cursor = { style: {} }, tooltip = { style: {} }, date = {}, values = {};
  const parts = { '[data-chart-cursor]': cursor, '[data-chart-tooltip]': tooltip,
    '[data-chart-tooltip-date]': date, '[data-chart-tooltip-values]': values };
  const chart = { querySelector: key => parts[key], getBoundingClientRect: () => ({ left: 0, width: 980 }),
    addEventListener: (name, fn) => { listeners[name] = fn; } };
  vm.runInNewContext(source.slice(source.indexOf('const initProductChartCursor ='), source.indexOf('\ninitLogin();')) + '\ninitProductChartCursor();', {
    document: { querySelector: key => key === '[data-product-chart]' ? chart : stock },
  });
  return { stock, listeners, date, values };
}

test('stock values agree with the plotted right axis at every sample', () => {
  const { listeners, values } = setup();
  const points = html.match(/class="chart-line product-stock-line" points="([^"]+)"/)[1].split(' ');
  for (const point of points) {
    const [x, y] = point.split(',').map(Number);
    listeners.mousemove({ clientX: x });
    const count = Number(values.innerHTML.match(/Skladové zásoby <strong>(\d+) ks/)[1]);
    assert.equal(y, 305 - count * 3.25);
  }
});

test('toggling stock removes only stock from the selected date tooltip', () => {
  const { stock, listeners, date, values } = setup();
  listeners.mousemove({ clientX: 930 });
  assert.match(values.innerHTML, /48 ks/);
  stock.checked = false;
  listeners.toggle();
  assert.doesNotMatch(values.innerHTML, /Skladové zásoby/);
  assert.match(values.innerHTML, /Google CTR/);
  assert.equal(date.textContent, '31. 5.');
  stock.checked = true;
  listeners.toggle();
  assert.match(values.innerHTML, /Skladové zásoby <strong>48 ks/);
});

test('stock toggle controls both the curve and its axis through the existing toggle handler', () => {
  const hidden = [false, false];
  const stock = { checked: true, dataset: { chartToggle: 'stock' }, addEventListener: (_, fn) => { stock.change = fn; } };
  vm.runInNewContext(source.slice(source.indexOf('const initProductChartToggles ='), source.indexOf('const initProductChartCursor =')) + '\ninitProductChartToggles();', {
    document: { querySelectorAll: key => key === '[data-chart-toggle]' ? [stock] : hidden.map((_, i) => ({ classList: { toggle: (_, state) => { hidden[i] = state; } } })) },
  });
  stock.checked = false; stock.change();
  assert.deepEqual(hidden, [true, true]);
  stock.checked = true; stock.change();
  assert.deepEqual(hidden, [false, false]);
  assert.equal((html.match(/data-chart-series="stock"/g) || []).length, 2);
});
