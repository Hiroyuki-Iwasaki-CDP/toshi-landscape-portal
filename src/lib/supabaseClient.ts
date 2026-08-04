import { createClient } from '@supabase/supabase-js'

// Supabaseダッシュボードの Settings > API Keys にある「Publishable key」
// （旧称: anon key。クライアント側に埋め込んでよい公開用キー。RLSにより保護される）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Supabase未接続かどうか（環境変数未設定の場合はモックデータのみで動作させる） */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabasePublishableKey!) : null
