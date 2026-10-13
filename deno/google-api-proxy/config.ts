import type { GoogleWifConfig } from '../../supabase/functions/_shared/google-wif.ts';

type Environment = Record<string, string | undefined>;
const PROVIDER_RESOURCE = /^projects\/\d+\/locations\/global\/workloadIdentityPools\/[a-z0-9-]+\/providers\/[a-z0-9-]+$/;

/** Accept explicit configuration or Deno Cloud Connections, never credential files. */
export function wifConfigFromEnv(env: Environment): GoogleWifConfig {
  const provider = env.GCP_WORKLOAD_PROVIDER_ID;
  if (provider !== undefined && !PROVIDER_RESOURCE.test(provider)) {
    throw new Error('GCP_WORKLOAD_PROVIDER_ID must be a Google WIF provider resource');
  }
  const cloudAudience = provider === undefined ? undefined : `//iam.googleapis.com/${provider}`;
  const explicitAudience = env.GOOGLE_WIF_AUDIENCE;
  const explicitEmail = env.GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL;
  const cloudEmail = env.GCP_SERVICE_ACCOUNT_EMAIL;
  if (cloudAudience !== undefined && explicitAudience !== undefined && cloudAudience !== explicitAudience) {
    throw new Error('Conflicting Google WIF provider configuration');
  }
  if (cloudEmail !== undefined && explicitEmail !== undefined && cloudEmail !== explicitEmail) {
    throw new Error('Conflicting Google WIF service account configuration');
  }
  const audience = cloudAudience ?? explicitAudience ?? '';
  const serviceAccountEmail = cloudEmail ?? explicitEmail ?? '';
  if (!audience.startsWith('//iam.googleapis.com/') || !PROVIDER_RESOURCE.test(audience.slice('//iam.googleapis.com/'.length))) {
    throw new Error('A canonical Google WIF provider audience is required');
  }
  if (!/^[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(serviceAccountEmail)) {
    throw new Error('A Google service account email is required');
  }
  return { audience, serviceAccountEmail };
}
