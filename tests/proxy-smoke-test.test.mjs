import assert from 'node:assert/strict'
import test from 'node:test'
import { runProxySmokeTest } from '../scripts/proxy-smoke-test.mjs'

const config = { baseUrl: 'https://test.example/', secret: 'x'.repeat(64), spreadsheetId: 'test-sheet', expectedValue: 'WIF_TEST_OK' }

test('runs five bounded read-only checks without logging credentials or sheet data', async () => {
  const logs = []
  const calls = []
  const statuses = [200, 401, 401, 403, 200]
  await runProxySmokeTest(config, async (url, options) => {
    calls.push({ url, options })
    const status = statuses.shift()
    const body = calls.length === 1 ? { ok: true } : calls.length === 5
      ? { sheetName: 'private-sheet-name', headers: ['private-column'], records: [{ value: 'WIF_TEST_OK' }] }
      : { error: config.secret }
    return Response.json(body, { status })
  }, line => logs.push(line))
  assert.equal(calls.length, 5)
  assert.ok(calls.every(call => call.options.method === 'GET' && call.options.redirect === 'error' && call.options.signal))
  assert.equal(calls[1].options.headers['x-proxy-secret'], undefined)
  assert.notEqual(calls[2].options.headers['x-proxy-secret'], config.secret)
  assert.equal(calls[3].options.headers['x-proxy-secret'], config.secret)
  assert.equal(logs.length, 5)
  for (const sensitive of [config.secret, 'private-sheet-name', 'private-column', 'WIF_TEST_OK']) {
    assert.ok(!logs.join('\n').includes(sensitive))
  }
})

test('rejects unsafe URLs before transmitting a secret', async () => {
  for (const baseUrl of ['http://test.example/', 'https://user:password@test.example/', 'https://test.example/?secret=x', 'https://test.example/#x', 'https://test.example/subpath']) {
    let calls = 0
    await assert.rejects(runProxySmokeTest({ ...config, baseUrl }, async () => { calls++ }), /HTTPS origin/)
    assert.equal(calls, 0)
  }
})

test('fails closed without reflecting upstream error bodies or fetch errors', async () => {
  await assert.rejects(runProxySmokeTest(config, async () => Response.json({ secret: config.secret }, { status: 502 })),
    { message: 'Proxy health: unexpected HTTP status 502' })
  await assert.rejects(runProxySmokeTest(config, async () => { throw new Error(config.secret) }),
    { message: 'Proxy health: request failed (details not logged)' })
})

test('does not mistake an empty or wrong sheet response for a known marker', async () => {
  let call = 0
  await assert.rejects(runProxySmokeTest(config, async () => {
    call++
    if (call === 1) return Response.json({ ok: true })
    if (call < 5) return Response.json({}, { status: call === 4 ? 403 : 401 })
    return Response.json({ sheetName: 'private', headers: [], records: [] })
  }, () => {}), { message: 'Allowlisted test spreadsheet: unexpected response shape or test marker' })
})
