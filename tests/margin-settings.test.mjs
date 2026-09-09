import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../public/margin-settings.js',import.meta.url));
const { initialMargins,sampleProducts,validateMargin,effectiveMargin,parseMarginRequest,previewMargins,applyMarginRule,filterMarginProducts,productPrice,saveProductValues,applyBulkMargins }=await import(`data:text/javascript;base64,${source.toString('base64')}`);
const request={manufacturer:'X',category:'shirts',value:49};
test('Czech AI request recognizes manufacturer, category and decimal percentage',()=>{
  assert.deepEqual(parseMarginRequest('Nastav mi u výrobce X a kategorie Trička marži na 49 %.'),request);
  assert.equal(parseMarginRequest('Výrobce Y, boty, 49,5 %').value,49.5);
  for(const text of ['Nastav 49 %','Výrobce Z trička 49 %','Výrobce X trička a boty 49 %','Výrobce X trička 49 % nebo 50 %','Výrobce X trička -5 %','Výrobce X trička 101 %'])assert.throws(()=>parseMarginRequest(text));
});
test('AI preview shows product exceptions without modifying state',()=>{
  const state=initialMargins(),snapshot=structuredClone(state);
  const rows=previewMargins(state,request,'all');
  assert.equal(rows.length,3);
  assert.equal(rows.filter(r=>r.preserved).length,1);
  assert.equal(rows.find(r=>r.product.id==='A102').after,45);
  assert.deepEqual(state,snapshot);
});
test('confirmed rule stays within manufacturer, category and selected shop',()=>{
  const state=initialMargins(),next=applyMarginRule(state,request,'store');
  const value=id=>effectiveMargin(sampleProducts.find(p=>p.id===id),next).value;
  assert.equal(value('A101'),49);
  assert.equal(value('A102'),45);
  assert.equal(value('A103'),50);
  assert.equal(value('B201'),38);
  assert.equal(value('B202'),38);
  assert.equal(state.rules.length,0);
});
test('explicit overwrite removes individual exceptions for matched products only',()=>{
  const state=initialMargins();state.individual.B202=22;
  const next=applyMarginRule(state,request,'all',true);
  assert.equal(Object.hasOwn(next.individual,'A102'),false);
  assert.equal(effectiveMargin(sampleProducts[1],next).value,49);
  assert.equal(next.individual.B202,22);
  assert.equal(next.rules.length,2);
});
test('individual then manufacturer then category precedence including zero margins',()=>{
  const state=applyMarginRule(initialMargins(),request,'store');
  state.categories.store.shirts=20;
  assert.equal(effectiveMargin(sampleProducts[0],state).value,49);
  state.individual.A101=0;
  assert.equal(effectiveMargin(sampleProducts[0],state).value,0);
  delete state.individual.A101;state.rules=[];
  assert.equal(effectiveMargin(sampleProducts[0],state).value,20);
  assert.equal(validateMargin(100),100);
  assert.throws(()=>validateMargin(''));
  assert.throws(()=>applyMarginRule(state,{manufacturer:'X',category:'shoes',value:49},'all'));
});

test('product filters combine shop, category, manufacturer, text and margin source',()=>{
  const state=initialMargins();
  const ids=filterMarginProducts(state,{scope:'store',category:'shirts',manufacturer:'X'}).map(p=>p.id);
  assert.deepEqual(ids,['A101','A102']);
  assert.deepEqual(filterMarginProducts(state,{query:'tricko',source:'own'}).map(p=>p.id),['A102']);
  assert.deepEqual(filterMarginProducts(state,{scope:'outlet',manufacturer:'X'}).map(p=>p.id),['B201']);
  assert.equal(filterMarginProducts(state,{category:'shoes',manufacturer:'X'}).length,0);
});
test('bulk margin changes only selected visible products and leaves all prices untouched',()=>{
  const state=initialMargins();
  const visible=filterMarginProducts(state,{scope:'store',category:'shirts'}).map(p=>p.id);
  const next=applyBulkMargins(state,visible,49,visible);
  assert.equal(next.individual.A101,49);
  assert.equal(next.individual.A102,49);
  assert.equal(Object.hasOwn(next.individual,'B201'),false);
  for(const p of sampleProducts)assert.equal(productPrice(p,next),productPrice(p,state));
  assert.deepEqual(state.individual,{A102:45});
  assert.throws(()=>applyBulkMargins(state,['B201'],49,visible));
  assert.throws(()=>applyBulkMargins(state,[],49,visible));
  assert.throws(()=>applyBulkMargins(state,visible,101,visible));
});
test('manual row save updates the chosen price and margin only; empty margin inherits',()=>{
  const state=initialMargins();
  const next=saveProductValues(state,'A101','599.90','49');
  assert.equal(productPrice(sampleProducts[0],next),59990);
  assert.equal(effectiveMargin(sampleProducts[0],next).value,49);
  assert.equal(productPrice(sampleProducts[1],next),79000);
  assert.equal(productPrice(sampleProducts[0],state),49000);
  const inherited=saveProductValues(next,'A101','599.90','');
  assert.equal(effectiveMargin(sampleProducts[0],inherited).value,40);
  assert.equal(productPrice(sampleProducts[0],inherited),59990);
  assert.throws(()=>saveProductValues(state,'A101','-1','40'));
  assert.throws(()=>saveProductValues(state,'A101','','40'));
  assert.throws(()=>saveProductValues(state,'A101','500','101'));
});
