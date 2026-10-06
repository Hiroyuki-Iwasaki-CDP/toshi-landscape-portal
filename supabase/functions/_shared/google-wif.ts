const STS_TOKEN_URL = "https://sts.googleapis.com/v1/token";
const IAM_CREDENTIALS_URL = "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts";

const TOKEN_EXCHANGE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:token-exchange";
const ACCESS_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:access_token";
const JWT_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:jwt";
const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

export interface GoogleWifConfig {
  /** //iam.googleapis.com/projects/.../providers/... */
  audience: string;
  serviceAccountEmail: string;
}

interface StsTokenResponse {
  access_token?: string;
}

interface ImpersonatedTokenResponse {
  accessToken?: string;
  expireTime?: string;
}

export interface GoogleAccessToken {
  accessToken: string;
  expireTime: string;
}

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function validateConfig(config: GoogleWifConfig): void {
  if (!config.audience.startsWith("//iam.googleapis.com/projects/")) {
    throw new Error("GOOGLE_WIF_AUDIENCE must be a canonical workload identity provider resource name");
  }
  if (!config.serviceAccountEmail.endsWith(".iam.gserviceaccount.com")) {
    throw new Error("GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL must be a service account email address");
  }
}

async function readGoogleError(response: Response, operation: string): Promise<Error> {
  let message = "";
  try {
    const body = await response.json() as {
      error?: string | { message?: string };
      error_description?: string;
    };
    message = typeof body.error === "string"
      ? body.error_description ?? body.error
      : body.error?.message ?? "";
  } catch {
    // Google occasionally returns an HTML/plain-text proxy error. Do not copy its body because
    // authentication responses must never be reflected to the caller or logs.
  }
  const suffix = message ? `: ${message.slice(0, 300)}` : "";
  return new Error(`${operation} failed (${response.status})${suffix}`);
}

/**
 * Exchanges an externally issued, short-lived OIDC JWT through Google STS and then impersonates
 * a Google service account. This module deliberately does not read a subject token from an env
 * variable: the hosting platform must supply a fresh workload token for every refresh cycle.
 */
export async function getGoogleAccessTokenFromWif(
  subjectToken: string,
  config: GoogleWifConfig,
  scopes: readonly string[],
  fetchImpl: FetchLike = fetch,
): Promise<GoogleAccessToken> {
  validateConfig(config);
  if (!subjectToken) throw new Error("A short-lived OIDC workload subject token is required");
  if (scopes.length === 0) throw new Error("At least one Google OAuth scope is required");

  const stsResponse = await fetchImpl(STS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: TOKEN_EXCHANGE_GRANT_TYPE,
      audience: config.audience,
      scope: CLOUD_PLATFORM_SCOPE,
      requested_token_type: ACCESS_TOKEN_TYPE,
      subject_token_type: JWT_TOKEN_TYPE,
      subject_token: subjectToken,
    }),
  });
  if (!stsResponse.ok) throw await readGoogleError(stsResponse, "Google STS token exchange");

  const stsData = await stsResponse.json() as StsTokenResponse;
  if (!stsData.access_token) throw new Error("Google STS response did not include an access token");

  const serviceAccount = encodeURIComponent(config.serviceAccountEmail);
  const impersonationResponse = await fetchImpl(
    `${IAM_CREDENTIALS_URL}/${serviceAccount}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stsData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: [...scopes], lifetime: "3600s" }),
    },
  );
  if (!impersonationResponse.ok) {
    throw await readGoogleError(impersonationResponse, "Service account impersonation");
  }

  const tokenData = await impersonationResponse.json() as ImpersonatedTokenResponse;
  if (!tokenData.accessToken || !tokenData.expireTime) {
    throw new Error("Service account impersonation response was incomplete");
  }
  return { accessToken: tokenData.accessToken, expireTime: tokenData.expireTime };
}
