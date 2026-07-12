import assert from 'node:assert/strict'

const API_BASE = 'https://mall.leedu.ac.cn/api/v1'
const TIMEOUT_MS = 15000
const CORS_ORIGIN = process.env.MALL_TEST_ORIGIN || 'http://localhost:8080'

const request = async (path, options = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const { token, headers, ...fetchOptions } = options

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {})
      },
      signal: controller.signal
    })
    const contentType = response.headers.get('content-type') || ''
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      throw new Error(`${options.method || 'GET'} ${path} returned HTTP ${response.status}: ${String(body).slice(0, 160)}`)
    }
    assert.equal(typeof body, 'object', `${path} did not return JSON`)
    if (body.code !== 0) {
      throw new Error(`${path} returned API code ${body.code}: ${body.message || 'unknown error'}`)
    }
    return body.data
  } finally {
    clearTimeout(timer)
  }
}

const checks = []
const failures = []
const warnings = []
const check = async (name, callback) => {
  const startedAt = Date.now()
  try {
    await callback()
    checks.push({ name, duration: Date.now() - startedAt })
    console.log(`PASS ${name} (${Date.now() - startedAt}ms)`)
    return true
  } catch (error) {
    const message = error && error.message ? error.message : String(error)
    failures.push({ name, message })
    console.error(`FAIL ${name}: ${message}`)
    return false
  }
}

const diagnostic = async (name, callback) => {
  try {
    await callback()
    console.log(`PASS ${name}`)
  } catch (error) {
    const message = error && error.message ? error.message : String(error)
    warnings.push({ name, message })
    console.warn(`WARN ${name}: ${message}`)
  }
}

let categories
let products

await check('GET /categories', async () => {
  categories = await request('/categories')
  assert.equal(Array.isArray(categories), true, 'categories data must be an array')
})

const productsReady = await check('GET /products', async () => {
  products = await request('/products?page=1&page_size=5')
  assert.equal(Array.isArray(products.list), true, 'products.list must be an array')
  assert.equal(typeof products.total, 'number', 'products.total must be a number')
})

if (productsReady && products.list.length) {
  await check('GET /products/:id', async () => {
    const detail = await request(`/products/${products.list[0].id}`)
    assert.equal(Array.isArray(detail.skus), true, 'product detail skus must be an array')
  })
}

await diagnostic('OPTIONS /products (direct CORS)', async () => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'OPTIONS',
      headers: {
        Origin: CORS_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type'
      },
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`CORS preflight returned HTTP ${response.status}`)
    const allowedOrigin = response.headers.get('access-control-allow-origin')
    if (allowedOrigin !== '*' && allowedOrigin !== CORS_ORIGIN) {
      throw new Error(`Access-Control-Allow-Origin is ${allowedOrigin || 'missing'}, expected ${CORS_ORIGIN} or *`)
    }
  } finally {
    clearTimeout(timer)
  }
})

const shouldRegister = process.env.MALL_TEST_REGISTER === '1'
const username = process.env.MALL_TEST_USERNAME || (shouldRegister ? `codex_${Date.now()}` : '')
const password = process.env.MALL_TEST_PASSWORD || (shouldRegister ? 'MallTest_260712!' : '')
const nickname = process.env.MALL_TEST_NICKNAME || 'Codex API Test'
let token

if (shouldRegister) {
  console.log(`TEST registration account: ${username}`)
  await check('POST /auth/register', async () => {
    const auth = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname })
    })
    assert.equal(typeof auth.access_token, 'string', 'register did not return access_token')
    token = auth.access_token
  })
}

if (username && password) {
  const loggedIn = await check('POST /auth/login/password', async () => {
    const auth = await request('/auth/login/password', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    assert.equal(typeof auth.access_token, 'string', 'login did not return access_token')
    token = auth.access_token
  })

  if (loggedIn && token) {
    await check('GET /me', () => request('/me', { token }))
    await check('GET /cart/items', async () => {
      const items = await request('/cart/items', { token })
      assert.equal(Array.isArray(items), true, 'cart data must be an array')
    })
    await check('GET /addresses', async () => {
      const addresses = await request('/addresses', { token })
      assert.equal(Array.isArray(addresses), true, 'addresses data must be an array')
    })
    await check('GET /orders', async () => {
      const orders = await request('/orders?page=1&page_size=5', { token })
      assert.equal(Array.isArray(orders.list), true, 'orders.list must be an array')
    })
  }
} else {
  console.log('SKIP authenticated reads (set MALL_TEST_USERNAME and MALL_TEST_PASSWORD)')
}

if (failures.length) {
  console.error(`Live API FAILED: ${failures.length} failed, ${checks.length} passed against ${API_BASE}`)
  process.exitCode = 1
} else {
  console.log(`Live API OK: ${checks.length} checks, ${warnings.length} diagnostics warning against ${API_BASE}`)
}
