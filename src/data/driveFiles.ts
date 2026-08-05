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
}

export const driveFiles: Record<string, DriveFileItem[]> = {
  '/green-maintenance/manual': [
    { id: 'gm-m01', name: '剪定作業マニュアル', type: 'doc', updatedAt: '2026-06-02', updatedBy: '山本 恵美' },
    { id: 'gm-m02', name: '芝生管理マニュアル', type: 'doc', updatedAt: '2026-05-20', updatedBy: '中村 悠斗' },
    { id: 'gm-m03', name: '薬剤散布マニュアル', type: 'pdf', updatedAt: '2026-04-15', updatedBy: '中村 悠斗' },
    { id: 'gm-m04', name: '熱中症対策マニュアル', type: 'pdf', updatedAt: '2026-06-25', updatedBy: '管理者 太郎' },
    { id: 'gm-m05', name: '現場搬入・搬出手順書', type: 'doc', updatedAt: '2026-03-10', updatedBy: '山本 恵美' },
    { id: 'gm-m06', name: '新人研修マニュアル', type: 'slide', updatedAt: '2026-02-18', updatedBy: '管理者 太郎' },
  ],
  '/green-maintenance/format': [
    { id: 'gm-f01', name: '日報フォーマット', type: 'sheet', updatedAt: '2026-06-10', updatedBy: '中村 悠斗' },
    { id: 'gm-f02', name: '現場写真台帳フォーマット', type: 'sheet', updatedAt: '2026-05-01', updatedBy: '山本 恵美' },
    { id: 'gm-f03', name: '見積書テンプレート', type: 'sheet', updatedAt: '2026-04-22', updatedBy: '管理者 太郎' },
    { id: 'gm-f04', name: '完了報告書フォーマット', type: 'doc', updatedAt: '2026-03-30', updatedBy: '中村 悠斗' },
  ],
  '/tree-risk/manual': [
    { id: 'tr-m01', name: '樹木リスク評価マニュアル', type: 'doc', updatedAt: '2026-06-05', updatedBy: '編集 花子' },
    { id: 'tr-m02', name: '現地調査手順書', type: 'doc', updatedAt: '2026-05-18', updatedBy: '小林 亮' },
    { id: 'tr-m03', name: '危険木判定基準', type: 'pdf', updatedAt: '2026-04-01', updatedBy: '編集 花子' },
    { id: 'tr-m04', name: '報告書作成ガイド', type: 'doc', updatedAt: '2026-03-12', updatedBy: '小林 亮' },
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
    { id: 'gm-s01', name: '安全衛生管理マニュアル', type: 'pdf', updatedAt: '2026-06-01', updatedBy: '管理者 太郎' },
    { id: 'gm-s02', name: 'ヒヤリハット報告フォーマット', type: 'sheet', updatedAt: '2026-05-08', updatedBy: '山本 恵美' },
    { id: 'gm-s03', name: 'KY活動チェックシート', type: 'sheet', updatedAt: '2026-04-25', updatedBy: '中村 悠斗' },
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
}
