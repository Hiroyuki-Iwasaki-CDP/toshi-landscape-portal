import { getIdToken, supportsIssuingIdTokens } from '@deno/oidc';
import { configFromEnv, createHandler } from '../../cloud-run/google-api-proxy/server.mjs';
import { createDenoWifTokenProvider } from './google-token.ts';
import { wifConfigFromEnv } from './config.ts';

if (!supportsIssuingIdTokens()) {
  throw new Error('This service requires Deno Deploy runtime workload identity');
}

const wifConfig = wifConfigFromEnv({
  GOOGLE_WIF_AUDIENCE: Deno.env.get('GOOGLE_WIF_AUDIENCE'),
  GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL: Deno.env.get('GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL'),
  GCP_WORKLOAD_PROVIDER_ID: Deno.env.get('GCP_WORKLOAD_PROVIDER_ID'),
  GCP_SERVICE_ACCOUNT_EMAIL: Deno.env.get('GCP_SERVICE_ACCOUNT_EMAIL'),
});
const config = configFromEnv({
  PROXY_SHARED_SECRET: Deno.env.get('PROXY_SHARED_SECRET'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: wifConfig.serviceAccountEmail,
  ALLOWED_DRIVE_FOLDER_IDS: Deno.env.get('ALLOWED_DRIVE_FOLDER_IDS'),
  ALLOWED_SPREADSHEET_IDS: Deno.env.get('ALLOWED_SPREADSHEET_IDS'),
});
const getAccessToken = createDenoWifTokenProvider({
  config: wifConfig,
  getIdToken,
});

Deno.serve(createHandler(config, { getAccessToken }));
