import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Claim {
  id: string;
  claim: string;
  test: string;
}

describe('factory claims contract', () => {
  it('maps every unique claim to exactly one tagged browser regression', () => {
    const claims = JSON.parse(readFileSync(resolve('.factory/claims.json'), 'utf8')) as Claim[];
    const browserTests = readFileSync(resolve('tests/e2e/cuebook.spec.ts'), 'utf8');
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      const tag = `@claim:${claim.id}`;
      expect(claim.claim.trim().length).toBeGreaterThan(0);
      expect(claim.test).toContain(`--grep ${tag}`);
      expect(browserTests.split(tag)).toHaveLength(2);
    }
  });
});
