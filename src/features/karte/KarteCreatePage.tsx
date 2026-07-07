import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Eye, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { clients } from '../../data/clients'
import { formatDateJa } from '../../lib/format'

const FINDING_LABELS = ['幹', '枝', '根', '葉', '被害', '総合所見'] as const

interface KarteFormState {
  siteName: string
  clientId: string
  treeSpecies: string
  surveyDate: string
  surveyorName: string
  findings: Record<(typeof FINDING_LABELS)[number], string>
}

const INITIAL_STATE: KarteFormState = {
  siteName: '',
  clientId: '',
  treeSpecies: '',
  surveyDate: '',
  surveyorName: '',
  findings: { 幹: '', 枝: '', 根: '', 葉: '', 被害: '', 総合所見: '' },
}

export function KarteCreatePage() {
  const [form, setForm] = useState<KarteFormState>(INITIAL_STATE)
  const [showPreview, setShowPreview] = useState(false)

  const client = clients.find((c) => c.id === form.clientId)
  const isValid = form.siteName.trim() !== '' && form.clientId !== '' && form.treeSpecies.trim() !== ''

  function updateFinding(label: (typeof FINDING_LABELS)[number], value: string) {
    setForm((prev) => ({ ...prev, findings: { ...prev.findings, [label]: value } }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">カルテ作成AP</h1>
        <p className="text-sm text-gray-400">樹木カルテを入力し、プレビューを確認できます（モック）</p>
      </div>

      <Card title="基本情報">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="現場名" required>
            <input
              value={form.siteName}
              onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
              className="input"
              placeholder="例：緑ヶ丘ハウジング 中央公園棟"
            />
          </Field>
          <Field label="取引先" required>
            <select
              value={form.clientId}
              onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
              className="input"
            >
              <option value="">選択してください</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="樹種" required>
            <input
              value={form.treeSpecies}
              onChange={(e) => setForm((p) => ({ ...p, treeSpecies: e.target.value }))}
              className="input"
              placeholder="例：クスノキ"
            />
          </Field>
          <Field label="診断日">
            <input
              type="date"
              value={form.surveyDate}
              onChange={(e) => setForm((p) => ({ ...p, surveyDate: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="診断者名">
            <input
              value={form.surveyorName}
              onChange={(e) => setForm((p) => ({ ...p, surveyorName: e.target.value }))}
              className="input"
              placeholder="例：樹木医 小川 誠"
            />
          </Field>
        </div>
      </Card>

      <Card title="所見">
        <div className="space-y-4">
          {FINDING_LABELS.map((label) => (
            <Field key={label} label={`所見（${label}）`}>
              <textarea
                value={form.findings[label]}
                onChange={(e) => updateFinding(label, e.target.value)}
                rows={2}
                className="input resize-none"
                placeholder={`${label}に関する所見を入力してください`}
              />
            </Field>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Link to="/proofreading">
          <Button variant="secondary">
            <Sparkles className="h-4 w-4" />
            文章校正APで確認する
          </Button>
        </Link>
        <Button onClick={() => setShowPreview(true)} disabled={!isValid}>
          <Eye className="h-4 w-4" />
          プレビュー表示
        </Button>
      </div>

      {!isValid && (
        <p className="text-right text-xs text-gray-400">現場名・取引先・樹種は必須項目です</p>
      )}

      {showPreview && isValid && (
        <Card title="プレビュー">
          <div className="flex items-center gap-2 border-b border-brand-100 pb-3">
            <ClipboardList className="h-5 w-5 text-brand-500" />
            <div>
              <p className="text-sm font-bold text-gray-700">{form.siteName}</p>
              <p className="text-xs text-gray-400">
                取引先：{client?.name ?? '-'} ／ 樹種：{form.treeSpecies}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-400 sm:grid-cols-2">
            <span>診断日：{form.surveyDate ? formatDateJa(form.surveyDate) : '未入力'}</span>
            <span>診断者：{form.surveyorName || '未入力'}</span>
          </div>
          <dl className="mt-4 divide-y divide-brand-50">
            {FINDING_LABELS.map((label) => (
              <div key={label} className="py-2.5 first:pt-0">
                <dt className="text-xs font-semibold text-brand-500">所見（{label}）</dt>
                <dd className="mt-0.5 text-sm text-gray-700">
                  {form.findings[label].trim() === '' ? (
                    <span className="text-gray-300">未記入</span>
                  ) : (
                    form.findings[label]
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  )
}
