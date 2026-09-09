import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../public/ai-credits.js', import.meta.url));
const { initialLedger, balance, transact, readLedger } = await import(`data:text/javascript;base64,${source.toString('base64')}`);
test('initial balance equals credits added minus AI usage', () => {
  assert.equal(balance(initialLedger), 1240);
});
test('demo topup and usage retain history and attribution', () => {
  const added = transact(initialLedger, 'topup', '2026-09-09');
  const used = transact(added, 'use', '2026-09-09');
  assert.equal(balance(used), 1720);
  assert.equal(used[0].shop, 'E-shop 2');
  assert.equal(used[0].actor, 'Zaměstnanec X');
  assert.deepEqual(used.slice(2), initialLedger);
  assert.equal(balance(initialLedger), 1240);
});
test('exact balance can be spent once; insufficient credit never goes negative', () => {
  const ledger = [{ ...initialLedger[2], delta: 20 }];
  const spent = transact(ledger, 'use', '2026-09-09');
  assert.equal(balance(spent), 0);
  assert.throws(() => transact(spent, 'use', '2026-09-09'));
  assert.throws(() => transact(initialLedger, 'unknown', '2026-09-09'));
  assert.equal(spent.length, 2);
});
test('stored state round trips and malformed demo state resets safely', () => {
  const saved = transact(initialLedger, 'use', '2026-09-09');
  assert.deepEqual(readLedger(JSON.stringify(saved)), saved);
  for (const raw of [null, 'bad', '{}', '[]', '[null]', '[{"delta":-5}]']) {
    assert.deepEqual(readLedger(raw), initialLedger);
  }
});
