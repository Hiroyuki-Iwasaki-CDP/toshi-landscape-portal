import { timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { extractText, getDocumentProxy } from 'unpdf'

const METADATA_TOKEN_URL =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token'
const IAM_CREDENTIALS_URL = 'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'
const EXCERPT_LENGTH = 140

function csvSet(value) {
  return new Set((value ?? '').split(',').map((item) => item.trim()).filter(Boolean))
}

export function configFromEnv(env = process.env) {
  const config = {
    sharedSecret: env.PROXY_SHARED_SECRET ?? '',
    serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
    allowedDriveFolderIds: csvSet(env.ALLOWED_DRIVE_FOLDER_IDS),
    allowedSpreadsheetIds: csvSet(env.ALLOWED_SPREADSHEET_IDS),
  }
  if (config.sharedSecret.length < 32) throw new Error('PROXY_SHARED_SECRET must contain at least 32 characters')
  if (!config.serviceAccountEmail.endsWith('.iam.gserviceaccount.com')) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL must be a service account email')
  }
  if (config.allowedDriveFolderIds.size === 0 && config.allowedSpreadsheetIds.size === 0) {
    throw new Error('At least one Drive folder or spreadsheet must be allowlisted')
  }
  return config
}

function secretMatches(actual, expected) {
  const actualBuffer = Buffer.from(actual ?? '')
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

async function googleError(response, operation) {
  let message = ''
  try {
    const body = await response.json()
    message = body?.error?.message ?? body?.error_description ?? ''
  } catch {
    // Never reflect unknown authentication response bodies.
  }
  return new Error(`${operation} failed (${response.status})${message ? `: ${String(message).slice(0, 300)}` : ''}`)
}

export function createGoogleTokenProvider({ fetchImpl = fetch, serviceAccountEmail }) {
  const cache = new Map()

  return async function getAccessToken(scopes) {
    const cacheKey = [...scopes].sort().join(' ')
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) return cached.accessToken

    const metadataResponse = await fetchImpl(METADATA_TOKEN_URL, {
      headers: { 'Metadata-Flavor': 'Google' },
    })
    if (!metadataResponse.ok) throw await googleError(metadataResponse, 'Cloud Run metadata token request')
    const metadata = await metadataResponse.json()
    if (!metadata.access_token) throw new Error('Cloud Run metadata response did not include an access token')

    const response = await fetchImpl(
      `${IAM_CREDENTIALS_URL}/${encodeURIComponent(serviceAccountEmail)}:generateAccessToken`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metadata.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scope: [...scopes], lifetime: '3600s' }),
      },
    )
    if (!response.ok) throw await googleError(response, 'Service account access token request')
    const data = await response.json()
    if (!data.accessToken || !data.expireTime) throw new Error('Service account token response was incomplete')
    cache.set(cacheKey, { accessToken: data.accessToken, expiresAt: Date.parse(data.expireTime) })
    return data.accessToken
  }
}

async function getExcerpt(fileId, token, fetchImpl) {
  try {
    const response = await fetchImpl(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return ''
    const pdf = await getDocumentProxy(new Uint8Array(await response.arrayBuffer()))
    const { text } = await extractText(pdf, { mergePages: true })
    return text.replace(/\s+/g, ' ').trim().slice(0, EXCERPT_LENGTH)
  } catch {
    return ''
  }
}

export function createHandler(config, { fetchImpl = fetch } = {}) {
  const getAccessToken = createGoogleTokenProvider({
    fetchImpl,
    serviceAccountEmail: config.serviceAccountEmail,
  })

  return async function handle(request) {
    const url = new URL(request.url)
    if (url.pathname === '/health') return json({ ok: true })
    if (!secretMatches(request.headers.get('x-proxy-secret'), config.sharedSecret)) {
      return json({ error: 'unauthorized' }, 401)
    }

    try {
      if (url.pathname === '/drive-list') {
        const folderId = url.searchParams.get('folderId') ?? ''
        if (!config.allowedDriveFolderIds.has(folderId)) return json({ error: 'folderId is not allowed' }, 403)
        const token = await getAccessToken([DRIVE_SCOPE])
        const query = new URLSearchParams({
          q: `'${folderId}' in parents`,
          fields: 'files(id,name,mimeType,modifiedTime,webViewLink,iconLink,thumbnailLink,lastModifyingUser(displayName))',
          orderBy: 'name',
        })
        const response = await fetchImpl(`https://www.googleapis.com/drive/v3/files?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw await googleError(response, 'Drive API request')
        const data = await response.json()
        const files = await Promise.all((data.files ?? []).map(async (file) =>
          file.mimeType === 'application/pdf'
            ? { ...file, excerpt: await getExcerpt(file.id, token, fetchImpl) }
            : file,
        ))
        return json({ files })
      }

      if (url.pathname === '/sheet-read') {
        const spreadsheetId = url.searchParams.get('spreadsheetId') ?? ''
        if (!config.allowedSpreadsheetIds.has(spreadsheetId)) {
          return json({ error: 'spreadsheetId is not allowed' }, 403)
        }
        const token = await getAccessToken([SHEETS_SCOPE])
        const headers = { Authorization: `Bearer ${token}` }
        const metadataResponse = await fetchImpl(
          `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties.title`,
          { headers },
        )
        if (!metadataResponse.ok) throw await googleError(metadataResponse, 'Sheets metadata request')
        const metadata = await metadataResponse.json()
        const sheetName = metadata.sheets?.[0]?.properties?.title
        if (!sheetName) throw new Error('Spreadsheet did not contain a readable sheet')
        const range = encodeURIComponent(`${sheetName}!A1:Z200`)
        const valuesResponse = await fetchImpl(
          `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}`,
          { headers },
        )
        if (!valuesResponse.ok) throw await googleError(valuesResponse, 'Sheets values request')
        const values = (await valuesResponse.json()).values ?? []
        const [header = [], ...body] = values
        const records = body.map((row) => Object.fromEntries(header.map((column, index) => [column, row[index] ?? ''])))
        return json({ sheetName, headers: header, records })
      }

      return json({ error: 'not found' }, 404)
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'unexpected error' }, 502)
    }
  }
}

export function startServer(config = configFromEnv(), port = Number(process.env.PORT ?? 8080)) {
  const handler = createHandler(config)
  return createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const request = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: chunks.length ? Buffer.concat(chunks) : undefined,
    })
    const response = await handler(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(Buffer.from(await response.arrayBuffer()))
  }).listen(port)
}
