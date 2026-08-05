// Supabaseへダミーデータを投入するシードスクリプト
// 実行方法: SUPABASE_URL=... SUPABASE_SECRET_KEY=... node scripts/seed-supabase.mjs
//
// Settings > API Keys の「Secret key」（sb_secret_... 形式。旧称: service_role key）が必要
// （RLSをバイパスして書き込むため）。このキーはこのスクリプト実行時のみ使い、
// アプリ本体(ブラウザ)には絶対に含めないこと。

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('環境変数 SUPABASE_URL と SUPABASE_SECRET_KEY を設定してください。')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY)

// ---- src/data/news.ts と同一内容 ----
const news = [
  { id: 'n01', date: '2026-07-01', category: 'お知らせ', title: '夏季安全衛生パトロールを実施します', body: '7月中旬より各現場で熱中症対策を含む安全衛生パトロールを実施します。詳細は安全管理ページをご確認ください。' },
  { id: 'n02', date: '2026-06-20', category: 'システム', title: '実績ダッシュボードに部門別グラフを追加しました', body: 'ダッシュボードのフィルタ機能を拡張し、部門別の構成比グラフを追加しました。' },
  { id: 'n03', date: '2026-06-15', category: '人事', title: '新入社員2名が配属されました', body: 'GREEN MAINTENANCE部門に2名の新入社員が配属されました。今後ともご指導のほどよろしくお願いします。' },
  { id: 'n04', date: '2026-06-10', category: 'お知らせ', title: '資格取得支援制度のご案内', body: '樹木医・造園施工管理技士等の資格取得を支援する制度について、キャリアページに詳細を掲載しました。' },
  { id: 'n05', date: '2026-06-01', category: 'システム', title: '社内ポータルのキックオフミーティングを実施しました', body: '新しい社内ポータルサイトの要件整理を目的としたキックオフミーティングを実施しました。今後デモ環境で機能を順次確認していきます。' },
  { id: 'n06', date: '2026-05-28', category: '人事', title: '安全大会を開催しました', body: '全部門合同の安全大会を本社会議室にて開催しました。年間の労働災害ゼロを改めて確認しました。' },
  { id: 'n07', date: '2026-05-20', category: 'お知らせ', title: '夏季休暇の取得についてのお願い', body: '繁忙期を避けた計画的な夏季休暇の取得にご協力ください。申請は各種申請ページから行えます。' },
  { id: 'n08', date: '2026-05-12', category: 'システム', title: '取引先一覧ページを公開しました', body: '取引先ごとの契約情報・担当者・実績を一覧できる取引先一覧ページを公開しました。' },
  { id: 'n09', date: '2026-05-01', category: '人事', title: '新卒採用説明会の開催日程が決まりました', body: '来春入社に向けた新卒採用説明会を6月中旬に開催予定です。詳細はキャリアページをご確認ください。' },
  { id: 'n10', date: '2026-04-22', category: 'お知らせ', title: '樹木リスク評価業務の法令改正情報を更新しました', body: '関連法令のガイドライン改訂に伴い、TREE RISK ASSESSMENT部門の法令・ガイドラインページを更新しました。' },
  { id: 'n11', date: '2026-04-10', category: 'システム', title: '実績ダッシュボードにCSV取込機能を追加予定です', body: '税理士事務所提供のCSVデータを直接取り込める機能を準備中です。公開までしばらくお待ちください。' },
  { id: 'n12', date: '2026-04-01', category: '人事', title: '2026年度がスタートしました', body: '本年度も安全第一で、お客様の緑を守り育てて参ります。今年度の目標はポータルトップページに掲載しています。' },
  { id: 'n13', date: '2026-03-25', category: 'お知らせ', title: '景観コンサルティング部門の提案資料を更新しました', body: 'LANDSCAPE CONSULTING部門の提案資料フォーマットを最新版に更新しました。ご利用ください。' },
  { id: 'n14', date: '2026-03-10', category: 'システム', title: '社内ポータル（モック）を公開しました', body: '社内ポータルサイトのモックアップを公開しました。ご意見・ご要望はシステム担当までお寄せください。' },
]

// ---- src/data/schedule.ts と同一内容 ----
const scheduleItems = [
  { id: 's01', date: '2026-07-08', time: '09:00', title: '緑ヶ丘ハウジング 定例点検', location: '緑ヶ丘ハウジング 中央公園棟' },
  { id: 's02', date: '2026-07-09', time: '13:30', title: '安全衛生パトロール', location: '本社周辺現場' },
  { id: 's03', date: '2026-07-10', time: '10:00', title: '市川市 樹木診断報告会', location: '市川市役所' },
  { id: 's04', date: '2026-07-14', time: '14:00', title: 'フォレストリテール外構提案 打合せ', location: 'フォレストリテール新横浜店' },
  { id: 's05', date: '2026-07-17', time: '09:30', title: '月次実績会議', location: '本社会議室' },
  { id: 's06', date: '2026-07-22', time: '11:00', title: 'ヒルトップリゾート 提案プレゼン', location: 'ヒルトップリゾート熱海' },
]

// ---- src/data/clients.ts と同一内容 ----
const clients = [
  { id: 'c01', code: 'C001', name: '緑ヶ丘ハウジング株式会社', industry: '不動産・住宅', contact_person: '田中 一郎', address: '東京都世田谷区緑ヶ丘1-2-3', contract_start_date: '2018-04-01', phone: '03-1111-2222', department: 'GREEN_MAINTENANCE', status: 'active' },
  { id: 'c02', code: 'C002', name: '株式会社サンパーク管理', industry: '不動産管理', contact_person: '佐藤 花子', address: '東京都杉並区高井戸2-4-6', contract_start_date: '2019-07-15', phone: '03-2222-3333', department: 'GREEN_MAINTENANCE', status: 'active' },
  { id: 'c03', code: 'C003', name: '市川市 公園緑地課', industry: '官公庁', contact_person: '鈴木 健', address: '千葉県市川市八幡1-1-1', contract_start_date: '2015-04-01', phone: '047-333-4444', department: 'TREE_RISK_ASSESSMENT', status: 'active' },
  { id: 'c04', code: 'C004', name: '医療法人社団 若葉会', industry: '医療・福祉', contact_person: '高橋 美咲', address: '東京都練馬区若葉台3-5-7', contract_start_date: '2020-10-01', phone: '03-4444-5555', department: 'GREEN_MAINTENANCE', status: 'active' },
  { id: 'c05', code: 'C005', name: '株式会社フォレストリテール', industry: '商業施設', contact_person: '伊藤 大輔', address: '神奈川県横浜市港北区新横浜4-8-2', contract_start_date: '2021-03-01', phone: '045-555-6666', department: 'LANDSCAPE_CONSULTING', status: 'active' },
  { id: 'c06', code: 'C006', name: 'learning学園 常盤台学院', industry: '教育', contact_person: '渡辺 直樹', address: '東京都板橋区常盤台2-9-1', contract_start_date: '2017-04-01', phone: '03-6666-7777', department: 'TREE_RISK_ASSESSMENT', status: 'active' },
  { id: 'c07', code: 'C007', name: '株式会社グリーンテラス開発', industry: 'デベロッパー', contact_person: '山本 恵美', address: '東京都港区南青山3-11-5', contract_start_date: '2022-06-01', phone: '03-7777-8888', department: 'LANDSCAPE_CONSULTING', status: 'active' },
  { id: 'c08', code: 'C008', name: '社会福祉法人 陽だまり会', industry: '医療・福祉', contact_person: '中村 悠斗', address: '埼玉県さいたま市浦和区常盤6-2-3', contract_start_date: '2016-09-01', phone: '048-888-9999', department: 'GREEN_MAINTENANCE', status: 'paused' },
  { id: 'c09', code: 'C009', name: '株式会社ヒルトップリゾート', industry: 'ホテル・観光', contact_person: '小林 亮', address: '静岡県熱海市渚町1-4', contract_start_date: '2019-01-15', phone: '0557-9-0000', department: 'TREE_RISK_ASSESSMENT', status: 'active' },
  { id: 'c10', code: 'C010', name: '株式会社セントラルロジスティクス', industry: '物流', contact_person: '加藤 沙織', address: '千葉県船橋市葛飾町2-1-1', contract_start_date: '2023-04-01', phone: '047-0-1111', department: 'LANDSCAPE_CONSULTING', status: 'ended' },
]

// ---- src/data/clientAliases.ts と同一内容 ----
const clientAliases = [
  { id: 'al01', alias: '緑ヶ丘ハウジング(株)', client_id: 'c01', created_at: '2026-04-10', created_by: '管理者 太郎' },
  { id: 'al02', alias: '緑ヶ丘ハウジング', client_id: 'c01', created_at: '2026-04-10', created_by: '管理者 太郎' },
  { id: 'al03', alias: 'サンパーク管理', client_id: 'c02', created_at: '2026-04-10', created_by: '管理者 太郎' },
  { id: 'al04', alias: '市川市公園緑地課', client_id: 'c03', created_at: '2026-04-11', created_by: '管理者 太郎' },
  { id: 'al05', alias: '若葉会病院', client_id: 'c04', created_at: '2026-04-11', created_by: '管理者 太郎' },
  { id: 'al06', alias: '常盤台学院', client_id: 'c06', created_at: '2026-04-12', created_by: '管理者 太郎' },
  { id: 'al07', alias: 'グリーンテラス開発(株)', client_id: 'c07', created_at: '2026-04-12', created_by: '管理者 太郎' },
]

// ---- src/data/users.ts と同一内容 ----
const portalUsers = [
  { id: 'u01', name: '管理者 太郎', email: 'kanri@toshi-landscape.co.jp', department: null, role: 'admin' },
  { id: 'u02', name: '編集 花子', email: 'henshu@toshi-landscape.co.jp', department: 'TREE_RISK_ASSESSMENT', role: 'editor' },
  { id: 'u03', name: '現場 次郎', email: 'genba@toshi-landscape.co.jp', department: 'GREEN_MAINTENANCE', role: 'staff' },
  { id: 'u04', name: '山本 恵美', email: 'yamamoto@toshi-landscape.co.jp', department: 'LANDSCAPE_CONSULTING', role: 'editor' },
  { id: 'u05', name: '中村 悠斗', email: 'nakamura@toshi-landscape.co.jp', department: 'GREEN_MAINTENANCE', role: 'staff' },
  { id: 'u06', name: '小林 亮', email: 'kobayashi@toshi-landscape.co.jp', department: 'TREE_RISK_ASSESSMENT', role: 'staff' },
  { id: 'u07', name: '加藤 沙織', email: 'kato@toshi-landscape.co.jp', department: 'LANDSCAPE_CONSULTING', role: 'staff' },
]

// ---- src/data/sales.ts のロジックを移植（同一の疑似乱数アルゴリズム） ----
function seededRandom(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

const FISCAL_YEARS = [2023, 2024, 2025]
const DEPARTMENTS = ['GREEN_MAINTENANCE', 'TREE_RISK_ASSESSMENT', 'LANDSCAPE_CONSULTING']
const DEPT_BASE_AMOUNT = { GREEN_MAINTENANCE: 850000, TREE_RISK_ASSESSMENT: 420000, LANDSCAPE_CONSULTING: 260000 }
const DEPT_BASE_MANDAYS = { GREEN_MAINTENANCE: 12, TREE_RISK_ASSESSMENT: 5, LANDSCAPE_CONSULTING: 3 }
const DEPT_BASE_WASTE = { GREEN_MAINTENANCE: 320, TREE_RISK_ASSESSMENT: 60, LANDSCAPE_CONSULTING: 10 }

function buildSales() {
  const records = []
  for (const fiscalYear of FISCAL_YEARS) {
    for (let m = 0; m < 12; m++) {
      const monthIndex = (3 + m) % 12
      const year = monthIndex < 3 ? fiscalYear + 1 : fiscalYear
      const yearMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

      for (const client of clients) {
        for (const department of DEPARTMENTS) {
          const seed = `${client.id}-${department}-${yearMonth}`
          const r1 = seededRandom(seed)
          const r2 = seededRandom(seed + '-2')
          const clientFactor = 0.5 + seededRandom(client.id + department) * 1.2
          const seasonFactor = monthIndex === 3 || monthIndex === 4 || monthIndex === 9 || monthIndex === 10 ? 1.3 : 1.0
          const growthFactor = 1 + (fiscalYear - 2023) * 0.06

          const amount = Math.round(DEPT_BASE_AMOUNT[department] * clientFactor * seasonFactor * growthFactor * (0.7 + r1 * 0.6))
          const manDays = Math.max(0, Math.round(DEPT_BASE_MANDAYS[department] * clientFactor * seasonFactor * (0.6 + r2 * 0.8)))
          const wasteKg = Math.max(0, Math.round(DEPT_BASE_WASTE[department] * clientFactor * seasonFactor * (0.6 + r1 * r2 * 1.5)))

          records.push({
            client_id: client.id,
            department,
            year_month: yearMonth,
            fiscal_year: fiscalYear,
            amount,
            man_days: manDays,
            waste_kg: wasteKg,
          })
        }
      }
    }
  }
  return records
}

async function upsert(table, rows, conflictKey) {
  const chunkSize = 500
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: conflictKey })
    if (error) {
      console.error(`✗ ${table} への投入に失敗 (rows ${i}-${i + chunk.length}):`, error.message)
      process.exit(1)
    }
  }
  console.log(`✓ ${table}: ${rows.length}件 投入完了`)
}

async function insertOnly(table, rows) {
  // idが自動採番のテーブル用。再実行すると重複投入されるため、事前に既存行を削除してから投入する
  const { error: deleteError } = await supabase.from(table).delete().gte('id', 0)
  if (deleteError) {
    console.error(`✗ ${table} の既存データ削除に失敗:`, deleteError.message)
    process.exit(1)
  }
  const chunkSize = 500
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).insert(chunk)
    if (error) {
      console.error(`✗ ${table} への投入に失敗 (rows ${i}-${i + chunk.length}):`, error.message)
      process.exit(1)
    }
  }
  console.log(`✓ ${table}: ${rows.length}件 投入完了`)
}

async function main() {
  await upsert('news', news, 'id')
  await upsert('schedule_items', scheduleItems, 'id')
  await upsert('clients', clients, 'id')
  await upsert('client_aliases', clientAliases, 'id')
  await upsert('portal_users', portalUsers, 'id')
  await insertOnly('sales_records', buildSales())
  console.log('全データの投入が完了しました。')
}

main()
