// メニュー構成の単一ソース（サイドバー・ハンバーガーメニュー・ポータルトップで共用）

export interface NavItem {
  label: string
  path: string
  /** true の場合は「準備中」プレースホルダーページとして表示 */
  placeholder?: boolean
  /** true の場合は管理者のみメニューに表示（それ以外の権限には非表示） */
  adminOnly?: boolean
  /** true の場合は管理者・編集者が編集可能なページ（一般社員は閲覧のみ） */
  editable?: boolean
}

export interface NavCategory {
  key: string
  label: string
  description: string
  items: NavItem[]
}

export const navCategories: NavCategory[] = [
  {
    key: 'company',
    label: 'COMPANY',
    description: '各種申請・キャリア・お知らせ・実績など',
    items: [
      { label: '各種申請', path: '/company/applications', placeholder: true, editable: true },
      { label: 'キャリア', path: '/company/career', placeholder: true, editable: true },
      { label: 'お知らせ', path: '/company/news' },
      { label: 'スケジュール', path: '/company/schedule' },
      { label: '実績ダッシュボード', path: '/dashboard' },
      { label: 'データ取込', path: '/data-import', adminOnly: true },
      { label: 'ユーザー管理', path: '/admin/users', adminOnly: true },
    ],
  },
  {
    key: 'customer',
    label: 'CUSTOMER',
    description: '取引先一覧・取引先ごとの詳細情報',
    items: [{ label: '取引先一覧', path: '/clients' }],
  },
  {
    key: 'green-maintenance',
    label: 'GREEN MAINTENANCE',
    description: '緑地管理業務のマニュアル・資料',
    items: [
      { label: '業務マニュアル', path: '/green-maintenance/manual', placeholder: true, editable: true },
      { label: 'フォーマット', path: '/green-maintenance/format', placeholder: true, editable: true },
      { label: '使用機材・資材', path: '/green-maintenance/equipment', placeholder: true, editable: true },
      { label: '安全管理', path: '/green-maintenance/safety', placeholder: true, editable: true },
      { label: '提案資料', path: '/green-maintenance/proposal', placeholder: true, editable: true },
      { label: 'ナレッジ', path: '/green-maintenance/knowledge', placeholder: true, editable: true },
    ],
  },
  {
    key: 'tree-risk',
    label: 'TREE RISK ASSESSMENT',
    description: '樹木リスク評価業務のマニュアル・資料・AP',
    items: [
      { label: '業務マニュアル', path: '/tree-risk/manual', placeholder: true, editable: true },
      { label: 'フォーマット', path: '/tree-risk/format', placeholder: true, editable: true },
      { label: '使用機材', path: '/tree-risk/equipment', placeholder: true, editable: true },
      { label: '法令・ガイドライン', path: '/tree-risk/regulation', placeholder: true, editable: true },
      { label: '提案資料', path: '/tree-risk/proposal', placeholder: true, editable: true },
      { label: 'ナレッジ', path: '/tree-risk/knowledge', placeholder: true, editable: true },
    ],
  },
  {
    key: 'landscape-consulting',
    label: 'LANDSCAPE CONSULTING',
    description: '景観コンサルティング業務のマニュアル・資料・AP',
    items: [
      { label: '業務マニュアル', path: '/landscape-consulting/manual', placeholder: true, editable: true },
      { label: 'フォーマット', path: '/landscape-consulting/format', placeholder: true, editable: true },
      { label: '議事録AP', path: '/landscape-consulting/minutes-ap', placeholder: true },
      { label: '資料作成AP', path: '/landscape-consulting/document-ap', placeholder: true },
      { label: '長期シミュレーションAP', path: '/landscape-consulting/simulation-ap' },
      { label: '提案資料', path: '/landscape-consulting/proposal', placeholder: true, editable: true },
      { label: 'ナレッジ', path: '/landscape-consulting/knowledge', placeholder: true, editable: true },
    ],
  },
]

export const allPlaceholderNavItems: NavItem[] = navCategories.flatMap((c) =>
  c.items.filter((i) => i.placeholder),
)
