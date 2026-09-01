const SLUG = 'visualizer-cuebook';
const TOKEN_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `sb_license_cache:${SLUG}`;
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;
export const BUY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;

type Verdict = { valid: boolean; checkedAt: number };
export type LicenseVerification =
  | { status: 'valid' | 'invalid' }
  | { status: 'rate-limited'; retryAfterSeconds?: number }
  | { status: 'unavailable' };

// The demo is deliberately not a "real account" preview.  Keep this check in
// this module (rather than trusting callers) so a future license control
// cannot accidentally touch a visitor's production namespace from /demo.
function isDemo(): boolean {
  return typeof location !== 'undefined'
    && (location.pathname.replace(/\/$/, '') === '/demo' || new URL(location.href).searchParams.get('demo') === '1');
}

export function captureLicenseFromUrl(): void {
  if (isDemo()) return;
  const url = new URL(location.href);
  const license = url.searchParams.get('license');
  if (!license) return;
  localStorage.setItem(TOKEN_KEY, license.trim());
  localStorage.removeItem(CACHE_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', url);
}

export function cachedUnlock(): boolean {
  if (isDemo()) return false;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '') as Verdict;
    return verdict.valid;
  } catch {
    return false;
  }
}

export function storeLicense(token: string): void {
  if (isDemo()) return;
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(CACHE_KEY);
}

export function forgetLicense(): void {
  if (isDemo()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CACHE_KEY);
}

function retryAfterSeconds(response: Response): number | undefined {
  const value = response.headers.get('Retry-After');
  if (!value) return undefined;
  if (/^\d+$/.test(value.trim())) return Math.max(1, Number(value));
  const retryAt = Date.parse(value);
  if (!Number.isFinite(retryAt)) return undefined;
  return Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));
}

export async function verifyLicense(force = false): Promise<LicenseVerification> {
  if (isDemo()) return { status: 'invalid' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { status: 'invalid' };
  try {
    const old = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '') as Verdict;
    if (!force && Date.now() - old.checkedAt < 86_400_000) return { status: old.valid ? 'valid' : 'invalid' };
  } catch { /* first verification */ }
  try {
    const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`);
    if (response.status === 429) {
      return { status: 'rate-limited', retryAfterSeconds: retryAfterSeconds(response) };
    }
    if (!response.ok) return { status: 'unavailable' };
    const body = await response.json() as { valid: boolean };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ valid: body.valid, checkedAt: Date.now() }));
    return { status: body.valid ? 'valid' : 'invalid' };
  } catch {
    return { status: 'unavailable' };
  }
}
