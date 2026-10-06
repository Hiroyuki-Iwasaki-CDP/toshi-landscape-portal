interface ProxyConfig {
  url: string;
  secret: string;
}

export function getGoogleApiProxyConfig(): ProxyConfig | null {
  const url = Deno.env.get("GOOGLE_API_PROXY_URL")?.replace(/\/$/, "");
  const secret = Deno.env.get("GOOGLE_API_PROXY_SECRET");
  return url && secret ? { url, secret } : null;
}

export async function callGoogleApiProxy(
  config: ProxyConfig,
  path: string,
  searchParams: URLSearchParams,
): Promise<Response> {
  return await fetch(`${config.url}${path}?${searchParams}`, {
    headers: { "x-proxy-secret": config.secret },
  });
}
