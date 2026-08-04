import { useState } from 'react'
import { LinkIcon, MonitorPlay } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export function SimulationEmbedPage() {
  const { role } = useAuth()
  const canEdit = role === 'admin' || role === 'editor'
  const [savedUrl, setSavedUrl] = useState('')
  const [draftUrl, setDraftUrl] = useState('')

  function handleSave() {
    setSavedUrl(draftUrl.trim())
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">長期シミュレーションAP</h1>
        <p className="text-sm text-gray-400">
          Claudeで作成済みの長期シミュレーションアプリを、リンクまたは埋め込み表示でポータルに統合します
        </p>
      </div>

      {canEdit && (
        <Card title="埋め込み設定">
          <label className="mb-1 block text-xs font-semibold text-gray-500">シミュレーションアプリのURL</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Button onClick={handleSave} disabled={!draftUrl.trim()} className="shrink-0">
              反映する
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            ※本モックでは入力内容を保存しません。実装時はClaudeで発行した共有URLを設定します。
          </p>
        </Card>
      )}

      <Card>
        {savedUrl ? (
          <div className="overflow-hidden rounded-xl border border-brand-100">
            <iframe src={savedUrl} title="長期シミュレーションAP" className="h-[70vh] w-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-200 px-6 py-16 text-center">
            <MonitorPlay className="mb-4 h-10 w-10 text-brand-300" />
            <p className="text-sm font-semibold text-gray-500">
              {canEdit ? '上の欄にURLを入力すると、この場所にアプリが表示されます' : 'シミュレーションアプリのURLはまだ設定されていません'}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
              <LinkIcon className="h-3.5 w-3.5" />
              管理者・編集者が設定できます
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
