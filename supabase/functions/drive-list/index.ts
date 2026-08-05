// Google Drive上の指定フォルダのファイル一覧を返すEdge Function
// サービスアカウントの秘密鍵はサーバー側(Supabaseのsecrets)にのみ保持し、
// クライアント(ブラウザ)には一切渡さない。

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createSign } from "node:crypto";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  lastModifyingUser?: { displayName?: string };
  excerpt?: string;
}

async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
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

const EXCERPT_LENGTH = 140;

async function getExcerpt(fileId: string, token: string): Promise<string> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return "";
    const buf = new Uint8Array(await res.arrayBuffer());
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.slice(0, EXCERPT_LENGTH);
  } catch {
    return "";
  }
}

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req) => {
    const url = new URL(req.url);
    const folderId = url.searchParams.get("folderId");
    if (!folderId) {
      return Response.json({ error: "folderId is required" }, { status: 400 });
    }

    const rawKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    if (!rawKey) {
      return Response.json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY is not configured" }, { status: 500 });
    }
    const key: ServiceAccountKey = JSON.parse(rawKey);

    try {
      const token = await getAccessToken(key);
      const driveUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink,thumbnailLink,lastModifyingUser(displayName))&orderBy=name`;
      const res = await fetch(driveUrl, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        return Response.json({ error: data }, { status: res.status });
      }

      const files: DriveFile[] = data.files ?? [];
      const withExcerpts = await Promise.all(
        files.map(async (f) => {
          if (f.mimeType !== "application/pdf") return f;
          const excerpt = await getExcerpt(f.id, token);
          return { ...f, excerpt };
        }),
      );

      return Response.json({ files: withExcerpts });
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
  }),
};
