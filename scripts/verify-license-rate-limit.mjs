import { randomUUID } from 'node:crypto';

const ALLOWANCE = 30;
const COOLDOWN_MS = 35_000;
const endpoint = new URL('https://api.sociobot.in/api/v1/products/visualizer-cuebook/verify');
endpoint.searchParams.set('license', `cuebook-rate-limit-check-${randomUUID()}`);

console.log(`Waiting ${COOLDOWN_MS / 1000} seconds for this client's verification allowance to refill.`);
await new Promise((resolve) => setTimeout(resolve, COOLDOWN_MS));

for (let request = 1; request <= ALLOWANCE; request += 1) {
  const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
  const body = await response.json();
  if (response.status !== 200 || body.valid !== false || body.reason !== 'invalid') {
    throw new Error(`Expected request ${request} of ${ALLOWANCE} to return the invalid-license 200 response; received ${response.status}.`);
  }
}

const boundary = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
const retryAfter = boundary.headers.get('Retry-After');
if (boundary.status !== 429) {
  throw new Error(`Expected request ${ALLOWANCE + 1} to return 429; received ${boundary.status}.`);
}
if (!retryAfter || !/^\d+$/.test(retryAfter) || Number(retryAfter) < 1) {
  throw new Error(`Expected request ${ALLOWANCE + 1} to include a positive integer Retry-After header.`);
}

console.log(JSON.stringify({ allowance: ALLOWANCE, boundaryRequest: ALLOWANCE + 1, status: boundary.status, retryAfterSeconds: Number(retryAfter) }));
