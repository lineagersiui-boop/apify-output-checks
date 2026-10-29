import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRuns, finishedRuns } from './check-runs.mjs';

const ok = (n, items = []) => ({ status: 'SUCCEEDED', itemCount: n, items });

test('healthy run passes', () => {
    assert.deepEqual(checkRuns([ok(480, [{ price: 1 }]), ok(500), ok(510)], { requiredFields: ['price'] }), []);
});
test('truncated run is flagged against the median', () => {
    assert.match(checkRuns([ok(40), ok(500), ok(510), ok(490)])[0], /40 is more than 50% below the recent median 500/);
});
test('empty dataset with status SUCCEEDED is flagged', () => {
    assert.ok(checkRuns([ok(0), ok(500), ok(500)]).some((p) => p.includes('0 items')));
});
test('nested required field empty in most items is flagged', () => {
    const items = [{ seller: { name: '' } }, { seller: {} }, { seller: { name: 'A' } }];
    assert.match(checkRuns([ok(3, items)], { requiredFields: ['seller.name'] })[0], /seller.name" is empty in 67%/);
});
test('failed latest run is reported', () => {
    assert.deepEqual(checkRuns([{ status: 'FAILED', itemCount: 0, items: [] }]), ['Latest run status is FAILED.']);
});
test('no runs', () => { assert.deepEqual(checkRuns([]), ['No runs found.']); });
test('in-progress runs are skipped, finished ones kept in order, at most 5', () => {
    const list = ['RUNNING', 'SUCCEEDED', 'READY', 'FAILED', 'SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED']
        .map((status, i) => ({ id: i, status }));
    assert.deepEqual(finishedRuns(list).map((r) => r.id), [1, 3, 4, 5, 6]);
});
