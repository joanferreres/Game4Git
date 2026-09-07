import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../src/worker.ts', import.meta.url), 'utf8');
const dashboard = fs.readFileSync(new URL('../src/pages/AdminStats.tsx', import.meta.url), 'utf8');

assert.match(worker, /timeline\.results/);
assert.match(worker, /previous:/);
assert.match(worker, /changes:/);
assert.match(worker, /strftime\('\%Y-\%m-\%d'/);
assert.match(dashboard, /Traffic overview/);
assert.match(dashboard, /Export CSV/);
assert.match(dashboard, /TabsTrigger value="audience"/);
assert.match(dashboard, /TabsTrigger value="acquisition"/);

console.log('Admin stats data contract passed');
