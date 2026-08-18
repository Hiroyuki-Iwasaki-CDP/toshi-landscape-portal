// ファイル名のキーワードから、内容のイメージに沿ったアイコン・配色を決定する
// (Googleドライブの自動サムネイルは文書ページのプレビューにしかならないため、
//  作業内容が一目で伝わるテーマ画像をこちらで用意する)
import type { ComponentType } from 'react'
import {
  Scissors,
  Sun,
  Sprout,
  Leaf,
  Bug,
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
  Wrench,
  Package,
  Award,
} from 'lucide-react'

export interface ManualImagery {
  Icon: ComponentType<{ className?: string }>
  gradient: string
  /** 凡例表示用のカテゴリ名 */
  label: string
}

interface ImageryRule {
  keywords: string[]
  imagery: ManualImagery
}

// 色のテーマは意味のあるグルーピングにしている（同系統の作業は同系統の色に寄せる）:
//   オレンジ系 = 機材・工具・産業機械 / 赤〜オレンジ系 = 安全・危険・熱中症
//   緑系      = 植物・緑地の手入れ   / 青系        = 調査・診断・報告
//   紫系      = 提案・企画・資料     / 黄系        = 事務・お金・キャリア
//   石灰(石)系 = 法令・ガイドライン  / グレー系    = 台帳・搬送・事務書式
const RULES: ImageryRule[] = [
  { keywords: ['熱中症'], imagery: { Icon: Sun, gradient: 'from-orange-400 to-red-500', label: '熱中症・夏季対策' } },
  { keywords: ['刈払機', 'チェーンソー', '取扱説明書', '機材', '機器', '器具', '工具', '点検'], imagery: { Icon: Wrench, gradient: 'from-orange-500 to-amber-700', label: '機材・工具' } },
  { keywords: ['資材', '発注'], imagery: { Icon: Package, gradient: 'from-amber-400 to-orange-600', label: '資材' } },
  { keywords: ['剪定'], imagery: { Icon: Scissors, gradient: 'from-emerald-400 to-green-600', label: '剪定' } },
  { keywords: ['芝生'], imagery: { Icon: Sprout, gradient: 'from-lime-400 to-green-600', label: '芝生管理' } },
  { keywords: ['薬剤', '散布'], imagery: { Icon: SprayCan, gradient: 'from-teal-400 to-emerald-600', label: '薬剤散布' } },
  { keywords: ['病害虫'], imagery: { Icon: Bug, gradient: 'from-green-400 to-lime-600', label: '病害虫対策' } },
  { keywords: ['植栽'], imagery: { Icon: Leaf, gradient: 'from-green-400 to-emerald-600', label: '植栽ケア' } },
  { keywords: ['搬入', '搬出', '運搬'], imagery: { Icon: Truck, gradient: 'from-slate-400 to-slate-600', label: '搬入搬出' } },
  { keywords: ['新人', '研修', '教育'], imagery: { Icon: GraduationCap, gradient: 'from-indigo-400 to-purple-600', label: '研修・教育' } },
  { keywords: ['危険木', '判定'], imagery: { Icon: AlertTriangle, gradient: 'from-amber-400 to-red-500', label: '危険木判定' } },
  { keywords: ['樹木', '樹種', 'リスク評価', 'リスク傾向'], imagery: { Icon: TreePine, gradient: 'from-green-500 to-emerald-700', label: '樹木リスク評価' } },
  { keywords: ['診断機器', '測定機材'], imagery: { Icon: Wrench, gradient: 'from-orange-500 to-amber-700', label: '機材・工具' } },
  { keywords: ['現地調査', '調査'], imagery: { Icon: ClipboardList, gradient: 'from-sky-400 to-blue-600', label: '現地調査' } },
  { keywords: ['法令', 'ガイドライン'], imagery: { Icon: ScrollText, gradient: 'from-stone-400 to-stone-600', label: '法令・ガイドライン' } },
  { keywords: ['安全'], imagery: { Icon: ShieldAlert, gradient: 'from-red-400 to-rose-600', label: '安全管理' } },
  { keywords: ['景観計画', '計画策定'], imagery: { Icon: Mountain, gradient: 'from-cyan-400 to-teal-600', label: '景観計画' } },
  { keywords: ['ヒアリング'], imagery: { Icon: MessageCircle, gradient: 'from-fuchsia-400 to-pink-600', label: 'ヒアリング' } },
  { keywords: ['プレゼン', '提案'], imagery: { Icon: PresentationIcon, gradient: 'from-violet-400 to-indigo-600', label: '提案資料' } },
  { keywords: ['議事録'], imagery: { Icon: BookOpen, gradient: 'from-blue-400 to-indigo-600', label: '議事録' } },
  { keywords: ['シミュレーション'], imagery: { Icon: CalendarClock, gradient: 'from-purple-400 to-violet-600', label: 'シミュレーション' } },
  { keywords: ['写真', '台帳'], imagery: { Icon: Camera, gradient: 'from-gray-400 to-gray-600', label: '写真・台帳' } },
  { keywords: ['見積', '請求'], imagery: { Icon: Receipt, gradient: 'from-yellow-400 to-amber-600', label: '見積・請求' } },
  { keywords: ['給与', '昇給', 'キャリアアップ', '資格取得'], imagery: { Icon: Award, gradient: 'from-yellow-400 to-amber-500', label: 'キャリア・資格' } },
  { keywords: ['報告書', '完了報告'], imagery: { Icon: FileCheck, gradient: 'from-blue-400 to-cyan-600', label: '報告書' } },
  { keywords: ['日報', 'カルテ', 'チェックシート', 'フォーマット', 'テンプレート'], imagery: { Icon: FileSpreadsheet, gradient: 'from-green-400 to-teal-600', label: '書式・テンプレート' } },
]

const DEFAULT_IMAGERY: ManualImagery = { Icon: FileText, gradient: 'from-brand-400 to-brand-600', label: 'その他' }

export function getManualImagery(fileName: string): ManualImagery {
  const rule = RULES.find((r) => r.keywords.some((k) => fileName.includes(k)))
  return rule?.imagery ?? DEFAULT_IMAGERY
}
