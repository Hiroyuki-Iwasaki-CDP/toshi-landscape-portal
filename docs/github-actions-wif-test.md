# GitHub Actions WIF 検証

確認日: 2026-10-09

## 実環境の結果

2026-10-09、[実行 37888399337](https://github.com/Hiroyuki-Iwasaki-CDP/toshi-landscape-portal/actions/runs/37888399337) が成功した（commit `5c24eb9`）。同じ job 内の独立した2プロセスで、それぞれ新しい GitHub OIDC token を取得し、STS交換・サービスアカウント偽装・Driveファイル取得・Sheetsメタデータ取得・既知セル値の一致まで成功した。

専用サービスアカウントにはユーザー管理の秘密鍵がなく、project-level IAM role もない。WIF principal へ対象サービスアカウント上の `roles/iam.workloadIdentityUser` のみを付与した。組織の作成・設定変更、ドメイン全体の委任は使用していない。

検証対象は個人Driveに作成した専用シート1件で、サービスアカウントに reader で共有した。親フォルダは共有していないため、最初の親フォルダ指定一覧試験は空結果となって失敗した。成功した最終試験は Drive `files.get` で共有ファイルを直接取得する。フォルダ一覧取得や既存ポータルのデータ取得は、この成功の検証範囲に含まない。

短期トークンの独立した再取得は確認済みだが、1時間の期限を越える連続稼働・長期耐久試験・Supabase本番稼働・Cloud Run本番稼働は未実施。初期構築のCLIユーザー認証は実行時のWIF処理に使われない。

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
- Cloud Billing: billing enabled（ユーザーがカード登録・請求先リンクを実施、CLIでも確認）

## 課金に関する停止条件

Google の deployment pipeline 向け WIF 公式手順は、作業開始条件として「プロジェクトで課金が有効であること」を要求している。2026-10-09 にユーザーがリンクし、この前提を満たした。

IAM API の利用自体は無料で、公開 repository の標準 GitHub-hosted runner も無料である。今回 Cloud Run やその他の有料実行サービスは作成・デプロイしていない。請求先リンク済みという事実だけで、今後の別サービスまで無料と判断しない。

## 準備済みの workflow

`.github/workflows/wif-smoke-test.yml` は手動実行と `wif-test` 上の検証コード変更による push 実行に対応し、`refs/heads/wif-test` 以外では job を実行しない。workflow が default branch に存在しない段階でも push で検証できる。本番デプロイworkflowは起動しない。

必要な GitHub Actions repository variables:

- `GOOGLE_WIF_AUDIENCE`
- `GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_DRIVE_FILE_ID`（今回の単一ファイル検証）または `GOOGLE_DRIVE_FOLDER_ID`（共有済みフォルダ内の非空一覧を検証）
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_TEST_RANGE` と `GOOGLE_SHEET_EXPECTED_VALUE`（任意。両方指定して既知セル値を照合）

これらは秘密鍵や token ではない。GitHubのstep環境表示にはこの非秘密の設定値が表示される。script は GitHub OIDC token、Google STS token、Google OAuth access token、およびAPIから返されたファイル名・シート内容をログへ出力しない。認証エラーレスポンス本文も出力しない。

## Google Cloud 側の最小構成

ユーザーの承認済み個人プロジェクトに、以下を作成した。

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
