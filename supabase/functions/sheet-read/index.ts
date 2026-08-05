// Googleスプレッドシート(AppSheet連携テスト用)を読み取るEdge Function
// サービスアカウントの秘密鍵はサーバー側(Supabaseのsecrets)にのみ保持し、
// クライアント(ブラウザ)には一切渡さない。drive-listと同じ鍵(GOOGLE_SERVICE_ACCOUNT_KEY)を使う。

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createSign } from "node:crypto";

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign(key.private_key)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req) => {
    const url = new URL(req.url);
    const spreadsheetId = url.searchParams.get("spreadsheetId");
    if (!spreadsheetId) {
      return Response.json({ error: "spreadsheetId is required" }, { status: 400 });
    }

    const rawKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    if (!rawKey) {
      return Response.json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY is not configured" }, { status: 500 });
    }
    const key: ServiceAccountKey = JSON.parse(rawKey);

    try {
      const token = await getAccessToken(key);

      // シート名を取得(1枚目のシートを対象にする)
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const meta = await metaRes.json();
      if (!metaRes.ok) return Response.json({ error: meta }, { status: metaRes.status });
      const sheetName = meta.sheets[0].properties.title;

      const valuesRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z200`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await valuesRes.json();
      if (!valuesRes.ok) return Response.json({ error: data }, { status: valuesRes.status });

      const rows: string[][] = data.values ?? [];
      const [header, ...body] = rows;
      const records = body.map((row) =>
        Object.fromEntries((header ?? []).map((col, i) => [col, row[i] ?? ""])),
      );

      return Response.json({ sheetName, headers: header ?? [], records });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
  }),
};
