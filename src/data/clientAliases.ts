import type { ClientAlias } from '../types'

// 取引先の別名（名寄せ）辞書（ダミーデータ）
// 税理士CSV等での表記ゆれ（法人格の有無・略称など）を吸収し、取引先コードに紐付ける
// 「取引先コード・名寄せ設計メモ」の別名テーブル設計に対応
export const clientAliases: ClientAlias[] = [
  { id: 'al01', alias: '緑ヶ丘ハウジング(株)', clientId: 'c01', createdAt: '2026-04-10', createdBy: '管理者 太郎' },
  { id: 'al02', alias: '緑ヶ丘ハウジング', clientId: 'c01', createdAt: '2026-04-10', createdBy: '管理者 太郎' },
  { id: 'al03', alias: 'サンパーク管理', clientId: 'c02', createdAt: '2026-04-10', createdBy: '管理者 太郎' },
  { id: 'al04', alias: '市川市公園緑地課', clientId: 'c03', createdAt: '2026-04-11', createdBy: '管理者 太郎' },
  { id: 'al05', alias: '若葉会病院', clientId: 'c04', createdAt: '2026-04-11', createdBy: '管理者 太郎' },
  { id: 'al06', alias: '常盤台学院', clientId: 'c06', createdAt: '2026-04-12', createdBy: '管理者 太郎' },
  { id: 'al07', alias: 'グリーンテラス開発(株)', clientId: 'c07', createdAt: '2026-04-12', createdBy: '管理者 太郎' },
]
