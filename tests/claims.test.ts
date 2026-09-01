import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Claim {
  id: string;
  claim: string;
  test: string;
}

describe('factory claims contract', () => {
  it('maps every unique declared claim and tagged browser regression one-to-one', () => {
    const claims = JSON.parse(readFileSync(resolve('.factory/claims.json'), 'utf8')) as Claim[];
    const browserTests = readFileSync(resolve('tests/e2e/cuebook.spec.ts'), 'utf8');
    const claimIds = claims.map((claim) => claim.id);
    const taggedIds = [...browserTests.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);

    expect(new Set(claimIds).size).toBe(claims.length);
    expect(new Set(taggedIds).size).toBe(taggedIds.length);
    expect(new Set(taggedIds)).toEqual(new Set(claimIds));
    for (const claim of claims) {
      const tag = `@claim:${claim.id}`;
      expect(claim.claim.trim().length).toBeGreaterThan(0);
      expect(claim.test).toContain(`--grep ${tag}`);
      expect(browserTests.split(tag)).toHaveLength(2);
    }
  });
});
