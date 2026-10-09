import { getIdToken, supportsIssuingIdTokens } from '@deno/oidc';
import { configFromEnv, createHandler } from '../../cloud-run/google-api-proxy/server.mjs';
import { createDenoWifTokenProvider } from './google-token.ts';

if (!supportsIssuingIdTokens()) {
  throw new Error('This service requires Deno Deploy runtime workload identity');
}

const serviceAccountEmail = Deno.env.get('GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL') ?? '';
const config = configFromEnv({
  PROXY_SHARED_SECRET: Deno.env.get('PROXY_SHARED_SECRET'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: serviceAccountEmail,
  ALLOWED_DRIVE_FOLDER_IDS: Deno.env.get('ALLOWED_DRIVE_FOLDER_IDS'),
  ALLOWED_SPREADSHEET_IDS: Deno.env.get('ALLOWED_SPREADSHEET_IDS'),
});
const getAccessToken = createDenoWifTokenProvider({
  config: { audience: Deno.env.get('GOOGLE_WIF_AUDIENCE') ?? '', serviceAccountEmail },
  getIdToken,
});

Deno.serve(createHandler(config, { getAccessToken }));
