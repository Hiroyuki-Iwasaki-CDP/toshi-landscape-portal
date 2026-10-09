# Cloud Run 鍵レス Google API プロキシ

状態（2026-10-09）: 追加費用ゼロというユーザーの条件により、このCloud Run案は採用保留。新規リソースの作成・公開は行わない。代わりに [Deno Deploy FreeのWIF検証案](./zero-additional-cost-wif.md) を参照する。以下の構成・IDは以前の案であり、デプロイ済み環境を表さない。

## 目的

Supabase hosted Edge Functions に Google WIF 用の ambient workload token がない制約を回避し、Google サービスアカウント JSON 鍵を廃止する。

Cloud Run に付与した専用サービスアカウントは、Google metadata server から Google 管理の短期 token を取得する。その token で IAM Service Account Credentials API を呼び、Drive / Sheets の read-only scope に限定した1時間の OAuth access token を生成する。秘密鍵の生成、保存、ローテーションは行わない。

```text
Browser
  → Supabase Edge Function
      → x-proxy-secret（専用・ローテーション可能）
          → Cloud Run google-api-proxy
              → Google metadata identity
                  → IAM Credentials generateAccessToken（1時間）
                      → Drive / Sheets API（read-only）
```

## 防御境界

- Cloud Run は専用共有 secret が一致するリクエストだけを処理する。
- secret は Google Secret Manager と Supabase Edge Function Secrets にだけ保存する。
- Drive folder ID と spreadsheet ID は Cloud Run の allowlist に一致するものだけ許可する。
- Google access token、metadata token、共有 secret はレスポンスやログへ出さない。
- 専用サービスアカウントには project role を付与しない。
- サービスアカウント自身に対する `roles/iam.serviceAccountTokenCreator` だけを付与し、scope 付き短期 token を生成する。
- Drive / Sheets の実データは対象ファイルだけをサービスアカウントへ「閲覧者」で共有する。

## 個人検証環境

- Google Cloud project: `test0805`
- Project ID: `test0805-504602`
- Project number: `972004424723`
- Organization: なし
- Region: `asia-northeast1`
- Cloud Run service: `toshi-google-api-proxy`
- Service account: `toshi-portal-reader@test0805-504602.iam.gserviceaccount.com`

## 許可する検証データ

- Drive folder: `1GnlhzaoB-6NOLJqjoeNM8QuXFUdl21c6`
- AppSheet test spreadsheet: `1VBsbj-HAxIPb3yVXi_9A3IzZ7nRnWKd7_ytX1dXjqJ4`
- Handover notes spreadsheet: `1MEl1gGQsdXcaPrOQVSmB_g6XfIFwt6fy3hYkjPaILqw`

追加する場合は、コードだけでなく Cloud Run の allowlist と Google Drive 共有設定の両方を更新する。

## 必要な API

- Cloud Run Admin API: `run.googleapis.com`
- Cloud Build API: `cloudbuild.googleapis.com`
- Artifact Registry API: `artifactregistry.googleapis.com`
- IAM Service Account Credentials API: `iamcredentials.googleapis.com`
- Secret Manager API: `secretmanager.googleapis.com`
- Google Drive API: `drive.googleapis.com`
- Google Sheets API: `sheets.googleapis.com`

## Supabase 切替

両 Edge Function は次の2変数がそろったときだけ Cloud Run を使用する。

- `GOOGLE_API_PROXY_URL`
- `GOOGLE_API_PROXY_SECRET`

未設定なら既存の `GOOGLE_SERVICE_ACCOUNT_KEY` 方式へフォールバックする。実接続テスト完了後にだけ JSON key secret を削除する。

## 検証順序

1. Cloud Run `/health` を確認する。
2. secret なしの API 呼び出しが `401` になることを確認する。
3. allowlist 外 ID が `403` になることを確認する。
4. Cloud Run から許可済み Drive / Sheets を取得する。
5. Supabase Edge Function に proxy URL と secret を設定する。
6. 既存画面から Drive / Sheets の結果が変わらないことを確認する。
7. access token の期限後も再取得できることを確認する。
8. `GOOGLE_SERVICE_ACCOUNT_KEY` を削除し、再度確認する。

## ロールバック

検証中は `GOOGLE_SERVICE_ACCOUNT_KEY` を残す。`GOOGLE_API_PROXY_URL` または `GOOGLE_API_PROXY_SECRET` を削除すると、既存方式へ戻る。Cloud Run 経路が安定し、JSON key 削除後の確認まで終わった時点でフォールバックコード自体の削除を別コミットで行う。
