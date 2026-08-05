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
}
