import { pathToFileURL } from 'node:url'

import { getGoogleAccessTokenFromWif } from '../supabase/functions/_shared/google-wif.ts'

const DRIVE_READONLY_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'
const SHEETS_READONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'

function required(env, name) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function oidcAudience(googleWifAudience) {
  return googleWifAudience.replace(
    '//iam.googleapis.com/',
    'https://iam.googleapis.com/',
  )
}

async function requestGithubOidcToken(env, audience, fetchImpl) {
  const requestUrl = required(env, 'ACTIONS_ID_TOKEN_REQUEST_URL')
  const requestToken = required(env, 'ACTIONS_ID_TOKEN_REQUEST_TOKEN')
  const url = new URL(requestUrl)
  url.searchParams.set('audience', audience)

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${requestToken}` },
  })
  if (!response.ok) throw new Error(`GitHub OIDC token request failed (${response.status})`)

  const body = await response.json()
  if (typeof body.value !== 'string' || body.value.length === 0) {
    throw new Error('GitHub OIDC token response was incomplete')
  }
  return body.value
}

async function assertGoogleApiAccess(url, accessToken, operation, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error(`${operation} failed (${response.status})`)
  await response.json()
}

export async function runWifSmokeTest(env = process.env, fetchImpl = fetch, log = console.log) {
  const audience = required(env, 'GOOGLE_WIF_AUDIENCE')
  const serviceAccountEmail = required(env, 'GOOGLE_WIF_SERVICE_ACCOUNT_EMAIL')
  const driveFolderId = required(env, 'GOOGLE_DRIVE_FOLDER_ID')
  const sheetId = required(env, 'GOOGLE_SHEET_ID')

  const subjectToken = await requestGithubOidcToken(
    env,
    oidcAudience(audience),
    fetchImpl,
  )
  log('GitHub OIDC token: OK (value not logged)')

  const googleToken = await getGoogleAccessTokenFromWif(
    subjectToken,
    { audience, serviceAccountEmail },
    [DRIVE_READONLY_SCOPE, SHEETS_READONLY_SCOPE],
    fetchImpl,
  )
  log('Google STS and service-account impersonation: OK (token not logged)')

  const driveUrl = new URL('https://www.googleapis.com/drive/v3/files')
  driveUrl.searchParams.set('q', `'${driveFolderId}' in parents and trashed = false`)
  driveUrl.searchParams.set('pageSize', '1')
  driveUrl.searchParams.set('fields', 'files(id)')
  await assertGoogleApiAccess(
    driveUrl,
    googleToken.accessToken,
    'Google Drive API check',
    fetchImpl,
  )
  log('Google Drive API: OK (file data not logged)')

  const sheetsUrl = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}`,
  )
  sheetsUrl.searchParams.set('includeGridData', 'false')
  sheetsUrl.searchParams.set('fields', 'spreadsheetId')
  await assertGoogleApiAccess(
    sheetsUrl,
    googleToken.accessToken,
    'Google Sheets API check',
    fetchImpl,
  )
  log('Google Sheets API: OK (sheet data not logged)')
}

const invokedAsScript = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedAsScript) {
  runWifSmokeTest().catch((error) => {
    console.error(error instanceof Error ? error.message : 'WIF smoke test failed')
    process.exitCode = 1
  })
}
