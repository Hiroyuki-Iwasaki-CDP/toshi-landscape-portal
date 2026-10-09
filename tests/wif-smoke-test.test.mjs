import assert from 'node:assert/strict'
import test from 'node:test'

import { runWifSmokeTest } from '../scripts/wif-smoke-test.mjs'

const env = {
  ACTIONS_ID_TOKEN_REQUEST_URL: 'https://github.example.test/oidc?api-version=1',
  ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'github-request-token',
  GOOGLE_WIF_AUDIENCE: '//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/github/providers/toshi-portal',
  GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL: 'portal-reader@example-project.iam.gserviceaccount.com',
  GOOGLE_DRIVE_FOLDER_ID: 'drive-folder-id',
  GOOGLE_SHEET_ID: 'sheet-id',
}

test('runs the complete GitHub OIDC to Drive and Sheets smoke-test flow without logging credentials', async () => {
  const calls = []
  const logs = []
  const fakeFetch = async (input, init) => {
    const url = String(input)
    calls.push({ url, init })
    if (url.startsWith('https://github.example.test/oidc')) {
      return Response.json({ value: 'github-oidc-jwt' })
    }
    if (url === 'https://sts.googleapis.com/v1/token') {
      return Response.json({ access_token: 'federated-token' })
    }
    if (url.includes(':generateAccessToken')) {
      return Response.json({
        accessToken: 'google-access-token',
        expireTime: '2026-10-06T01:00:00Z',
      })
    }
    if (url.startsWith('https://www.googleapis.com/drive/v3/files')) {
      return Response.json({ files: [{ id: 'hidden-file-id' }] })
    }
    if (url.startsWith('https://sheets.googleapis.com/v4/spreadsheets/')) {
      return Response.json({ spreadsheetId: 'sheet-id' })
    }
    throw new Error(`Unexpected request: ${url}`)
  }

  await runWifSmokeTest(env, fakeFetch, (message) => logs.push(message))

  assert.equal(calls.length, 5)
  const oidcUrl = new URL(calls[0].url)
  assert.equal(
    oidcUrl.searchParams.get('audience'),
    'https://iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/github/providers/toshi-portal',
  )
  assert.equal(calls[0].init.headers.Authorization, 'Bearer github-request-token')
  assert.equal(calls[3].init.headers.Authorization, 'Bearer google-access-token')
  assert.equal(calls[4].init.headers.Authorization, 'Bearer google-access-token')

  const output = logs.join('\n')
  for (const sensitiveValue of [
    'github-request-token',
    'github-oidc-jwt',
    'federated-token',
    'google-access-token',
    'drive-folder-id',
    'sheet-id',
    'hidden-file-id',
    'hidden-sheet-id',
  ]) {
    assert.doesNotMatch(output, new RegExp(sensitiveValue))
  }
})

test('does not mistake an empty Drive listing for successful file access', async () => {
  let call = 0
  const fakeFetch = async () => {
    call += 1
    if (call === 1) return Response.json({ value: 'oidc' })
    if (call === 2) return Response.json({ access_token: 'sts' })
    if (call === 3) return Response.json({ accessToken: 'access', expireTime: '2026-10-09T10:00:00Z' })
    return Response.json({ files: [] })
  }
  await assert.rejects(runWifSmokeTest(env, fakeFetch, () => {}), /no accessible test files/)
})

test('checks a known cell without exposing values on mismatch', async () => {
  const testEnv = { ...env, GOOGLE_DRIVE_FILE_ID: 'shared-test-file', GOOGLE_DRIVE_FOLDER_ID: undefined, GOOGLE_SHEET_TEST_RANGE: "'WIF test'!B2", GOOGLE_SHEET_EXPECTED_VALUE: 'expected-value' }
  for (const value of ['expected-value', 'private-wrong-value']) {
    let call = 0
    const fakeFetch = async () => {
      call += 1
      if (call === 1) return Response.json({ value: 'oidc' })
      if (call === 2) return Response.json({ access_token: 'sts' })
      if (call === 3) return Response.json({ accessToken: 'access', expireTime: '2026-10-09T10:00:00Z' })
      if (call === 4) return Response.json({ id: 'shared-test-file' })
      if (call === 5) return Response.json({ spreadsheetId: env.GOOGLE_SHEET_ID })
      return Response.json({ values: [[value]] })
    }
    if (value === 'expected-value') await runWifSmokeTest(testEnv, fakeFetch, () => {})
    else await assert.rejects(runWifSmokeTest(testEnv, fakeFetch, () => {}), { message: 'Google Sheets test value did not match' })
  }
})

test('does not reflect a Google API error body into the workflow log', async () => {
  const logs = []
  let call = 0
  const fakeFetch = async () => {
    call += 1
    if (call === 1) return Response.json({ value: 'github-oidc-jwt' })
    if (call === 2) return Response.json({ access_token: 'federated-token' })
    if (call === 3) {
      return Response.json({
        accessToken: 'google-access-token',
        expireTime: '2026-10-06T01:00:00Z',
      })
    }
    return new Response('sensitive upstream response', { status: 403 })
  }

  await assert.rejects(
    runWifSmokeTest(env, fakeFetch, (message) => logs.push(message)),
    (error) => {
      assert.equal(error.message, 'Google Drive API check failed (403)')
      assert.doesNotMatch(error.message, /sensitive upstream response/)
      return true
    },
  )
})
