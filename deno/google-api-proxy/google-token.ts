import { getGoogleAccessTokenFromWif } from '../../supabase/functions/_shared/google-wif.ts';
import type { FetchLike, GoogleWifConfig } from '../../supabase/functions/_shared/google-wif.ts';

interface Options {
  config: GoogleWifConfig;
  getIdToken: (audience: string) => Promise<string>;
  fetchImpl?: FetchLike;
  now?: () => number;
}

/** Runtime OIDC -> STS -> scoped Google token. No persistent Google credentials. */
export function createDenoWifTokenProvider({ config, getIdToken, fetchImpl = fetch, now = Date.now }: Options) {
  if (!/^\/\/iam\.googleapis\.com\/projects\/\d+\/locations\/global\/workloadIdentityPools\/[a-z0-9-]+\/providers\/[a-z0-9-]+$/.test(config.audience)) {
    throw new Error('A canonical Google WIF provider audience is required');
  }
  const oidcAudience = config.audience.replace('//iam.googleapis.com/', 'https://iam.googleapis.com/');
  const cache = new Map<string, { accessToken: string; expiresAt: number }>();
  const pending = new Map<string, Promise<string>>();

  return async function getAccessToken(scopes: readonly string[]): Promise<string> {
    if (scopes.length === 0) throw new Error('At least one Google OAuth scope is required');
    const key = [...new Set(scopes)].sort().join(' ');
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now() + 5 * 60 * 1000) return cached.accessToken;
    const inFlight = pending.get(key);
    if (inFlight) return inFlight;

    const request = (async () => {
      let subjectToken: string;
      try {
        subjectToken = await getIdToken(oidcAudience);
      } catch {
        // Never forward SDK exception messages that might contain credential material.
        throw new Error('Deno workload identity token acquisition failed');
      }
      let token;
      try {
        token = await getGoogleAccessTokenFromWif(subjectToken, config, scopes, fetchImpl);
      } catch {
        throw new Error('Google WIF token acquisition failed');
      }
      const expiresAt = Date.parse(token.expireTime);
      if (!Number.isFinite(expiresAt) || expiresAt <= now() + 5 * 60 * 1000) {
        throw new Error('Google WIF returned an invalid or nearly expired token');
      }
      cache.set(key, { accessToken: token.accessToken, expiresAt });
      return token.accessToken;
    })();
    pending.set(key, request);
    try {
      return await request;
    } finally {
      pending.delete(key);
    }
  };
}
