import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../src/worker.ts', import.meta.url), 'utf8');
const dashboard = fs.readFileSync(new URL('../src/pages/AdminStats.tsx', import.meta.url), 'utf8');

assert.match(worker, /timeline\.results/);
assert.match(worker, /previous:/);
assert.match(worker, /changes:/);
assert.match(worker, /strftime\('\%Y-\%m-\%d'/);

// Task 5: worker contracts (filters, heatmap, verification, hourly)
assert.match(worker, /includeUnverified/);
assert.match(worker, /verified\s*=\s*1|AND verified = 1|verified = \?/);
assert.match(worker, /heatmap/);
assert.match(worker, /verification/);
assert.match(worker, /strftime\('\%Y-\%m-\%dT\%H|\%Y-\%m-%dT\%H|hour/);

// Task 6: dashboard UI contracts
assert.match(dashboard, /includeUnverified|Solo verificadas|verifiedOnly/);
assert.match(dashboard, /heatmap|Heatmap|CountryMap|recharts|AreaChart|LineChart|ComposedChart/);

assert.match(dashboard, /Traffic overview/);
assert.match(dashboard, /Export CSV/);
assert.match(dashboard, /TabsTrigger value="audience"/);
assert.match(dashboard, /TabsTrigger value="acquisition"/);

console.log('Admin stats data contract passed');
