import assert from 'node:assert/strict'
import test from 'node:test'
import { createDenoWifTokenProvider } from '../deno/google-api-proxy/google-token.ts'
import { createHandler } from '../cloud-run/google-api-proxy/server.mjs'
import { wifConfigFromEnv } from '../deno/google-api-proxy/config.ts'

const config = {
  audience: '//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/deno-deploy/providers/portal',
  serviceAccountEmail: 'portal@example-project.iam.gserviceaccount.com',
}
const proxyConfig = {
  sharedSecret: 'a'.repeat(32), serviceAccountEmail: config.serviceAccountEmail,
  allowedDriveFolderIds: new Set(['folder']), allowedSpreadsheetIds: new Set(['sheet']),
}
const driveScope = 'https://www.googleapis.com/auth/drive.readonly'

test('accepts explicit WIF configuration and Deno Cloud Connections variables', () => {
  const explicit = { GOOGLE_WIF_AUDIENCE: config.audience, GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL: config.serviceAccountEmail }
  const cloud = { GCP_WORKLOAD_PROVIDER_ID: config.audience.slice('//iam.googleapis.com/'.length), GCP_SERVICE_ACCOUNT_EMAIL: config.serviceAccountEmail }
  assert.deepEqual(wifConfigFromEnv(explicit), config)
  assert.deepEqual(wifConfigFromEnv(cloud), config)
  assert.deepEqual(wifConfigFromEnv({ ...explicit, ...cloud }), config)
})

test('rejects conflicting connection values without including values in errors', () => {
  const cloud = { GCP_WORKLOAD_PROVIDER_ID: config.audience.slice('//iam.googleapis.com/'.length), GCP_SERVICE_ACCOUNT_EMAIL: config.serviceAccountEmail }
  assert.throws(() => wifConfigFromEnv({ ...cloud, GOOGLE_WIF_AUDIENCE: 'private-value' }), { message: 'Conflicting Google WIF provider configuration' })
  assert.throws(() => wifConfigFromEnv({ ...cloud, GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL: 'private-value' }), { message: 'Conflicting Google WIF service account configuration' })
})

test('requires valid workload configuration and never falls back to credential files or keys', () => {
  assert.throws(() => wifConfigFromEnv({ GOOGLE_APPLICATION_CREDENTIALS: '/not-read.json', GOOGLE_SERVICE_ACCOUNT_KEY: 'not-read' }), /canonical Google WIF/)
  for (const provider of ['', '../other', 'https://iam.googleapis.com/projects/123', config.audience]) {
    assert.throws(() => wifConfigFromEnv({ GCP_WORKLOAD_PROVIDER_ID: provider }), /GCP_WORKLOAD_PROVIDER_ID/)
  }
  assert.throws(() => wifConfigFromEnv({ GOOGLE_WIF_AUDIENCE: config.audience }), /service account email/)
})

function fixture() {
  let clock = Date.parse('2026-10-09T00:00:00Z')
  let issues = 0
  let failOidc = false
  const calls = []
  const getAccessToken = createDenoWifTokenProvider({
    config, now: () => clock,
    getIdToken: async (audience) => {
      if (failOidc) throw new Error('private-oidc-error')
      issues += 1
      assert.equal(audience, `https:${config.audience}`)
      return `subject-${issues}`
    },
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init })
      if (String(url).includes('sts.googleapis.com')) return Response.json({ access_token: 'federated' })
      return Response.json({ accessToken: `google-${issues}`, expireTime: new Date(clock + 3600000).toISOString() })
    },
  })
  return { getAccessToken, calls, advance: (ms) => { clock += ms }, fail: (value) => { failOidc = value } }
}

test('caches scoped tokens and refreshes with fresh runtime identity before expiry', async () => {
  const f = fixture()
  assert.equal(await f.getAccessToken([driveScope]), 'google-1')
  f.advance(54 * 60000)
  assert.equal(await f.getAccessToken([driveScope]), 'google-1')
  f.advance(2 * 60000)
  assert.equal(await f.getAccessToken([driveScope]), 'google-2')
  assert.equal(f.calls.length, 4)
  assert.equal(new URLSearchParams(f.calls[2].init.body).get('subject_token'), 'subject-2')
  assert.deepEqual(JSON.parse(f.calls[3].init.body), { scope: [driveScope], lifetime: '3600s' })
})

test('deduplicates concurrent acquisition and keeps different OAuth scopes isolated', async () => {
  const f = fixture()
  assert.deepEqual(await Promise.all(Array.from({ length: 10 }, () => f.getAccessToken([driveScope]))), Array(10).fill('google-1'))
  assert.equal(f.calls.length, 2)
  assert.equal(await f.getAccessToken(['https://www.googleapis.com/auth/spreadsheets.readonly']), 'google-2')
  assert.equal(f.calls.length, 4)
})

test('retries after an identity failure and does not expose SDK error contents', async () => {
  const f = fixture()
  f.fail(true)
  await assert.rejects(f.getAccessToken([driveScope]), { message: 'Deno workload identity token acquisition failed' })
  f.fail(false)
  assert.equal(await f.getAccessToken([driveScope]), 'google-1')
})

test('rejects invalid expiry rather than caching unusable credentials', async () => {
  const provider = createDenoWifTokenProvider({
    config, getIdToken: async () => 'subject',
    fetchImpl: async (url) => String(url).includes('sts.googleapis.com')
      ? Response.json({ access_token: 'federated' })
      : Response.json({ accessToken: 'token', expireTime: 'not-a-date' }),
  })
  await assert.rejects(provider([driveScope]), /invalid or nearly expired token/)
})

test('rejects unauthenticated and non-allowlisted requests before acquiring any identity', async () => {
  const handler = createHandler(proxyConfig, { getAccessToken: async () => { throw new Error('must not acquire') } })
  assert.equal((await handler(new Request('https://proxy.example/drive-list?folderId=folder'))).status, 401)
  assert.equal((await handler(new Request('https://proxy.example/sheet-read?spreadsheetId=other', { headers: { 'x-proxy-secret': proxyConfig.sharedSecret } }))).status, 403)
})

test('preserves Sheet response shape using injected WIF identity, without metadata or key auth', async () => {
  const calls = []
  const handler = createHandler(proxyConfig, {
    getAccessToken: async (scopes) => {
      assert.deepEqual(scopes, ['https://www.googleapis.com/auth/spreadsheets.readonly'])
      return 'private-google-token'
    },
    fetchImpl: async (url, init) => {
      calls.push(String(url))
      assert.equal(init.headers.Authorization, 'Bearer private-google-token')
      return calls.length === 1
        ? Response.json({ sheets: [{ properties: { title: 'Example' } }] })
        : Response.json({ values: [['Name', 'Status'], ['Test', 'Ready']] })
    },
  })
  const response = await handler(new Request('https://proxy.example/sheet-read?spreadsheetId=sheet', { headers: { 'x-proxy-secret': proxyConfig.sharedSecret } }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { sheetName: 'Example', headers: ['Name', 'Status'], records: [{ Name: 'Test', Status: 'Ready' }] })
  assert.equal(calls.length, 2)
  assert.ok(calls.every((url) => url.startsWith('https://sheets.googleapis.com/')))
})
