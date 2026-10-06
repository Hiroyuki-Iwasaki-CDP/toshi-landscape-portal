import assert from 'node:assert/strict'
import test from 'node:test'

import { createHandler } from '../server.mjs'

const config = {
  sharedSecret: 'a'.repeat(32),
  serviceAccountEmail: 'toshi-portal@test-project.iam.gserviceaccount.com',
  allowedDriveFolderIds: new Set(['allowed-folder']),
  allowedSpreadsheetIds: new Set(['allowed-sheet']),
}

test('rejects missing proxy authentication', async () => {
  const handler = createHandler(config)
  const response = await handler(new Request('http://localhost/drive-list?folderId=allowed-folder'))
  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: 'unauthorized' })
})

test('rejects IDs outside the allowlist before requesting a Google token', async () => {
  let calls = 0
  const handler = createHandler(config, { fetchImpl: async () => { calls += 1 } })
  const response = await handler(new Request('http://localhost/drive-list?folderId=other-folder', {
    headers: { 'x-proxy-secret': config.sharedSecret },
  }))
  assert.equal(response.status, 403)
  assert.equal(calls, 0)
})

test('uses metadata identity, self-impersonation, and a scoped token for Drive', async () => {
  const calls = []
  const fetchImpl = async (input, init = {}) => {
    calls.push({ url: String(input), init })
    if (calls.length === 1) return Response.json({ access_token: 'metadata-token' })
    if (calls.length === 2) {
      return Response.json({ accessToken: 'drive-token', expireTime: '2099-01-01T00:00:00Z' })
    }
    return Response.json({ files: [{ id: 'doc-1', name: 'Manual', mimeType: 'application/vnd.google-apps.document' }] })
  }
  const handler = createHandler(config, { fetchImpl })
  const response = await handler(new Request('http://localhost/drive-list?folderId=allowed-folder', {
    headers: { 'x-proxy-secret': config.sharedSecret },
  }))

  assert.equal(response.status, 200)
  assert.equal(calls[0].init.headers['Metadata-Flavor'], 'Google')
  assert.equal(calls[1].init.headers.Authorization, 'Bearer metadata-token')
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    lifetime: '3600s',
  })
  assert.equal(calls[2].init.headers.Authorization, 'Bearer drive-token')
})
