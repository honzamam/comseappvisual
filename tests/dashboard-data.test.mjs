import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const window = {};
runInNewContext(readFileSync(new URL('../public/dashboard-data.js', import.meta.url), 'utf8'), { window });
const get = window.ComseDemo.overview;
test('distinct shop fixtures sum exactly into the combined view in both modes', () => {
  for (const mode of ['marketing', 'finance']) {
    const a = get('store', mode), b = get('outlet', mode), all = get('all', mode);
    assert.notEqual(a.revenue, b.revenue);
    for (const key of ['revenue', 'orders', 'customers', 'returning', 'discounts', 'gross', 'previous', 'ads', 'afterAds']) assert.equal(all[key], a[key] + b[key], key);
    for (const key of ['dailyRevenue', 'dailyOrders']) for (let day = 0; day < 7; day++) assert.equal(all[key][day], a[key][day] + b[key][day]);
    for (let i = 0; i < 3; i++) for (const key of ['spend','revenue']) assert.equal(all.channels[i][key], a.channels[i][key] + b.channels[i][key]);
  }
  assert.equal(get('store').revenue,52000);
  assert.equal(get('outlet').revenue,32250);
  assert.equal(get('all').revenue,84250);
});
test('PNO, ROAS and average order are calculated from totals, not summed ratios', () => {
  const all = get('all');
  assert.equal(all.pno, 12700 / 84250 * 100);
  assert.equal(all.roas, 84250 / 12700);
  assert.equal(all.averageOrder, 84250 / 128);
  assert.notEqual(all.pno, get('store').pno + get('outlet').pno);
});
test('chart and channel values reconcile to headline metrics for every view', () => {
  for (const mode of ['marketing', 'finance']) for (const scope of ['store','outlet','all']) {
    const d=get(scope,mode);
    assert.equal(d.dailyRevenue.reduce((a,b)=>a+b,0),d.revenue);
    assert.equal(d.dailyOrders.reduce((a,b)=>a+b,0),d.orders);
    assert.equal(d.channels.reduce((n,c)=>n+c.spend,0),d.ads);
    assert.equal(d.channels.reduce((n,c)=>n+c.revenue,0),d.revenue);
    assert.equal(d.gross-d.ads,d.afterAds);
    assert.ok(d.dailyRevenue.every(v=>v<=20000));
    assert.ok(d.dailyOrders.every(v=>v<=30));
  }
});
test('selecting another view does not mutate the fixture or earlier results', () => {
  const first = get('store');
  first.dailyRevenue[0]=0;
  assert.equal(get('store').dailyRevenue[0],6000);
  assert.equal(get('all').revenue,84250);
});
