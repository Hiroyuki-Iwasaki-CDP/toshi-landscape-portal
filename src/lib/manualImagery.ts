// ファイル名のキーワードから、内容のイメージに沿ったアイコン・配色を決定する
// (Googleドライブの自動サムネイルは文書ページのプレビューにしかならないため、
//  作業内容が一目で伝わるテーマ画像をこちらで用意する)
import type { ComponentType } from 'react'
import {
  Scissors,
  Sun,
  Sprout,
  SprayCan,
  Truck,
  GraduationCap,
  TreePine,
  ClipboardList,
  AlertTriangle,
  Mountain,
  MessageCircle,
  Presentation as PresentationIcon,
  FileSpreadsheet,
  Camera,
  Receipt,
  FileCheck,
  BookOpen,
  ShieldAlert,
  ScrollText,
  CalendarClock,
  FileText,
} from 'lucide-react'

export interface ManualImagery {
  Icon: ComponentType<{ className?: string }>
  gradient: string
}

interface ImageryRule {
  keywords: string[]
  imagery: ManualImagery
}

const RULES: ImageryRule[] = [
  { keywords: ['熱中症'], imagery: { Icon: Sun, gradient: 'from-orange-400 to-red-500' } },
  { keywords: ['剪定'], imagery: { Icon: Scissors, gradient: 'from-emerald-400 to-green-600' } },
  { keywords: ['芝生'], imagery: { Icon: Sprout, gradient: 'from-lime-400 to-green-600' } },
  { keywords: ['薬剤', '散布'], imagery: { Icon: SprayCan, gradient: 'from-teal-400 to-emerald-600' } },
  { keywords: ['搬入', '搬出', '運搬'], imagery: { Icon: Truck, gradient: 'from-slate-400 to-slate-600' } },
  { keywords: ['新人', '研修', '教育'], imagery: { Icon: GraduationCap, gradient: 'from-indigo-400 to-purple-600' } },
  { keywords: ['危険木', '判定'], imagery: { Icon: AlertTriangle, gradient: 'from-amber-400 to-red-500' } },
  { keywords: ['樹木', 'リスク評価'], imagery: { Icon: TreePine, gradient: 'from-green-500 to-emerald-700' } },
  { keywords: ['現地調査', '調査'], imagery: { Icon: ClipboardList, gradient: 'from-sky-400 to-blue-600' } },
  { keywords: ['法令', 'ガイドライン'], imagery: { Icon: ScrollText, gradient: 'from-stone-400 to-stone-600' } },
  { keywords: ['安全'], imagery: { Icon: ShieldAlert, gradient: 'from-red-400 to-rose-600' } },
  { keywords: ['景観計画', '計画策定'], imagery: { Icon: Mountain, gradient: 'from-cyan-400 to-teal-600' } },
  { keywords: ['ヒアリング'], imagery: { Icon: MessageCircle, gradient: 'from-fuchsia-400 to-pink-600' } },
  { keywords: ['プレゼン', '提案'], imagery: { Icon: PresentationIcon, gradient: 'from-violet-400 to-indigo-600' } },
  { keywords: ['議事録'], imagery: { Icon: BookOpen, gradient: 'from-blue-400 to-indigo-600' } },
  { keywords: ['シミュレーション'], imagery: { Icon: CalendarClock, gradient: 'from-purple-400 to-violet-600' } },
  { keywords: ['写真', '台帳'], imagery: { Icon: Camera, gradient: 'from-gray-400 to-gray-600' } },
  { keywords: ['見積', '請求'], imagery: { Icon: Receipt, gradient: 'from-yellow-400 to-amber-600' } },
  { keywords: ['報告書', '完了報告'], imagery: { Icon: FileCheck, gradient: 'from-blue-400 to-cyan-600' } },
  { keywords: ['日報', 'カルテ', 'チェックシート', 'フォーマット', 'テンプレート'], imagery: { Icon: FileSpreadsheet, gradient: 'from-green-400 to-teal-600' } },
]

const DEFAULT_IMAGERY: ManualImagery = { Icon: FileText, gradient: 'from-brand-400 to-brand-600' }

export function getManualImagery(fileName: string): ManualImagery {
  const rule = RULES.find((r) => r.keywords.some((k) => fileName.includes(k)))
  return rule?.imagery ?? DEFAULT_IMAGERY
}
