# GitHub Actions WIF 検証

確認日: 2026-10-06

## 検証の目的

GitHub Actions が実行ごとに発行する短期 OIDC token を Google Security Token Service で交換し、専用サービスアカウントを偽装して、Google Drive API と Google Sheets API を読み取り専用 scope で呼び出せることを確認する。

この検証は、サービスアカウント JSON 鍵、長期 access token、人間の定期再ログインを使用しない。ただし、GitHub Actions の OIDC token を取得できない Supabase hosted Edge Functions が同じ方式を直接利用できることを証明するものではない。

## 確認済みの対象

- GitHub repository: `Hiroyuki-Iwasaki-CDP/toshi-landscape-portal`
- Repository visibility: public
- Immutable repository ID: `1322703484`
- Immutable owner ID: `179184714`
- Test branch: `wif-test`
- Google Cloud project ID: `test0805-504602`
- Google Cloud project number: `972004424723`
- Organization: none
- Cloud Billing: billing account not linked

## 課金に関する停止条件

Google の deployment pipeline 向け WIF 公式手順は、作業開始条件として「プロジェクトで課金が有効であること」を要求している。現在の `test0805-504602` は請求先アカウントにリンクされていないため、公式手順の前提を満たしていない。

IAM API の利用自体は無料で、公開 repository の標準 GitHub-hosted runner も無料である。しかし、請求先アカウントのリンクは将来の課金を可能にする状態変更なので、この検証では自動的に行わない。請求先をリンクしない限り、実環境 WIF 作成と疎通試験は未実施とする。

## 準備済みの workflow

`.github/workflows/wif-smoke-test.yml` は手動実行だけを許可し、さらに `refs/heads/wif-test` 以外では job を実行しない。

必要な GitHub Actions repository variables:

- `GOOGLE_WIF_AUDIENCE`
- `GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_SHEET_ID`

これらは秘密鍵や token ではない。workflow は GitHub OIDC token、Google STS token、Google OAuth access token、Drive file ID、Sheet ID、ファイル名、シート内容をログへ出力しない。

## Google Cloud 側の最小構成

請求先リンクを別途承認した場合にだけ、以下を作成する。

1. 専用 Workload Identity Pool
2. GitHub OIDC provider (`https://token.actions.githubusercontent.com`)
3. Drive / Sheets 読み取り専用の専用サービスアカウント
4. repository ID `1322703484` だけを対象にした `roles/iam.workloadIdentityUser` binding

Provider の attribute condition は、少なくとも次のすべてに一致させる。

```text
assertion.repository_id == '1322703484' &&
assertion.repository_owner_id == '179184714' &&
assertion.ref == 'refs/heads/wif-test'
```

repository 名や owner 名は変更可能なので、認可境界には不変の数値 ID を使う。`google.subject` には GitHub OIDC の `assertion.sub` を対応させ、IAM binding には `attribute.repository_id` を使う。

## 必要権限

検証環境の構築者にはプロジェクト上で次が必要。

- Workload Identity Pool Admin (`roles/iam.workloadIdentityPoolAdmin`)
- Service Account Admin (`roles/iam.serviceAccountAdmin`)
- Service Usage Admin (`roles/serviceusage.serviceUsageAdmin`) または同等の `serviceusage.services.enable`

GitHub Actions の外部 principal に付与するのは、対象サービスアカウント上の Workload Identity User (`roles/iam.workloadIdentityUser`) だけに限定する。プロジェクト全体への Owner、Editor、Token Creator は付与しない。

Google Drive / Sheets のファイル共有も専用サービスアカウントへ閲覧者として個別に付与し、ドメイン全体の委任は使用しない。

## 公式資料

- [Google Cloud: Configure Workload Identity Federation with deployment pipelines](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Google Cloud: Workload Identity Federation best practices](https://docs.cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation)
- [Google Cloud: IAM pricing](https://cloud.google.com/iam/pricing)
- [Google Cloud: Verify billing status](https://docs.cloud.google.com/billing/docs/how-to/verify-billing-enabled)
- [GitHub: OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect)
- [GitHub: Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [Google Drive API: Usage limits](https://developers.google.com/workspace/drive/api/guides/limits)
- [Google Sheets API: Usage limits](https://developers.google.com/workspace/sheets/api/limits)
