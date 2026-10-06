# Supabase Edge Functions → Google WIF 検証結果

調査日: 2026-10-06

## 結論

Google 側の `WIF → サービスアカウント偽装 → Drive / Sheets API` は、JSON サービスアカウント鍵なし、1 時間の短期アクセストークン自動取得で成立する。

ただし、現在の Supabase hosted Edge Functions には、Function 自身を表し Google STS が検証できる短期 OIDC トークン（ambient workload credential）が提供されていない。したがって、**現在の構成のまま `GOOGLE_SERVICE_ACCOUNT_KEY` を WIF に置き換えることは成立しない**。

このブランチには STS とサービスアカウント偽装を行う、秘密鍵を扱わない共通モジュールとモックテストを追加した。ただし安全な subject token の自動取得元がないため、`drive-list` / `sheet-read` には接続していない。静的 subject token を Supabase Secret に保存する実装は、有効期限切れまたは別の長期秘密への置換になるため採用しない。

## 現行コードの調査

- `supabase/functions/drive-list/index.ts`
  - `GOOGLE_SERVICE_ACCOUNT_KEY` から `client_email` と RSA `private_key` を読む。
  - `drive.readonly` scope の JWT を自己署名し、Google OAuth token endpoint で 1 時間の access token に交換する。
- `supabase/functions/sheet-read/index.ts`
  - 同じ秘密鍵で `spreadsheets.readonly` scope の JWT を自己署名する。
- 両 Function は `verify_jwt = false` かつ `withSupabase({ auth: ["publishable"] })`。
- フロントエンドは publishable key を `apikey` と `Authorization` の両方で送る。Supabase Auth の利用者 JWT は使っておらず、画面のログインは `sessionStorage` の擬似ログインである。

最後の2点は WIF とは別の問題である。公開用キーを知る任意の呼び出し元が Function を実行できるので、本番化前に Function 認証と対象 folder / spreadsheet の allowlist が必要になる。

## WIF が要求する入口

Google STS の WIF token exchange は、外部 IdP が発行した OIDC JWT、SAML assertion、AWS credentials などを `subject_token` として要求する。OIDC の場合、少なくとも次が必要になる。

- 実行中の workload が短期 token を自動取得できること
- 公開 discovery / JWKS で Google が署名を検証できること（または pool に JWKS を登録）
- token が workload を一意に表す immutable claim を持つこと
- `aud` が provider 用 audience であること（custom allowed audience も構成可能）
- `exp - iat` が最大 24 時間であること

Supabase の組み込み環境変数 `SB_EXECUTION_ID` は UUID であり署名付き token ではない。publishable / secret API key も Function 自身の OIDC token ではない。Supabase の新 API key から内部で生成される短期 JWT はアプリから取得できないと公式ドキュメントに明記されている。

## 利用者 JWT を subject token にしない理由

Supabase Auth の非対称署名 JWT は公開 JWKS で検証できるため、形式上は Google WIF provider の subject token にできる。しかし現在のアプリは Supabase Auth を使っていない。将来導入しても、利用者 JWT にサービスアカウント偽装を許す IAM binding を付けると、その利用者は Edge Function を経由せず Google STS を直接呼べる。Drive / Sheets の権限境界が Function の実装ではなく利用者へ広がるため、このポータルのバックエンド workload identity としては採用しない。

## Google 側で成立する後半のフロー

安全な workload subject token を取得できる環境なら、追加した `_shared/google-wif.ts` は次を行う。

1. `POST https://sts.googleapis.com/v1/token`
2. external OIDC JWT を federated access token に交換
3. `POST https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/{email}:generateAccessToken`
4. `drive.readonly` または `spreadsheets.readonly` を scope に指定
5. 既定上限の 1 時間で期限切れになる access token を取得

access token、federated token、subject token はログやレスポンスへ出さない。

## 必要権限（組織管理者は原則不要）

個人 Google Cloud project での初期構築には project scope で次が必要になる。

- Workload Identity Pool Admin: `roles/iam.workloadIdentityPoolAdmin`
- Service Account Admin: `roles/iam.serviceAccountAdmin`
- API 有効化に必要な Service Usage 権限（通常 `roles/serviceusage.serviceUsageAdmin`）
- WIF principal には対象サービスアカウント上だけで Workload Identity User: `roles/iam.workloadIdentityUser`
  - `iam.serviceAccounts.getAccessToken` を含む

Drive / Sheets の実データ権限は Google Cloud project IAM role ではなく、対象フォルダ / スプレッドシートを専用サービスアカウントのメールアドレスへ閲覧共有して付与する。Domain-Wide Delegation は不要で、Google Workspace のスーパー管理者権限も不要である。

組織 project では、外部 IdP / Workload Identity Pool を禁止・制限する Organization Policy がある場合だけ、組織ポリシー管理者による変更が必要になる。個人環境での成功だけでは組織環境で利用可能とは判断しない。

## 安全に成立させる選択肢

### 推奨: Google Cloud 上へ Google API 用バックエンドを置く

Drive / Sheets へのアクセス部分を Cloud Run 等へ移し、Google 管理の attached service account を使う。サービスアカウント JSON 鍵と WIF subject token の双方が不要になる。Supabase から Cloud Run を安全に呼ぶ認証境界は別途設計が必要で、公開 endpoint にはしない。

この代替案の実装と検証手順は [`cloud-run-keyless-google-api.md`](./cloud-run-keyless-google-api.md) に記録した。専用共有 secret、対象 ID の allowlist、Google 管理の短期 token を組み合わせ、既存 JSON key 方式は検証完了までフォールバックとして残す。

### WIF を必須にする場合

Function ごとの OIDC token を自動発行できる実行基盤へ Google API 用バックエンドを移す（GitHub Actions の OIDC は CI 実行中だけなので、常時 API バックエンドの identity には使えない）。その token をこのブランチの共通モジュールへ渡す。

### 非推奨

- 固定 OIDC JWT を Supabase Secret に置く
- 自前署名用 private key を Supabase Secret に置く
- Supabase 利用者 JWT をサービスアカウント偽装へ直接結び付ける
- 認証なし Cloud Run / token broker を公開する

いずれも、鍵レス化の目的を失うか、Function を迂回したアクセスを許す。

## 公式資料

- [Google Cloud: Workload Identity Federation overview](https://docs.cloud.google.com/iam/docs/workload-identity-federation)
- [Google Cloud: Configure WIF with other identity providers](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-other-providers)
- [Google Cloud: STS token method](https://docs.cloud.google.com/iam/docs/reference/sts/rest/v1/TopLevel/token)
- [Google Cloud: `generateAccessToken`](https://docs.cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/generateAccessToken)
- [Google Cloud: WIF best practices](https://docs.cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation)
- [Supabase: Edge Functions environment variables](https://supabase.com/docs/guides/functions/secrets)
- [Supabase: Edge Functions authentication](https://supabase.com/docs/guides/functions/auth)
- [Supabase: JWTs and JWKS](https://supabase.com/docs/guides/auth/jwts)
- [Supabase: User sessions](https://supabase.com/docs/guides/auth/sessions)
- [Google Sheets API scopes](https://developers.google.com/workspace/sheets/api/scopes)
