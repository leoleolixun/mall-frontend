import assert from 'node:assert/strict'

const API_BASE = (process.env.MALL_API_BASE || 'http://127.0.0.1:8080/api/v1').replace(/\/$/, '')
const allowMutation = process.env.MALL_ALLOW_MUTATION_TESTS === '1'
const allowProductionMutation = process.env.MALL_ALLOW_PRODUCTION_MUTATION === '1'
const username = process.env.MALL_E2E_USERNAME || `codex_e2e_${Date.now()}`
const password = process.env.MALL_E2E_PASSWORD || 'MallTest_260712!'
const nickname = 'Codex E2E'
const passed = []

if (!allowMutation) {
  throw new Error('写入验收未启用，请在隔离环境设置 MALL_ALLOW_MUTATION_TESTS=1')
}
if (new URL(API_BASE).hostname === 'mall.leedu.ac.cn' && !allowProductionMutation) {
  throw new Error('拒绝修改正式商城数据；如已确认风险，需额外设置 MALL_ALLOW_PRODUCTION_MUTATION=1')
}

const request = async (name, path, options = {}) => {
  const { token, ...fetchOptions } = options
  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {})
    },
    signal: AbortSignal.timeout(15000)
  })
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok || !payload || typeof payload !== 'object' || payload.code !== 0) {
    throw new Error(`${name} failed: HTTP ${response.status}, ${typeof payload === 'string' ? payload.slice(0, 160) : JSON.stringify(payload)}`)
  }
  passed.push(name)
  console.log(`PASS ${name}`)
  return payload.data
}

const inspectAccessTokenAfterLogout = async (token) => {
  const response = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000)
  })
  if (response.status === 401) {
    console.log('PASS logout invalidates access token')
    return
  }
  if (response.status === 200) {
    console.warn('WARN access token remains valid after logout and will rely on token expiry')
    return
  }
  throw new Error(`unexpected /me status after logout: HTTP ${response.status}`)
}

console.log(`E2E account: ${username}`)

try {
  const registered = await request('register', '/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, nickname })
  })
  assert.equal(typeof registered.access_token, 'string')

  const auth = await request('login', '/auth/login/password', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  assert.equal(typeof auth.access_token, 'string')
  assert.equal(typeof auth.refresh_token, 'string')
  const token = auth.access_token

  const me = await request('read profile', '/me', { token })
  const updatedProfile = await request('update profile', '/me', {
    method: 'PUT',
    token,
    body: JSON.stringify({
      nickname: 'Codex E2E Updated',
      avatar: me.avatar || '',
      mobile: me.mobile || '',
      gender: me.gender || '',
      birthday: me.birthday || '',
      bio: 'Automated mobile API integration test'
    })
  })
  assert.equal(updatedProfile.nickname, 'Codex E2E Updated')

  const categories = await request('list categories', '/categories')
  assert.equal(Array.isArray(categories), true)
  const merchantPage = await request('list public merchants', '/merchants?page=1&page_size=20')
  assert.equal(Array.isArray(merchantPage.list), true)
  assert.equal(merchantPage.list.length > 0, true, 'no enabled merchant available')
  const merchant = await request('public merchant detail', `/merchants/${merchantPage.list[0].id}`)
  assert.equal(merchant.status, 1)
  const merchantCategories = await request('merchant categories', `/merchants/${merchant.id}/categories`)
  assert.equal(Array.isArray(merchantCategories), true)
  const merchantProducts = await request('merchant products', `/merchants/${merchant.id}/products?page=1&page_size=20`)
  assert.equal(Array.isArray(merchantProducts.list), true)
  const productPage = await request('list products', '/products?page=1&page_size=20')
  assert.equal(Array.isArray(productPage.list), true)
  assert.ok(productPage.list.length > 0, 'no product is available for E2E testing')
  const product = await request('product detail', `/products/${productPage.list[0].id}`)
  const sku = product.skus.find((item) => item.stock >= 2) || product.skus.find((item) => item.stock > 0)
  assert.ok(sku, 'no in-stock SKU is available for E2E testing')

  await request('favorite product', '/favorites/products', {
    method: 'POST',
    token,
    body: JSON.stringify({ product_id: product.id })
  })
  const favorites = await request('list favorites', '/favorites/products?page=1&page_size=20', { token })
  assert.equal(favorites.list.some((item) => item.id === product.id), true)
  await request('remove favorite', `/favorites/products/${product.id}`, { method: 'DELETE', token })

  const coupons = await request('list available coupons', '/coupons', { token })
  assert.equal(Array.isArray(coupons), true)
  const myCoupons = await request('list my coupons', '/me/coupons', { token })
  assert.equal(Array.isArray(myCoupons), true)

  await request('add cart item', '/cart/items', {
    method: 'POST',
    token,
    body: JSON.stringify({ sku_id: sku.id, quantity: 1 })
  })
  let cart = await request('read cart after add', '/cart/items', { token })
  assert.equal(cart.find((item) => item.sku_id === sku.id)?.quantity, 1)

  await request('update cart item', `/cart/items/${sku.id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ quantity: 2 })
  })
  cart = await request('read cart after update', '/cart/items', { token })
  assert.equal(cart.find((item) => item.sku_id === sku.id)?.quantity, 2)
  await request('delete cart item', `/cart/items/${sku.id}`, { method: 'DELETE', token })
  cart = await request('read cart after delete', '/cart/items', { token })
  assert.equal(cart.some((item) => item.sku_id === sku.id), false)
  await request('re-add cart item for order', '/cart/items', {
    method: 'POST',
    token,
    body: JSON.stringify({ sku_id: sku.id, quantity: 1 })
  })

  const addressPayload = {
    receiver_name: 'Codex E2E',
    receiver_phone: '13800000000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '接口测试路 1 号',
    is_default: false
  }
  let address = await request('create address', '/addresses', {
    method: 'POST',
    token,
    body: JSON.stringify(addressPayload)
  })
  address = await request('update address', `/addresses/${address.id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ ...addressPayload, detail: '接口测试路 2 号' })
  })
  assert.equal(address.detail, '接口测试路 2 号')
  await request('set default address', `/addresses/${address.id}/default`, { method: 'PUT', token })
  const addresses = await request('list addresses', '/addresses', { token })
  assert.equal(addresses.find((item) => item.id === address.id)?.is_default, true)

  const disposableAddress = await request('create disposable address', '/addresses', {
    method: 'POST',
    token,
    body: JSON.stringify({ ...addressPayload, detail: '待删除测试地址' })
  })
  await request('delete address', `/addresses/${disposableAddress.id}`, { method: 'DELETE', token })

  const orderItems = [{ sku_id: sku.id, quantity: 1 }]
  const preview = await request('preview order', '/orders/preview', {
    method: 'POST',
    token,
    body: JSON.stringify({ address_id: address.id, items: orderItems })
  })
  assert.equal(typeof preview.idempotency_token, 'string')
  const order = await request('create order', '/orders', {
    method: 'POST',
    token,
    body: JSON.stringify({
      address_id: address.id,
      remark: 'Codex E2E mobile test',
      idempotency_token: preview.idempotency_token,
      items: orderItems
    })
  })
  const orders = await request('list orders', '/orders?page=1&page_size=20', { token })
  assert.ok(orders.list.some((item) => item.id === order.id))
  const orderDetail = await request('read order detail', `/orders/${order.id}`, { token })
  assert.equal(orderDetail.order_no, order.order_no)
  await request('cancel pending order', `/orders/${order.id}/cancel`, { method: 'POST', token })
  const cancelledOrder = await request('read cancelled order', `/orders/${order.id}`, { token })
  assert.equal(cancelledOrder.status, 5)

  const afterSales = await request('list after-sales', '/after-sales?page=1&page_size=20', { token })
  assert.equal(Array.isArray(afterSales.list), true)

  cart = await request('read cart before cleanup', '/cart/items', { token })
  for (const item of cart) {
    await request(`delete cart SKU ${item.sku_id}`, `/cart/items/${item.sku_id}`, { method: 'DELETE', token })
  }
  await request('delete retained address', `/addresses/${address.id}`, { method: 'DELETE', token })

  await request('logout', '/auth/logout', {
    method: 'POST',
    token,
    body: JSON.stringify({ refresh_token: auth.refresh_token })
  })
  await inspectAccessTokenAfterLogout(token)

  console.log(`E2E API OK: ${passed.length} checks against ${API_BASE}`)
} catch (error) {
  console.error(`E2E API FAILED after ${passed.length} checks: ${error.message}`)
  console.error(`Test account retained for diagnosis: ${username}`)
  process.exitCode = 1
}
