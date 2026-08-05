// Googleドライブ連携（モック）: 業務マニュアル/フォーマットのファイル一覧ダミーデータ
// path は NavConfig.ts の NavItem.path に対応する

export type DriveFileType = 'doc' | 'sheet' | 'slide' | 'pdf'

export interface DriveFileItem {
  id: string
  name: string
  type: DriveFileType
  updatedAt: string // YYYY-MM-DD
  updatedBy: string
  /** 実際のGoogleドライブファイルへのリンク（実データ接続時のみ設定される） */
  webViewLink?: string
  /** ファイルのサムネイル画像URL（実データ接続時のみ設定される） */
  thumbnailLink?: string
  /** 本文冒頭の抜粋（実データ接続時のみ設定される） */
  excerpt?: string
  /** 簡単な詳細説明（編集者・管理者が入力。検索対象になる） */
  detail?: string
  /** ハッシュタグ（例: ['夏季', '安全']。検索対象になる） */
  tags?: string[]
}

export const driveFiles: Record<string, DriveFileItem[]> = {
  '/green-maintenance/manual': [
    {
      id: 'gm-m01',
      name: '剪定作業マニュアル',
      type: 'doc',
      updatedAt: '2026-06-02',
      updatedBy: '山本 恵美',
      detail: '樹木の剪定作業の基本手順と安全上の注意点をまとめたマニュアルです。',
      tags: ['剪定', '基本作業', '安全'],
    },
    {
      id: 'gm-m02',
      name: '芝生管理マニュアル',
      type: 'doc',
      updatedAt: '2026-05-20',
      updatedBy: '中村 悠斗',
      detail: '芝生の年間管理スケジュールと刈込・施肥のポイントを解説しています。',
      tags: ['芝生', '年間スケジュール'],
    },
    {
      id: 'gm-m03',
      name: '薬剤散布マニュアル',
      type: 'pdf',
      updatedAt: '2026-04-15',
      updatedBy: '中村 悠斗',
      detail: '薬剤散布時の希釈方法・近隣配慮・保護具着用ルールをまとめています。',
      tags: ['薬剤散布', '安全'],
    },
    {
      id: 'gm-m04',
      name: '熱中症対策マニュアル',
      type: 'pdf',
      updatedAt: '2026-06-25',
      updatedBy: '管理者 太郎',
      detail: '夏季の屋外作業における熱中症予防と発生時の対応手順です。',
      tags: ['夏季', '安全', '全社共通'],
    },
    {
      id: 'gm-m05',
      name: '現場搬入・搬出手順書',
      type: 'doc',
      updatedAt: '2026-03-10',
      updatedBy: '山本 恵美',
      detail: '資材・機材の現場搬入出時の手順と注意点です。',
      tags: ['搬入搬出', '基本作業'],
    },
    {
      id: 'gm-m06',
      name: '新人研修マニュアル',
      type: 'slide',
      updatedAt: '2026-02-18',
      updatedBy: '管理者 太郎',
      detail: '新入社員向けの研修資料です。基本作業の流れを一通り解説しています。',
      tags: ['新人研修', '基本作業'],
    },
  ],
  '/green-maintenance/format': [
    { id: 'gm-f01', name: '日報フォーマット', type: 'sheet', updatedAt: '2026-06-10', updatedBy: '中村 悠斗' },
    { id: 'gm-f02', name: '現場写真台帳フォーマット', type: 'sheet', updatedAt: '2026-05-01', updatedBy: '山本 恵美' },
    { id: 'gm-f03', name: '見積書テンプレート', type: 'sheet', updatedAt: '2026-04-22', updatedBy: '管理者 太郎' },
    { id: 'gm-f04', name: '完了報告書フォーマット', type: 'doc', updatedAt: '2026-03-30', updatedBy: '中村 悠斗' },
  ],
  '/tree-risk/manual': [
    {
      id: 'tr-m01',
      name: '樹木リスク評価マニュアル',
      type: 'doc',
      updatedAt: '2026-06-05',
      updatedBy: '編集 花子',
      detail: '樹木リスク評価業務全体の基本フローをまとめたマニュアルです。',
      tags: ['基本作業', 'リスク評価'],
    },
    {
      id: 'tr-m02',
      name: '現地調査手順書',
      type: 'doc',
      updatedAt: '2026-05-18',
      updatedBy: '小林 亮',
      detail: '現地での目視調査・計測の手順をまとめています。',
      tags: ['現地調査', '基本作業'],
    },
    {
      id: 'tr-m03',
      name: '危険木判定基準',
      type: 'pdf',
      updatedAt: '2026-04-01',
      updatedBy: '編集 花子',
      detail: '危険木と判定する基準・チェックポイントの一覧です。',
      tags: ['危険木', 'リスク評価', '安全'],
    },
    {
      id: 'tr-m04',
      name: '報告書作成ガイド',
      type: 'doc',
      updatedAt: '2026-03-12',
      updatedBy: '小林 亮',
      detail: '調査結果を報告書としてまとめる際の書式ガイドです。',
      tags: ['報告書'],
    },
  ],
  '/tree-risk/format': [
    { id: 'tr-f01', name: '樹木カルテフォーマット', type: 'sheet', updatedAt: '2026-06-08', updatedBy: '編集 花子' },
    { id: 'tr-f02', name: '現地調査チェックシート', type: 'sheet', updatedAt: '2026-05-22', updatedBy: '小林 亮' },
    { id: 'tr-f03', name: '評価報告書テンプレート', type: 'doc', updatedAt: '2026-04-30', updatedBy: '編集 花子' },
  ],
  '/landscape-consulting/manual': [
    { id: 'lc-m01', name: '景観計画策定マニュアル', type: 'doc', updatedAt: '2026-05-14', updatedBy: '山本 恵美' },
    { id: 'lc-m02', name: 'ヒアリングシート運用ガイド', type: 'doc', updatedAt: '2026-04-20', updatedBy: '加藤 沙織' },
    { id: 'lc-m03', name: '提案プレゼン作成マニュアル', type: 'slide', updatedAt: '2026-03-25', updatedBy: '山本 恵美' },
  ],
  '/landscape-consulting/format': [
    { id: 'lc-f01', name: '提案書テンプレート', type: 'slide', updatedAt: '2026-06-01', updatedBy: '山本 恵美' },
    { id: 'lc-f02', name: '長期シミュレーション入力シート', type: 'sheet', updatedAt: '2026-05-11', updatedBy: '加藤 沙織' },
    { id: 'lc-f03', name: '議事録フォーマット', type: 'doc', updatedAt: '2026-04-08', updatedBy: '加藤 沙織' },
  ],
  '/green-maintenance/equipment': [
    { id: 'gm-e01', name: '刈払機 取扱説明書', type: 'pdf', updatedAt: '2026-05-15', updatedBy: '中村 悠斗' },
    { id: 'gm-e02', name: 'チェーンソー点検チェックリスト', type: 'sheet', updatedAt: '2026-04-10', updatedBy: '山本 恵美' },
    { id: 'gm-e03', name: '資材発注一覧', type: 'sheet', updatedAt: '2026-03-20', updatedBy: '中村 悠斗' },
  ],
  '/green-maintenance/safety': [
    {
      id: 'gm-s01',
      name: '安全衛生管理マニュアル',
      type: 'pdf',
      updatedAt: '2026-06-01',
      updatedBy: '管理者 太郎',
      detail: '全社共通の安全衛生管理の基本方針をまとめています。',
      tags: ['安全', '全社共通'],
    },
    {
      id: 'gm-s02',
      name: 'ヒヤリハット報告フォーマット',
      type: 'sheet',
      updatedAt: '2026-05-08',
      updatedBy: '山本 恵美',
      detail: 'ヒヤリハット事例を報告する際のフォーマットです。',
      tags: ['安全', '報告書'],
    },
    {
      id: 'gm-s03',
      name: 'KY活動チェックシート',
      type: 'sheet',
      updatedAt: '2026-04-25',
      updatedBy: '中村 悠斗',
      detail: '作業前KY活動（危険予知）で使うチェックシートです。',
      tags: ['安全', '基本作業'],
    },
  ],
  '/green-maintenance/proposal': [
    { id: 'gm-p01', name: '緑地維持管理 提案書テンプレート', type: 'slide', updatedAt: '2026-05-30', updatedBy: '山本 恵美' },
    { id: 'gm-p02', name: '植栽リニューアル提案事例集', type: 'slide', updatedAt: '2026-04-18', updatedBy: '山本 恵美' },
  ],
  '/green-maintenance/knowledge': [
    { id: 'gm-k01', name: '季節ごとの植栽管理ポイント', type: 'doc', updatedAt: '2026-05-25', updatedBy: '中村 悠斗' },
    { id: 'gm-k02', name: 'よくある病害虫と対処法', type: 'doc', updatedAt: '2026-04-12', updatedBy: '中村 悠斗' },
  ],
  '/tree-risk/equipment': [
    { id: 'tr-e01', name: '樹木診断機器 取扱手順', type: 'pdf', updatedAt: '2026-05-20', updatedBy: '小林 亮' },
    { id: 'tr-e02', name: '測定機材点検表', type: 'sheet', updatedAt: '2026-04-05', updatedBy: '編集 花子' },
  ],
  '/tree-risk/regulation': [
    { id: 'tr-r01', name: '樹木医関連法令まとめ', type: 'doc', updatedAt: '2026-05-01', updatedBy: '編集 花子' },
    { id: 'tr-r02', name: '街路樹評価ガイドライン(国交省準拠)', type: 'pdf', updatedAt: '2026-03-15', updatedBy: '編集 花子' },
  ],
  '/tree-risk/proposal': [
    { id: 'tr-p01', name: '樹木リスク評価 提案書テンプレート', type: 'slide', updatedAt: '2026-05-12', updatedBy: '小林 亮' },
  ],
  '/tree-risk/knowledge': [
    { id: 'tr-k01', name: '危険木判定の実例集', type: 'doc', updatedAt: '2026-04-28', updatedBy: '編集 花子' },
    { id: 'tr-k02', name: '樹種別リスク傾向まとめ', type: 'doc', updatedAt: '2026-03-22', updatedBy: '小林 亮' },
  ],
  '/landscape-consulting/proposal': [
    { id: 'lc-p01', name: '景観コンサル提案書テンプレート', type: 'slide', updatedAt: '2026-05-18', updatedBy: '加藤 沙織' },
    { id: 'lc-p02', name: '公共施設向け提案事例集', type: 'slide', updatedAt: '2026-04-02', updatedBy: '山本 恵美' },
  ],
  '/landscape-consulting/knowledge': [
    { id: 'lc-k01', name: '景観計画の考え方まとめ', type: 'doc', updatedAt: '2026-04-15', updatedBy: '加藤 沙織' },
  ],
  '/company/career': [
    { id: 'co-c01', name: '昇給・給与テーブル', type: 'sheet', updatedAt: '2026-04-01', updatedBy: '管理者 太郎' },
    { id: 'co-c02', name: '資格取得支援制度 詳細', type: 'doc', updatedAt: '2026-05-10', updatedBy: '管理者 太郎' },
    { id: 'co-c03', name: 'キャリアアップ図', type: 'slide', updatedAt: '2026-03-20', updatedBy: '管理者 太郎' },
  ],
  // 各種申請: Googleフォーム作成中のため、現時点ではファイルなし（打ち合わせで空表示でOKと確認済み）
  '/company/applications': [],
}
