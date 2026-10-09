import assert from 'node:assert/strict'
import test from 'node:test'

import { getGoogleAccessTokenFromWif } from '../supabase/functions/_shared/google-wif.ts'

const config = {
  audience: '//iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/test/providers/supabase',
  serviceAccountEmail: 'portal-reader@example-project.iam.gserviceaccount.com',
}

test('exchanges a subject token and requests a one-hour scoped service-account token', async () => {
  const calls = []
  const fakeFetch = async (input, init) => {
    calls.push({ url: String(input), init })
    if (calls.length === 1) {
      return Response.json({ access_token: 'federated-token', expires_in: 3600 })
    }
    return Response.json({ accessToken: 'google-access-token', expireTime: '2026-10-06T01:00:00Z' })
  }

  const result = await getGoogleAccessTokenFromWif(
    'oidc-subject-token',
    config,
    ['https://www.googleapis.com/auth/drive.readonly'],
    fakeFetch,
  )

  assert.deepEqual(result, {
    accessToken: 'google-access-token',
    expireTime: '2026-10-06T01:00:00Z',
  })
  assert.equal(calls[0].url, 'https://sts.googleapis.com/v1/token')
  assert.equal(calls[0].init.headers.Authorization, undefined)
  const stsBody = new URLSearchParams(calls[0].init.body)
  assert.equal(stsBody.get('subject_token'), 'oidc-subject-token')
  assert.equal(stsBody.get('audience'), config.audience)

  assert.match(calls[1].url, /portal-reader%40example-project\.iam\.gserviceaccount\.com:generateAccessToken$/)
  assert.equal(calls[1].init.headers.Authorization, 'Bearer federated-token')
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    lifetime: '3600s',
  })
})

test('rejects missing ambient workload credentials before making a request', async () => {
  await assert.rejects(
    getGoogleAccessTokenFromWif('', config, ['https://www.googleapis.com/auth/spreadsheets.readonly']),
    /subject token is required/,
  )
})

test('does not reflect an unknown Google error body', async () => {
  const fakeFetch = async () => new Response('proxy included a credential-like value', { status: 502 })
  await assert.rejects(
    getGoogleAccessTokenFromWif('subject-token', config, ['scope'], fakeFetch),
    (error) => {
      assert.match(error.message, /Google STS token exchange failed \(502\)/)
      assert.doesNotMatch(error.message, /credential-like value/)
      return true
    },
  )
})

test('does not reflect credentials embedded in a JSON authentication error', async () => {
  const fakeFetch = async () => Response.json({ error: 'invalid_grant', error_description: 'secret-subject-token' }, { status: 400 })
  await assert.rejects(getGoogleAccessTokenFromWif('subject-token', config, ['scope'], fakeFetch), {
    message: 'Google STS token exchange failed (400)',
  })
})
