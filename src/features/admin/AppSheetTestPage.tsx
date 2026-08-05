import { Card } from '../../components/ui/Card'
import { fetchAppSheetTestData } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'

export function AppSheetTestPage() {
  const { data, loading, error } = useAsyncData(fetchAppSheetTestData, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">AppSheet連携テスト</h1>
        <p className="text-sm text-gray-400">
          Googleスプレッドシート（AppSheetの元データ想定）を実際に読み込めるかの検証用ページです（管理者限定・ダミーデータのシートを参照）
        </p>
      </div>

      <Card>
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
        ) : !data || data.records.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <p className="mb-3 text-xs text-gray-400">
              シート「{data.sheetName}」から{data.records.length}件取得
            </p>
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-xs text-gray-400">
                  {data.headers.map((h) => (
                    <th key={h} className="whitespace-nowrap py-2 pr-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {data.records.map((record, i) => (
                  <tr key={i}>
                    {data.headers.map((h) => (
                      <td key={h} className="whitespace-nowrap py-2 pr-4 text-gray-600">
                        {record[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
