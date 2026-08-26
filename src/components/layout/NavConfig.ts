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
  /** ページ内の詳細カテゴリー（タブ絞り込みに使用。未定義の場合はファイル種別で絞り込む） */
  categories?: string[]
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
    description: 'お知らせ・申請・給与評価・理念・実績など',
    items: [
      { label: 'お知らせ', path: '/company/news' },
      { label: 'スケジュール', path: '/company/schedule' },
      {
        label: '申請',
        path: '/company/applications',
        placeholder: true,
        editable: true,
        categories: ['勤怠・休暇', '経費・立替', '車両・機材', '人事・資格'],
      },
      {
        label: '給与・評価',
        path: '/company/career',
        placeholder: true,
        editable: true,
        categories: ['レベル表・評価', '給与・手当', '資格支援', 'キャリアパス'],
      },
      {
        label: '理念・社内ルール',
        path: '/company/rules',
        placeholder: true,
        editable: true,
        categories: ['理念・文化', '就業', '安全衛生', '情報・IT'],
      },
      { label: '実績ダッシュボード', path: '/dashboard' },
      { label: 'データ取込', path: '/data-import', adminOnly: true },
      { label: 'ユーザー管理', path: '/admin/users', adminOnly: true },
      { label: 'AppSheet連携テスト', path: '/admin/appsheet-test', adminOnly: true },
    ],
  },
  {
    key: 'customer',
    label: 'PARTNER',
    description: '取引先一覧・関係先一覧',
    items: [
      { label: '取引先一覧', path: '/clients' },
      {
        label: '関係先一覧',
        path: '/partner/related',
        placeholder: true,
        categories: ['処分・リサイクル', '資材・仕入', '応援・協力', 'その他'],
      },
    ],
  },
  {
    key: 'green-maintenance',
    label: 'GREEN MAINTENANCE',
    description: '緑地管理業務のマニュアル・資料',
    items: [
      {
        label: 'フォーマット',
        path: '/green-maintenance/format',
        placeholder: true,
        editable: true,
        categories: ['報告書', '見積・請求', '提案書'],
      },
      {
        label: 'マニュアル',
        path: '/green-maintenance/manual',
        placeholder: true,
        editable: true,
        categories: ['新人', '基礎造園工', '現場責任者', '高木', '造園工'],
      },
      {
        label: '機材・資材',
        path: '/green-maintenance/equipment',
        placeholder: true,
        editable: true,
        categories: ['機械', '車両', '工具・消耗品', '薬剤・肥料'],
      },
      {
        label: '安全管理',
        path: '/green-maintenance/safety',
        placeholder: true,
        editable: true,
        categories: ['KY・ヒヤリハット', '熱中症・季節対策', '作業別安全', '事故対応・緊急連絡'],
      },
      {
        label: '資料',
        path: '/green-maintenance/proposal',
        placeholder: true,
        editable: true,
        categories: ['技術・ノウハウ', '病害虫', '樹種・植物', '提案・営業', 'その他'],
      },
    ],
  },
  {
    key: 'tree-risk',
    label: 'TREE RISK ASSESSMENT',
    description: '樹木リスク評価業務のマニュアル・資料・AP',
    items: [
      {
        label: 'フォーマット',
        path: '/tree-risk/format',
        placeholder: true,
        editable: true,
        categories: ['野帳', 'カルテ', '総評', '見積・請求', 'その他'],
      },
      {
        label: 'マニュアル',
        path: '/tree-risk/manual',
        placeholder: true,
        editable: true,
        categories: ['基本・共通', '外観診断', '機器診断', '判定・報告'],
      },
      {
        label: '機器',
        path: '/tree-risk/equipment',
        placeholder: true,
        editable: true,
        categories: ['レジストグラフ', 'アーボソニック3D', 'ピカス'],
      },
      {
        label: '法令・ガイドライン',
        path: '/tree-risk/regulation',
        placeholder: true,
        editable: true,
        categories: ['国内規格', '国内ガイドライン', '学会・業界基準', '海外規格'],
      },
      {
        label: '資料',
        path: '/tree-risk/proposal',
        placeholder: true,
        editable: true,
        categories: ['診断事例', '文献・論文', '海外動向', '提案・営業', 'その他'],
      },
    ],
  },
  {
    key: 'landscape-consulting',
    label: 'LANDSCAPE CONSULTING',
    description: '景観コンサルティング業務のマニュアル・資料・AP',
    items: [
      { label: 'フォーマット', path: '/landscape-consulting/format', placeholder: true, editable: true },
      { label: 'マニュアル', path: '/landscape-consulting/manual', placeholder: true, editable: true },
      { label: '長期シミュレーション', path: '/landscape-consulting/simulation-ap' },
      { label: '資料', path: '/landscape-consulting/proposal', placeholder: true, editable: true },
    ],
  },
]

export const allPlaceholderNavItems: NavItem[] = navCategories.flatMap((c) =>
  c.items.filter((i) => i.placeholder),
)
