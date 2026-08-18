// 取引先ごとの申し送り事項のダミーデータ
// 実際にはGoogleスプレッドシート(列: 取引先コード, 日付, 申し送り事項)から読み込む想定。
// 作業のたびに追加されていく前提のため、1取引先につき複数件（日付付き）を持てる。
// 呼び出し側の分岐は repo.ts の fetchHandoverNotes を参照。

export interface HandoverNoteEntry {
  date: string // YYYY-MM-DD
  note: string
}

export interface HandoverNote {
  clientCode: string
  date: string
  note: string
}

export const mockHandoverNotes: HandoverNote[] = [
  { clientCode: 'C001', date: '2026-07-20', note: '管理組合の代表が今年度から交代。新代表は連絡がやや遅めなので、打合せは余裕を持って調整すること。' },
  { clientCode: 'C001', date: '2026-06-05', note: '中央公園棟の植栽帯に一部枯れが見られたため、次回訪問時に状態を再確認する予定。' },
  { clientCode: 'C003', date: '2026-07-01', note: '市役所側の窓口担当者が9月に異動予定。次回訪問前に最新の担当者を確認すること。' },
  { clientCode: 'C005', date: '2026-07-15', note: '駐車場の一部が工事で使用不可の時期あり。搬入経路は事前に現地で確認すること。' },
  { clientCode: 'C008', date: '2026-05-10', note: '契約は現在休止中。再開の打診があった場合は必ず管理者に共有すること。' },
]
