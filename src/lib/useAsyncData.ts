import { useEffect, useState } from 'react'

interface AsyncDataState<T> {
  data: T | undefined
  loading: boolean
  error: string | null
}

// Error以外(SupabaseのPostgrestErrorなど、messageプロパティを持つプレーンオブジェクト)にも対応
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message
  return String(err)
}

/** Supabase等の非同期データ取得を統一的に扱うための簡易フック */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncDataState<T> {
  const [state, setState] = useState<AsyncDataState<T>>({ data: undefined, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ data: undefined, loading: false, error: extractErrorMessage(err) })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
