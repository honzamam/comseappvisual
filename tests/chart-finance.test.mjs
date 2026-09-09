import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const src = name => readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const url = source => 'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const costURL = url(src('company-costs.js'));
const profitURL = url(src('profit-accrual.js'));
const { financeChart } = await import(url(src('chart-finance-model.js').replace('./company-costs.js',costURL).replace('./profit-accrual.js',profitURL)));
const { exampleCosts, readDemoCosts, saveDemoCosts } = await import(costURL);
const window = {};
runInNewContext(src('dashboard-data.js'),{window});
const overview = scope => window.ComseDemo.overview(scope,'finance');
const chart = (costs=exampleCosts, scope='all') => financeChart(costs,'2026-09',15,scope,overview(scope));
test('profit graph matches the existing monthly result and cash records full payments', () => {
  const data=chart();
  assert.equal(data.profit.at(-1),3800000);
  assert.equal(data.cash[14],6300000);
  assert.equal(data.cash.at(-1),12900000);
  assert.equal(data.later,4800000);
  assert.equal(data.receipts[14]-data.expenses[14],data.cash[14]);
  assert.ok(data.expenses.every((v,i,a)=>i===0||v>=a[i-1]));
});
test('a monthly cost reduces daily profit proportionally and cash only on payment date', () => {
  const added={...exampleCosts[0],id:99,cents:3000000,due:'2026-09-20',allocation:'store'};
  const before=chart(),after=chart([...exampleCosts,added]);
  assert.equal(before.profit.at(-1)-after.profit.at(-1),1500000);
  assert.equal(after.cash[18],before.cash[18]);
  assert.equal(before.cash[19]-after.cash[19],3000000);
});
test('recorded payment date overrides due date; expenses from another cost month still appear when paid', () => {
  const added={...exampleCosts[0],id:99,period:'2026-08',due:'2026-08-20',status:'paid',paidOn:'2026-09-12',cents:500000};
  const before=chart(),after=chart([...exampleCosts,added]);
  assert.deepEqual(after.profit,before.profit);
  assert.equal(after.cash[10],before.cash[10]);
  assert.equal(before.cash[11]-after.cash[11],500000);
});
test('shop sums, negative profit and missing monthly income are represented correctly', () => {
  const a=chart(exampleCosts,'store'),b=chart(exampleCosts,'outlet'),all=chart();
  for(let i=0;i<30;i++)assert.equal(all.cash[i],a.cash[i]+b.cash[i]);
  for(let i=0;i<15;i++)assert.equal(all.profit[i],a.profit[i]+b.profit[i]);
  assert.ok(chart([{...exampleCosts[0],cents:100000000}]).profit.at(-1)<0);
  assert.equal(financeChart(exampleCosts,'2026-10',15,'all',overview('all')),null);
});
test('demo costs survive a module reload, including an intentionally empty list', async () => {
  const memory=new Map();
  globalThis.sessionStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  const changed=[{...exampleCosts[0],cents:3000000}];
  assert.equal(saveDemoCosts(changed),true);
  const fresh=await import(url(src('company-costs.js')+'\n// fresh module'));
  assert.deepEqual(fresh.readDemoCosts(),changed);
  fresh.saveDemoCosts([]);
  assert.deepEqual(readDemoCosts(),[]);
  sessionStorage.setItem('comse.visual.costs.v1','[null]');
  assert.doesNotThrow(()=>readDemoCosts());
  delete globalThis.sessionStorage;
});
