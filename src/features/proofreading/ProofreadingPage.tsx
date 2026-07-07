import { useMemo, useRef, useState } from 'react'
import { FileText, Upload, Sparkles, AlertCircle, ListChecks } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { karteSamples, proofreadingRules } from '../../data/karte'

type ViewMode = 'full' | 'issuesOnly'

interface Match {
  start: number
  end: number
  original: string
  replacement: string
  description: string
}

interface MissingField {
  label: string
}

const DEFAULT_TEXT = karteSamples
  .find((s) => !s.isCorrectExample)!
  .findings.map((f) => `${f.label}: ${f.text}`)
  .join('\n')

function findMatches(text: string): Match[] {
  const raw: Match[] = []
  for (const rule of proofreadingRules) {
    // ルールの replacement はバックリファレンスを使わない固定文字列のため、
    // マッチ位置だけをこの正規表現で特定し、置換文字列はそのまま利用する
    // （マッチ部分文字列だけを取り出して再度 replace すると、$ 等の前後文脈依存の
    // 先読み/後読みが文脈を失って誤動作するため行わない）
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g')
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      raw.push({
        start: m.index,
        end: m.index + m[0].length,
        original: m[0],
        replacement: rule.replacement,
        description: rule.description,
      })
      if (m[0].length === 0) regex.lastIndex++
    }
  }
  raw.sort((a, b) => a.start - b.start)

  // 重なり合う一致は先勝ちで採用する
  const filtered: Match[] = []
  let cursor = 0
  for (const match of raw) {
    if (match.start < cursor) continue
    filtered.push(match)
    cursor = match.end
  }
  return filtered
}

function findMissingFields(text: string): MissingField[] {
  const missing: MissingField[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    const m = line.match(/^(所見[①-⑥][^:：]*)[:：]\s*(.*)$/)
    if (m && m[2].trim() === '') {
      missing.push({ label: m[1].trim() })
    }
  }
  return missing
}

export function ProofreadingPage() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [viewMode, setViewMode] = useState<ViewMode>('full')
  const [checked, setChecked] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(() => (checked ? findMatches(text) : []), [checked, text])
  const missingFields = useMemo(() => (checked ? findMissingFields(text) : []), [checked, text])

  function handleCheck() {
    setChecked(true)
  }

  function handleTextChange(value: string) {
    setText(value)
    setChecked(false)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleTextChange(String(reader.result ?? ''))
    }
    reader.readAsText(file)
  }

  const segments = useMemo(() => {
    if (!checked) return [{ type: 'plain' as const, text }]
    const result: { type: 'plain' | 'issue'; text: string; match?: Match }[] = []
    let cursor = 0
    for (const match of matches) {
      if (match.start > cursor) result.push({ type: 'plain', text: text.slice(cursor, match.start) })
      result.push({
        type: 'issue',
        text: viewMode === 'full' ? match.replacement : match.original,
        match,
      })
      cursor = match.end
    }
    if (cursor < text.length) result.push({ type: 'plain', text: text.slice(cursor) })
    return result
  }, [checked, matches, text, viewMode])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">文章校正AP</h1>
        <p className="text-sm text-gray-400">カルテ本文の表記ゆれ・記入漏れをチェックします（モック）</p>
      </div>

      <Card
        title="カルテ本文"
        actions={
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
          >
            <Upload className="h-3.5 w-3.5" />
            ファイルから読込
          </button>
        }
      >
        <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm leading-relaxed focus:border-brand-400 focus:outline-none"
          placeholder="カルテ本文を貼り付けてください"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={handleCheck} disabled={text.trim() === ''}>
            <Sparkles className="h-4 w-4" />
            校正する
          </Button>
        </div>
      </Card>

      {checked && (
        <>
          <Card
            title="修正後の文章"
            actions={
              <div className="flex rounded-lg border border-brand-200 p-0.5">
                {(
                  [
                    ['full', '完全修正'],
                    ['issuesOnly', '指摘のみ'],
                  ] as [ViewMode, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      viewMode === key ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-brand-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-loose text-gray-700">
              {segments.map((seg, i) =>
                seg.type === 'plain' ? (
                  <span key={i}>{seg.text}</span>
                ) : (
                  <mark
                    key={i}
                    title={seg.match?.description}
                    className={
                      viewMode === 'full'
                        ? 'rounded bg-brand-100 px-0.5 text-brand-800'
                        : 'rounded bg-amber-100 px-0.5 text-amber-800 underline decoration-red-400 decoration-2'
                    }
                  >
                    {seg.text}
                  </mark>
                ),
              )}
            </div>
          </Card>

          <Card title="指摘リスト">
            {matches.length === 0 && missingFields.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
                <ListChecks className="h-4 w-4" />
                表記ゆれ・記入漏れは検出されませんでした。
              </div>
            ) : (
              <ul className="space-y-3">
                {matches.map((m, i) => (
                  <li key={`m-${i}`} className="flex items-start gap-2 text-sm">
                    <Badge color="amber">表記ゆれ</Badge>
                    <span className="text-gray-600">
                      「{m.original}」→「{m.replacement}」（{m.description}）
                    </span>
                  </li>
                ))}
                {missingFields.map((f, i) => (
                  <li key={`f-${i}`} className="flex items-start gap-2 text-sm">
                    <Badge color="red">記入漏れ</Badge>
                    <span className="flex items-center gap-1 text-gray-600">
                      <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                      {f.label} が未記入です。
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {!checked && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-brand-200 px-4 py-3 text-sm text-gray-400">
          <FileText className="h-4 w-4" />
          「校正する」を押すと、修正後の文章と指摘リストが表示されます。
        </div>
      )}
    </div>
  )
}
