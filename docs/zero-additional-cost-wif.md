# 追加費用なしでのWIF接続案

調査日: 2026-10-09。追加費用ゼロを必須条件とし、有料サービスの作成やデプロイは行っていない。

## 優先して個人検証する案

```text
既存Supabase Edge Functions
  -> 専用共有シークレットで呼び出し
  -> Deno Deploy Free のGoogle API用プロキシ
  -> Deno実行環境の短期OIDC（5分）
  -> Google STS / サービスアカウント偽装
  -> Drive / Sheets 読み取り専用API
```

これはSupabase自身からの直接WIFではない。Google API処理だけを、実行中のworkload OIDCを発行できる環境へ置く構成である。Google側は既存のWIF交換モジュールを再利用する。JSON秘密鍵、固定OIDC、Google refresh token、Google access tokenを保存しない。Supabaseからの呼び出し認証用シークレットは両実行環境のsecret設定に保持するため、あらゆる秘密情報が不要になる構成ではない。

## 公式情報で確認した費用・認証条件

| 条件 | 確認結果 | 残る実機確認 |
| --- | --- | --- |
| 実行環境のOIDC | Deno公式は全実行アプリで短期OIDCを発行できると説明。`@deno/oidc` の `getIdToken(audience)` を使用 | 個人Freeアプリで実際に取得できるか |
| 月額 | Freeは月額$0 | 個人検証organizationのBilling画面がFreeであること |
| 超過時 | 公式changelogはFreeのrequests/bandwidth/CPU/memory超過時に次の課金周期までアプリ停止、Proでは超過課金と説明 | 現在の利用画面・契約でも同条件か。Pro/Builderに切り替えない |
| カード | 未登録時は制限されたFree枠のみと公式に記載 | カード登録なしで必要なテストができるか。制限の具体値は未確認 |
| Google IAM | IAM API利用は無料 | 新たなGoogle有料リソースを一切追加しない |
| Drive API | 現行公式は無料の日次閾値と、2026年後半の閾値超過課金予定を説明。恒久無料とは扱わない | 個人projectの適用quota、課金開始条件、閾値未満で強制停止できる設定を確認。通知予算だけでは不十分 |
| Sheets API | 公式の利用上限説明では追加API利用料金なし、上限時はAPIエラー | 呼び出し量と上限に収まること |
| 既存Supabase | 現行の呼び出し窓口を維持 | 契約プラン・残り枠・spend cap未確認。既存枠内に収めること |

料金ページにはFreeの月100万requests・20GiB egress等が掲載されているが、カード未登録の制限枠をその数値と同一視しない。無料枠超過時は可用性を失う設計であり、無料の無制限稼働や将来にわたる価格の固定は保証しない。

FreeプランでのWIF実測が終わるまでは「追加費用ゼロで運用成立」とは判断しない。カード登録、有料契約、有料リソース追加、無料枠を増やすための課金は今回の許可に含めない。

2026-10-09再確認: Drive公式は2026-05-01以降の新project向けquota変更、日次400,000,000 quota unitsの無料閾値、日次1TB egress閾値を掲載している。課金詳細は2026年後半、少なくとも90日前の通知を予定している。したがってDeno Freeだけを確認しても経路全体の費用ゼロは確定しない。Google側の実quotaと有効な強制上限を確認するまで本番運用へ移行しない。

Supabase公式ではFreeは課金なし、ProのSpend CapはEdge Function InvocationsとEgress等を対象とするが、Computeや各種add-onは対象外。Spend Capがあるだけで全費用が固定されるとは判断しない。今回のために有料projectやbranchを追加しない。

## 用意した実装

### 個人管理画面での確認（2026-10-11）

ログイン済みorganization `halh0328` のBilling画面で、Free Plan / $0 per month、未verificationのため通常Free枠の1%であることを確認した。表示上限はHTTP requests 10k、CPU 0.1h、Memory 1.5GiB·h、Outbound 0.2GiB。アプリは0/5。カード登録や有料変更は実施していない。

組織作成ボタンはslug使用済みエラーになったが、Homeに戻ると同slugの管理画面にアクセスできたため、重複組織は作成していない。GitHubアカウント連携とDeno Deploy GitHub Appのインストールはユーザー操作で完了した。初回の設定確認ではAll repositoriesが選択されていた。アプリ権限はmetadata/PRの読み取り、actions/administration/code/commit statuses/deployments/workflowsの読み書き。ユーザー承認を得て対象をtoshi-landscape-portalだけへ絞るよう案内し、ユーザーから保存成功の報告があり、setup_action=updateのInstall Success画面も確認した。ただし保存後の対象一覧は画面取得不調のため再確認できていない。Denoアプリ作成・runtime OIDCの実測は未実施。

- `deno/google-api-proxy/main.ts`: Deno Deploy runtime OIDCを使用する起動点。OIDCが使えない環境では起動を拒否する。
- `deno/google-api-proxy/google-token.ts`: OIDC -> STS -> read-only scopeのGoogle token。期限5分前から再取得し、同じscopeの同時取得をまとめる。エラー本文を返さない。
- `deno.json`: `@deno/oidc@0.1.0` と既存実装と同じ `unpdf@1.8.1` を固定。
- `cloud-run/google-api-proxy/server.mjs`: ファイル名は従来のままだがHTTP処理を共用。Denoの起動点からWIF token providerを注入し、Cloud Run metadata endpointを呼ばない。
- `tests/deno-wif.test.mjs`: 模擬時計で更新を確認。同時取得、失敗後再試行、無効期限、認証拒否、allowlist、Sheetsレスポンス互換性を検証。

`GOOGLE_SERVICE_ACCOUNT_KEY` を読む既存本番経路は変更しない。実環境での比較が終わった後、検証用Supabaseの `GOOGLE_API_PROXY_URL` / `GOOGLE_API_PROXY_SECRET` で切り替える。

### 検証アプリ作成（2026-10-11）

ユーザーがFree Regionsで `toshi-wif-test` を作成した。起動設定はDynamic / `deno/google-api-proxy/main.ts`。初回ビルド `vq9t0xg49vaw` は既定ブランチmasterのcommit `6eada55342561dda410f8f0c88f34ac365042c6d` を使用し、Entrypoint not foundで失敗。画面上にpreview URLなし、timelineなしを確認した。停止操作中にCancelがRetryへ切り替わり、masterの再試行 `1bch1tvm0c2n` が発生したため、それ以上再試行しない。wif-testの選択と検証専用環境変数、GoogleのDeno用信頼設定は未完了。WIF実機成功とは扱わない。

その後、ブランチ選択に伴ってwif-testのbuild `swtrph6w1bwp`（commit `d70f0f6a4a1b2c6dab1c71bd642f0fed10b7566d`）が開始した。npm installは成功したが、entrypointの依存解決でunpdfがnode_modulesにないため失敗。preview URL/timelineなし。Google認証や実行時OIDCには到達していない。ブランチ選択をビルド非実行の操作として案内してはいけない。

ローカルでDenoのnpm解決を `nodeModulesDir: none` に明示し、deploy.installをentrypoint対象の `deno install --frozen` に変更した。また共有ハンドラのBufferをnode:bufferから明示importした。Deno lockfileにnpmのintegrityを記録し、Deno型チェック、Nodeの17件、Denoでの6件のモックテストが成功。git管理ファイルのみを一時ディレクトリへコピーし、node_modulesがない状態でもfrozen install/cacheとDenoの6件が成功した。レジストリキャッシュは再利用したため、ネットワークを含む完全な空キャッシュの再現試験とは区別する。これらは未push・未デプロイであり、実行時OIDCとGoogleの信頼設定・環境変数は未検証。リンク済みアプリへのpushはビルドを誘発しうるため、準備が終わるまでpush・Retryしない。

## 環境変数（実値はリポジトリに保存しない）

2026-10-11追記: Deno Cloud Connectionsを保存したcontextでは、公式仕様の `GCP_WORKLOAD_PROVIDER_ID` / `GCP_SERVICE_ACCOUNT_EMAIL` も読み取る。provider resource名からcanonical audienceを生成する。手動の `GOOGLE_WIF_*` と併用する場合は一致を必須とし、食い違い・空値・不正形式では起動を拒否する。`GOOGLE_APPLICATION_CREDENTIALS` のファイルやJSON秘密鍵へフォールバックしない。設定値そのものをエラーに含めない。Denoの型チェックと9件のモックテストは成功。クラウドへのpush・デプロイは未実施。

- `PROXY_SHARED_SECRET`: 十分なランダム性を持つ32文字以上の専用シークレット。ブラウザへ渡さない。
- `GOOGLE_WIF_AUDIENCE`: `//iam.googleapis.com/projects/<number>/locations/global/workloadIdentityPools/<pool>/providers/<provider>`。
- `GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL`: 検証専用サービスアカウント。
- `ALLOWED_DRIVE_FOLDER_IDS`: 個人検証用の閲覧共有済みフォルダのID。対象を限定する。
- `ALLOWED_SPREADSHEET_IDS`: 個人検証用シートID。

### CLI認証の検証と後片付け（2026-10-11）

ユーザーが公式CLIのブラウザ承認を一時的に許可し、`apps get --json` でアプリの固定IDを取得した。組織ID・Preview context IDは未取得。CLIはkeychainへの保存に失敗し、認証情報はそのプロセス限りで、処理終了した。ただしこれはサーバー側の失効を意味しない。

CLIソースが案内する `/account/tokens` は現行consoleで404となった。実際のユーザーメニューのAccount settings (`/account`) にはPersonal access tokensとSessionsがあり、今回のCLI認証はPATではなくdeviceセッションとして表示された。ユーザーが該当deviceセッションをRevokeした後、device行が消え、既存webセッション3件だけが残ることを読み取りで確認した。追加の認証やPAT作成は行わない。請求設定・プラン・本番環境は変更していない。

GoogleのDeno用pool/provider作成ウィザードとDenoのPreview-only Cloud Connectionは未保存のまま。その後、取得済みの固定 `app_id` の一致条件をslug/context名の条件へ追加し、画面の値とウィザード前段から戻った後の値を確認した。poolは `deno-deploy-test`、providerは `toshi-portal`、issuerは `https://oidc.deno.com`、default audience、JWKSアップロードなし。まだ保存・SA権限付与は実施していない。

この段階では固定app IDで別アプリ・同名再作成を拒否し、Preview contextは名前で制限する。これは下記のorg/app/context全固定IDの最終案とは区別する。pool/providerの保存だけではDrive/Sheetsのアクセス権は付与されない。Google側の信頼リソースの保存と、SA上のWorkload Identity User付与は別の承認操作として扱い、SA権限付与・本番利用の前に固定IDの残りの確認方針を決める。

その後、ユーザーが上記内容を確認して問題なければ保存することを明示承認したため、表示中のproject・属性マッピング・4条件を再照合して保存ボタンを1回押した。作成中表示の後、URLとウィンドウタイトルが `deno-deploy-test` のプール詳細へ移動した。ただし本文の画面取得は旧作成画面のままで、その後の詳細URL再読み込みでは本文を取得できなかった。したがって保存リクエストの実行・詳細URLへの遷移までは確認済みだが、保存済みproviderの状態・条件のread-backは未完了。保存を再送しない。SA権限付与・Deno接続保存・push・デプロイは実施していない。次はプール詳細を読み取り確認し、保存値が一致するまで権限付与へ進まない。

ユーザーが詳細画面の表示を報告した後、読み取りが復旧した。`deno-deploy-test` のID・説明・有効状態、およびDeno Deploy / OIDC / 有効のprovider行を確認し、保存の成立を確認できた。provider編集ボタンの操作は画面が変化せず、座標操作も画面操作エラーとなったため、provider内部のissuer・mapping・conditionの再読込照合はまだ未完了。プールとproviderが有効であることだけをGoogle API接続成功と扱わない。

その後、provider編集画面がすでに開いていることを確認し、保存済みissuer `https://oidc.deno.com`、default audience、`google.subject = assertion.sub`、`attribute.full_slug = assertion.org_slug + "/" + assertion.app_slug` と、固定app ID・org slug・app slug・Previewの4条件のread-backが完了した。再保存はしていない。SA権限付与とDeno Cloud Connection保存はまだ行っていない。

次の個人限定の接続検証では、この固定app IDとPreview限定のcondition、およびSA上の単一subjectへのWorkload Identity User付与を用いる。Deno公式Cloud Connectionsも環境単位のsubject bindingを案内している。固定app IDにより同名別アプリ・同名再作成は拒否する。固定org ID/context IDは未取得であり、全UUID固定の下記本番向け案を達成済みとは扱わない。SAに既に閲覧共有された個人テスト用シートのみを対象とし、業務データや本番への承認とは区別する。権限付与は別途その時点でのユーザー承認を必須とする。

Deno接続画面でPreviewのみ選択（Production/Build/Local/Allは未選択）、provider IDとSAメールの入力値をread-backした。権限付与前にTest connectionを1回実行したが、取得できた画面ではTesting connectionのままで、成功・拒否の結果は未確認。Create connectionは押していない。Googleのサービスアカウント一覧へ移動したところ、ブラウザURLは一覧へ変わったが本文の取得が旧プール画面で止まり、再読み込み1回でも取得状態は更新しなかった。古い本文の要素でIAM操作を進めず停止。SA権限の変更は行っていない。ローカルNode20件、Deno9件、Deno型チェックを再実行して成功した。

ユーザーによる画面更新後、サービスアカウント一覧の取得が復旧し、検証専用 `toshi-portal-wif-reader` が有効・キーなしであることを再確認した。他の鍵付きアカウントは変更していない。検証専用SAの詳細リンクへ移動したが、タイトルとURLだけが詳細へ変わり、本文は旧一覧のままになった。詳細URLの再読み込み1回後は本文を取得できなくなり、Chromeの表示復帰を試みる操作もタイムアウトした。IAM権限の変更・新しいキー作成は行っていない。詳細本文が読めるまで既存のIAM状態を推測して権限付与しない。

その後、アクセス権を持つプリンシパルの一覧が読めるようになった。既存の継承OwnerとGitHub Actions用Workload Identity Userを確認し、Denoのbindingはまだないことを確認した。ユーザーが入力した単一principal `principal://iam.googleapis.com/projects/972004424723/locations/global/workloadIdentityPools/deno-deploy-test/subject/deployment:halh0328/toshi-wif-test/preview`、対象SA、一つだけのWorkload Identity Userロールを照合した。短期トークン取得と共有済みテストシート閲覧が可能になることを説明し、ユーザーの明示承認後に保存を1回実行した。取得できた状態は保存・キャンセルがdisabledの処理中表示であり、一覧への反映はまだ確認できていない。保存を再送せず、結果を確認してからDenoの接続試験へ進む。

2026-10-13再開時、対象SAのアクセス一覧に上記Deno Preview単一principalとWorkload Identity User（継承なし）が表示され、既存GitHub bindingも残っていることを確認した。これによりGoogle側の権限保存のread-backが完了した。保存の再実行はしていない。Deno側はPreviewのみと入力済みprovider/SAを維持していたが、前回のTesting connection表示が残っていたため画面の再読み込みを1回試みた。新しい接続テスト結果とCloud Connection保存はまだ確認できていない。Google側のIAM保存をDeno実行時認証やDrive/Sheets実機成功と同一視しない。

同日、ユーザーの再開合図後にDeno画面を再取得すると、再読み込みでフォームは初期状態（All・provider/SA空欄）になっていた。確認済みprovider/SAを再入力してread-backした。All選択欄は操作後も開いたことを確認できず、Preview限定を復元できるまでTest connection / Create connectionを押さず停止した。ユーザーにAll選択肢の表示を依頼した。Nodeの関連20テスト、既存キャッシュを指定したDeno frozen型チェック、git diff --checkは成功。これらはローカル検証であり、Denoからの実認証成功を示すものではない。

続いてユーザーがAllの選択肢を開いた後、Previewだけを選択してread-backした（All/Production/Build/Localは0、Previewは1）。同じprovider/SAでTest connectionを1回実行し、`Cloud Connection Secure` / `All security tests passed. Your cloud connection is properly configured.` を確認した。内訳は選択contextの認証成功1、他contextの拒否3、同一org内の他app拒否4、他orgのapp拒否4がすべて合格表示だった。これはDeno Cloud ConnectionsのGoogle認証・認可境界テストの成功であり、Drive/Sheets取得やSupabase経由の実機検証はまだ未完了。Create connectionは未実行で、Preview限定の接続保存にはその時点のユーザー承認が必要。画像取得は古いAllメニュー表示のままで本文read-backと食い違っていたため、承認用の正しい結果画像を取得するためにユーザーへStep 4の表示を依頼した。

ユーザーがPreview限定のCreate connection保存を承認した次の取得では、すでにアプリ設定画面に戻っており、Cloud Connections一覧にGCP・対象SA・Previewが表示されていた。保存済み状態をread-backしたが、この取得時にこちらからCreate connectionをクリックしてはいない。重複作成・権限再付与はしない。Environment Variablesはまだ0件。実行entrypointは正しい一方、Install commandはまだnpm installだったため、確認済みのDeno frozen entrypoint installへの変更を準備している。実稼働リビジョン、Drive/Sheets取得、Supabase比較、追加費用なしの長期運用条件は未検証。

ユーザーがApp Configuration編集画面を開いた後、Install commandだけを `deno install --frozen --entrypoint deno/google-api-proxy/main.ts` に変更してSaveを1回実行し、設定一覧の同じコマンドをread-backした。Dynamic entrypoint、Build/Pre-deploy空欄、無料枠内の既存メモリ・timeoutは維持した。続いてEnvironment Variables and Secretsフォームを開き、`PROXY_SHARED_SECRET`・Secret・Previewのみ（他contextは0）を準備したが、値はまだ空欄でDone/Saveは未実行。秘密値をDeno個人検証アプリに保存する操作の直前承認と、承認用画像の取得を待っている。Googleの秘密鍵や既存Supabaseのsecretを使い回さない。

その後ユーザーは、専用ランダムシークレットをDeno個人検証アプリのPreview Secretに入力・保存する操作を明示承認した。256bitのランダム値をローカル一時ディレクトリ（0700）内のファイル（0600）へ生成し、値を出力せずSecret欄へ入力した。入力値一致を真偽値だけで確認し、Done後の`PROXY_SHARED_SECRET`・Previewの準備行を確認した。続いて個人テスト用シート1件の`ALLOWED_SPREADSHEET_IDS`（Plain Text、Previewのみ）を追加しているが、Value欄の入力が反映されたことはまだ確認できず、ユーザーにIDの手入力を依頼した。環境変数全体のSave完了は未確認。秘密値をGitの作業ツリーやチャットへ出していない。

実機取得に向け、`scripts/proxy-smoke-test.mjs` と4件のモックテストを追加した。HTTPS originのみ許可し、redirectを追わず、1リクエスト30秒・合計5GETでhealth、認証なし拒否、誤ったsecret拒否、allowlist外拒否、テストシートのレスポンス形式と任意の既知マーカーを検査する。秘密値はローカルファイルから読み、返却データ・未知のエラー本文はログに出さない。シートのrecords内マーカーを確認するもので、B2のセル座標を直接検証したとは扱わない。ローカル関連テスト24件が成功。実ネットワークでのproxy smoke testは未実施。

ユーザーのシートID入力後、Valueがテスト用IDと完全一致し、Plain Text・Previewのみであることを確認してDoneを実行した。PROXY_SHARED_SECRETとALLOWED_SPREADSHEET_IDSの2行ともPreviewであることを確認してSaveを1回実行した。取得表示が更新されず、ユーザーへ現在のフォーム状態に応じた保存/一覧復帰の確認を依頼した。その後、設定一覧のALLOWED_SPREADSHEET_IDSの正しいID・Previewと、PROXY_SHARED_SECRETのSecretアイコン・Previewをread-backし、環境変数保存の成立を確認した。Denoビルド設定とGCP Preview接続も維持されている。Driveフォルダの共有・allowlist設定はまだ行っておらず、最初の実機試験は共有済み個人テストシートのみを使う。

## Google側の認可境界

本番向けの追加強化案として、実測したDenoの `org_id` / `app_id` / `context_id` を使い、専用poolのprovider conditionですべて一致させる。以下は未適用の案であり、現在保存済みの公式Cloud Connections互換mappingとは異なる。採用時は公式必須mappingを維持しつつconditionへ固定ID制約を追加する方式も検討する。可変のslugだけで認可しない。プレビュー・任意のGitブランチに本番データアクセスを許さない。

```text
google.subject = assertion.org_id + '/' + assertion.app_id + '/' + assertion.context_id
attribute.app_id = assertion.app_id

assertion.org_id == '<実測したORG_ID>' &&
assertion.app_id == '<実測したAPP_ID>' &&
assertion.context_id == '<実測した検証CONTEXT_ID>'
```

実測前にこれらのIDを推測して設定しない。外部principalには専用サービスアカウント上だけで `roles/iam.workloadIdentityUser` を付ける。project全体のOwner/Editor/TokenCreatorは付けない。初期設定にはproject scopeのPool Admin、SA作成・IAM変更権限、API有効化権限が必要。組織管理者権限は個人projectでは不要。組織導入時は外部IdPを制限する組織ポリシーやサービス利用方針を別途確認する。

## 次の実機検証と合格条件

1. 個人Denoアカウント・organizationのFree契約、カード未登録時制限、超過時停止を利用画面で確認。有料設定が必要なら停止。既存Supabase契約とGoogle Driveの日次quota/強制停止条件も確認。
2. 検証用アプリとcontextの数値IDを取得。個人Google projectに専用WIF信頼設定を作成。
3. テスト用Driveフォルダ・シートだけを専用SAにViewer共有。業務データを新サービスへ渡さない。
4. `/drive-list` と `/sheet-read` の実レスポンスを確認。認証なし/誤ったsecret/allowlist外は拒否し、secret・tokenをログにも返却にも含めない。
5. 検証用Supabaseから呼び出し、既存レスポンス形式、フォルダ一覧、PDF抜粋、最初のシート・A1:Z200読み取りを比較。
6. 1時間以上経過後と再起動後に再取得。実時間の長期試験はまだ行っていない。
7. JSONキー未設定の検証環境で再度実行。秘密鍵JWT経路を使っていないことを確認してから本番移行を判断。

## 他候補の扱い

- Cloud Run: 無料枠と超過従量課金があり、今回は候補から外す。ビルド・保存・Secret Managerも新規作成しない。
- Vercel Hobby: 公式に個人・非商用限定とされており、顧客社内ポータルの本番無料基盤として採用しない。
- Cloudflare Workers Free: 無料実行枠は確認したが、Worker自身を表すGoogle WIF用OIDCの発行方法を今回の公式調査で確認できない。「無料だからWIF可能」とは扱わない。
- Google Apps Script: Google管理のeffective-user tokenを取得でき、quota超過時は実行停止する候補。ただしWIF/サービスアカウントではなくデプロイした人の権限になる。人のアカウントの在籍・権限・所有権移管への依存とWebアプリ呼び出し認証を設計し直すため、今回は第二候補。

## 公式資料

- [Denoのnpm解決モード・Buffer互換性](https://docs.deno.com/runtime/fundamentals/node/)
- [Deno entrypoint依存インストール](https://docs.deno.com/runtime/reference/cli/install/)
- [Deno runtime OIDC](https://docs.deno.com/deploy/reference/oidc/)
- [Deno Cloud Connections](https://docs.deno.com/deploy/reference/cloud_connections/)
- [Deno料金](https://deno.com/deploy/pricing)
- [Deno Free超過停止・カード未登録の制限・全アプリOIDC](https://docs.deno.com/deploy/changelog/#september-26th-2025)
- [@deno/oidcの実API](https://jsr.io/@deno/oidc)
- [Google WIF設定・project権限](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Google IAM料金](https://cloud.google.com/iam/pricing)
- [Drive API利用上限・料金](https://developers.google.com/workspace/drive/api/guides/limits)
- [Google Workspace API料金モデル変更の予告](https://developers.google.com/workspace/tools-safety)
- [Sheets API利用上限・料金](https://developers.google.com/workspace/sheets/api/limits)
- [Supabase利用制限](https://supabase.com/docs/guides/platform/spend-cap)
- [Vercel Hobby制限](https://vercel.com/docs/plans/hobby)
- [Apps Script token取得](https://developers.google.com/apps-script/reference/script/script-app#getoauthtoken)
- [Apps Script利用上限](https://developers.google.com/apps-script/guides/services/quotas)
