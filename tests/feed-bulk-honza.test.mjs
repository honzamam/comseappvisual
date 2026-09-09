import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../public/feed-bulk-honza.js', import.meta.url), 'utf8');
const { examples, prepareDemo, editProposal, approvedChanges } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('all demo examples generate three unapproved changes for the correct attribute', () => {
  for (const [kind, prompt] of Object.entries(examples)) {
    const rows = prepareDemo(prompt, 'all');
    assert.equal(rows.length, 3);
    assert.equal(approvedChanges(rows).length, 0);
    assert(rows.every(row => row.field === (kind === 'titles' ? 'title' : 'description')));
    assert(rows.every(row => kind === 'expand' ? row.after.startsWith(row.before) : row.after.length < row.before.length));
  }
});
test('a category narrows the sample and conflicting all-products wording is rejected', () => {
  assert.deepEqual(prepareDemo('Honzo, zkrať popisky.', 'bags').map(p => p.id), ['CBP-118']);
  assert.throws(() => prepareDemo(examples.shorten, 'bags'), /sjednoť/i);
  assert.throws(() => prepareDemo('', 'all'));
  assert.throws(() => prepareDemo('Napiš báseň', 'all'));
});
test('manual changes revoke approval and confirmation excludes empty or unchanged values', () => {
  const rows = prepareDemo(examples.shorten, 'all').map(row => ({ ...row, approved: true }));
  assert.equal(approvedChanges(rows).length, 3);
  rows[0] = editProposal(rows[0], 'Upravený návrh');
  rows[1].after = '  ';
  rows[2].after = rows[2].before;
  assert.equal(approvedChanges(rows).length, 0);
});
