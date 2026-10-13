import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export class ProxySmokeError extends Error {}

/** Bounded, read-only checks. Never log a response body or credential. */
export async function runProxySmokeTest({ baseUrl, secret, spreadsheetId, expectedValue }, fetchImpl = fetch, log = console.log) {
  let base
  try { base = new URL(baseUrl) } catch { throw new ProxySmokeError('A valid proxy URL is required') }
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/') {
    throw new ProxySmokeError('The proxy URL must be a plain HTTPS origin')
  }
  if (typeof secret !== 'string' || secret.length < 32) throw new ProxySmokeError('A dedicated proxy secret is required')
  if (!/^[A-Za-z0-9_-]+$/.test(spreadsheetId ?? '')) throw new ProxySmokeError('A test spreadsheet ID is required')
  if (spreadsheetId === 'not-an-allowed-test-resource') throw new ProxySmokeError('The denied-test ID cannot be the allowed ID')

  async function request(path, id, credential, expectedStatus, label, checkBody) {
    const url = new URL(path, base)
    if (id) url.searchParams.set('spreadsheetId', id)
    let response
    try {
      response = await fetchImpl(url, {
        method: 'GET', redirect: 'error', signal: AbortSignal.timeout(30_000),
        headers: credential === undefined ? {} : { 'x-proxy-secret': credential },
      })
    } catch { throw new ProxySmokeError(`${label}: request failed (details not logged)`) }
    if (response.status !== expectedStatus) throw new ProxySmokeError(`${label}: unexpected HTTP status ${response.status}`)
    if (checkBody) {
      let body
      try { body = await response.json() } catch { throw new ProxySmokeError(`${label}: invalid JSON`) }
      if (!checkBody(body)) throw new ProxySmokeError(`${label}: unexpected response shape or test marker`)
    } else {
      await response.body?.cancel()
    }
    log(`${label}: OK (credentials and file data not logged)`)
  }

  await request('/health', undefined, undefined, 200, 'Proxy health', body => body?.ok === true)
  await request('/sheet-read', spreadsheetId, undefined, 401, 'Missing authentication rejected')
  await request('/sheet-read', spreadsheetId, `invalid-${secret.length}`, 401, 'Incorrect authentication rejected')
  await request('/sheet-read', 'not-an-allowed-test-resource', secret, 403, 'Non-allowlisted spreadsheet rejected')
  await request('/sheet-read', spreadsheetId, secret, 200, 'Allowlisted test spreadsheet', body =>
    typeof body?.sheetName === 'string' && Array.isArray(body.headers) && Array.isArray(body.records)
    && (expectedValue === undefined || body.records.some(row => row && Object.values(row).includes(expectedValue))))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const secretFile = process.env.PROXY_SECRET_FILE
    if (!secretFile) throw new ProxySmokeError('PROXY_SECRET_FILE is required')
    let secret
    try { secret = (await readFile(secretFile, 'utf8')).trim() }
    catch { throw new ProxySmokeError('Could not read the local proxy secret file') }
    await runProxySmokeTest({
      baseUrl: process.env.GOOGLE_API_PROXY_URL,
      secret,
      spreadsheetId: process.env.PROXY_TEST_SPREADSHEET_ID,
      expectedValue: process.env.PROXY_TEST_EXPECTED_VALUE,
    })
  } catch (error) {
    console.error(error instanceof ProxySmokeError ? error.message : 'Proxy smoke test failed (details not logged)')
    process.exitCode = 1
  }
}
