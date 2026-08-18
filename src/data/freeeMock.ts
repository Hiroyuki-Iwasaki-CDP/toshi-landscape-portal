// freee会計連携のモック
// 実際のfreee API(OAuth認可・事業所選択・取引一覧取得)とはまだ接続していない。
// データ取込ページで「CSVに代わる取込元」として実運用に耐えるUI・データ形式かを
// 検証するためのダミー実装。

export interface FreeeTransaction {
  /** 発生日 (YYYY-MM-DD) */
  date: string
  /** 取引先名 */
  partnerName: string
  /** 金額（円、マイナスは返金等） */
  amount: number
  /** freee側で設定されている部門（未設定のこともある） */
  department?: string
  /** 備考・メモ */
  memo?: string
}

export const MOCK_FREEE_COMPANY_NAME = 'サンプル事業所（モック）'

const MOCK_FREEE_TRANSACTIONS: FreeeTransaction[] = [
  { date: '2026-07-05', partnerName: '緑ヶ丘ハウジング(株)', amount: 850000, department: 'GREEN MAINTENANCE', memo: '7月分定期メンテナンス' },
  { date: '2026-07-08', partnerName: '株式会社サンパーク管理', amount: 420000 },
  { date: '2026-07-12', partnerName: '市川市 公園緑地課', amount: 300000, department: 'TREE RISK ASSESSMENT', memo: '樹木診断報告' },
  { date: '2026-07-15', partnerName: '池袋グランドテラス管理組合', amount: 210000, memo: '新規取引先の可能性あり（要紐付け）' },
  { date: '2026-07-20', partnerName: '医療法人社団 若葉会', amount: -8000, memo: '過入金の返金' },
  { date: '2026-07-24', partnerName: '株式会社ヒルトップリゾート', amount: 260000, department: 'TREE RISK ASSESSMENT' },
]

/** freeeへの接続を模した処理（実際のOAuth認可は行わない） */
export async function connectToFreeeMock(): Promise<{ companyName: string }> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return { companyName: MOCK_FREEE_COMPANY_NAME }
}

/** freeeの取引一覧取得APIを模した処理 */
export async function fetchFreeeTransactionsMock(): Promise<FreeeTransaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 900))
  return MOCK_FREEE_TRANSACTIONS
}
