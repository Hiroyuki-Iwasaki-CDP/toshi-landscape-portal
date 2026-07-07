import type { KarteSample } from '../types'

// 樹木カルテ サンプル（文章校正AP・カルテ作成APのデモ用ダミーデータ）
// 所見①〜⑥：幹／枝／根／葉／被害／総合所見 の6項目
export const karteSamples: KarteSample[] = [
  {
    id: 'k-ng-001',
    title: '誤りを含む記入例（校正AP デフォルト表示用）',
    isCorrectExample: false,
    findings: [
      { label: '所見① 幹', text: '地際部に開口あり内部空洞の疑い変色部分も見られる' },
      { label: '所見② 枝', text: '枯れ枝が多数見られ落枝の危険性がある' },
      { label: '所見③ 根', text: '根上がりが見られ近接する歩道に亀裂が生じている' },
      { label: '所見④ 葉', text: '' },
      { label: '所見⑤ 被害', text: 'テッポウムシによる食害の跡あり' },
      { label: '所見⑥ 総合所見', text: '経過観察が必要総合判定はCランクとする' },
    ],
  },
  {
    id: 'k-ok-001',
    title: '正しい記入例',
    isCorrectExample: true,
    findings: [
      { label: '所見① 幹', text: '地際部に、幹 開口空洞が確認できる。内部の変色も見られるため注意が必要。' },
      { label: '所見② 枝', text: '枯れ枝が多数見られ、落枝の危険性がある。' },
      { label: '所見③ 根', text: '根上がりが見られ、近接する歩道に亀裂が生じている。' },
      { label: '所見④ 葉', text: '葉色は良好で、目立った病虫害の兆候は見られない。' },
      { label: '所見⑤ 被害', text: 'テッポウムシによる食害の跡があり、継続的な観察が望ましい。' },
      { label: '所見⑥ 総合所見', text: '経過観察が必要。総合判定はCランクとする。' },
    ],
  },
]

// 文章校正APで使用する簡易ルール（表記ゆれ・句読点補完のダミー変換）
export interface ProofreadingRule {
  id: string
  description: string
  pattern: RegExp
  replacement: string
}

export const proofreadingRules: ProofreadingRule[] = [
  {
    id: 'kaikou',
    description: '表記ゆれ：「開口」→「幹 開口空洞」に統一',
    pattern: /(?<!幹 )開口(?!空洞)/g,
    replacement: '幹 開口空洞',
  },
  {
    id: 'punct-doubt',
    description: '句読点補完：「疑い」の後に読点を追加',
    pattern: /疑い(?!、|。)/g,
    replacement: '疑い、',
  },
  {
    id: 'punct-mirareru',
    description: '句読点補完：「見られる」と次の文の間に読点を追加',
    pattern: /見られる(?!。|、|$)/g,
    replacement: '見られ、',
  },
  {
    id: 'punct-hitsuyou',
    description: '句読点補完：「必要」の直後に文が続く場合に句点を補完',
    pattern: /必要(?=総合|経過|継続)/g,
    replacement: '必要。',
  },
  {
    id: 'punct-ari',
    description: '句読点補完：「あり」の後に読点を追加',
    pattern: /あり(?!、|。|の)/g,
    replacement: 'あり、',
  },
]
