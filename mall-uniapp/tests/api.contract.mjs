import assert from 'node:assert/strict'
import fs from 'node:fs'

const storage = new Map()
const calls = []
let responder = (options) => options.success({ statusCode: 200, data: { code: 0, message: 'ok', data: null } })

globalThis.uni = {
  getStorageSync(key) {
    return storage.get(key)
  },
  setStorageSync(key, value) {
    storage.set(key, value)
  },
  removeStorageSync(key) {
    storage.delete(key)
  },
  request(options) {
    calls.push(options)
    responder(options)
  }
}

const importSource = (source) => import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const clientSource = fs.readFileSync(new URL('../api/client.js', import.meta.url), 'utf8')
const clientModule = await importSource(clientSource)
assert.equal(clientModule.API_BASE, 'https://mall.leedu.ac.cn/api/v1')

globalThis.window = {}
globalThis.document = {}
const h5ClientModule = await importSource(`${clientSource}\n// h5 contract instance`)
assert.equal(h5ClientModule.API_BASE, '/api/v1')
delete globalThis.window
delete globalThis.document

globalThis.__mallApiClient = clientModule

const mallApiSource = fs.readFileSync(new URL('../api/mallApi.js', import.meta.url), 'utf8').replace(
  "import { authStorage, buildQuery, request } from './client.js'",
  'const { authStorage, buildQuery, request } = globalThis.__mallApiClient'
)
const apiModule = await importSource(mallApiSource)
const { request } = clientModule
const { addressApi, authApi, cartApi, catalogApi, orderApi, paymentApi } = apiModule

authApi.storage.write({ access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 1 } })

await catalogApi.categories()
await catalogApi.productDetail(9)
await catalogApi.products({ page: 2, pageSize: 5, categoryId: 3, keyword: ' 蓝牙耳机 ' })
await cartApi.addItem(11, 2)
await cartApi.deleteItem(11)
await cartApi.items()
await cartApi.updateItem(11, 4)
await authApi.login({ username: 'demo', password: 'secret' })
await authApi.logout('refresh-token')
await authApi.me()
await authApi.register({ username: 'demo2', password: 'secret', nickname: 'Demo' })
await authApi.updateProfile({ nickname: 'Demo' })
await addressApi.create({ receiver_name: 'Lee' })
await addressApi.delete(5)
await addressApi.list()
await addressApi.setDefault(5)
await addressApi.update(5, { receiver_name: 'Lee' })
await orderApi.create({ address_id: 5, items: [] })
await orderApi.list({ page: 2, pageSize: 10, status: 1 })
await orderApi.preview({ address_id: 5, items: [] })
await orderApi.pay(7)
await paymentApi.create({ order_id: 7, pay_channel: 'mock', pay_scene: 'mock' })
await paymentApi.detail('PAY/7')
await paymentApi.mockComplete('PAY/7')

const contracts = calls.map((call) => `${call.method || 'GET'} ${call.url.replace('https://mall.leedu.ac.cn/api/v1', '')}`)
assert.deepEqual(contracts, [
  'GET /categories',
  'GET /products/9',
  'GET /products?page=2&page_size=5&category_id=3&keyword=%E8%93%9D%E7%89%99%E8%80%B3%E6%9C%BA',
  'POST /cart/items',
  'DELETE /cart/items/11',
  'GET /cart/items',
  'PUT /cart/items/11',
  'POST /auth/login/password',
  'POST /auth/logout',
  'GET /me',
  'POST /auth/register',
  'PUT /me',
  'POST /addresses',
  'DELETE /addresses/5',
  'GET /addresses',
  'PUT /addresses/5/default',
  'PUT /addresses/5',
  'POST /orders',
  'GET /orders?page=2&page_size=10&status=1',
  'POST /orders/preview',
  'POST /orders/7/pay',
  'POST /payments',
  'GET /payments/PAY%2F7',
  'POST /payments/PAY%2F7/mock-complete'
])

assert.equal(calls[0].header.Authorization, undefined)
assert.equal(calls[3].header.Authorization, 'Bearer access-token')
assert.equal(calls[7].header.Authorization, undefined)
assert.deepEqual(calls[3].data, { sku_id: 11, quantity: 2 })

responder = (options) => options.success({ statusCode: 502, data: '<html>Bad Gateway</html>' })
await assert.rejects(request('/categories', { auth: false }), (error) => error.status === 502 && error.message.includes('HTTP 502'))

responder = (options) => options.success({ statusCode: 401, data: { code: 401, message: 'unauthorized' } })
await assert.rejects(request('/me'), (error) => error.status === 401)
assert.equal(authApi.storage.read(), null)

const mobilePagesSource = fs.readFileSync(new URL('../common/mobilePages.js', import.meta.url), 'utf8')
const mobilePagesModule = await importSource(mobilePagesSource)
globalThis.__mallPageClient = clientModule
globalThis.__mobilePagesModule = mobilePagesModule
const adapterSource = fs.readFileSync(new URL('../common/mallPageAdapters.js', import.meta.url), 'utf8')
  .replace(
    "import { formatMoney, normalizeAssetUrl } from '@/api/client.js'",
    'const { formatMoney, normalizeAssetUrl } = globalThis.__mallPageClient'
  )
  .replace(
    "import { mobilePages } from './mobilePages.js'",
    'const { mobilePages } = globalThis.__mobilePagesModule'
  )
const adapters = await importSource(adapterSource)
const homePage = adapters.createHomePage(
  [{ id: 3, name: '数码' }],
  [{ id: 9, name: '蓝牙耳机', min_price: 29900, cover: '/uploads/9.jpg' }]
)
const homeProduct = homePage.blocks.find((block) => block.type === 'products').items[0]
assert.equal(homeProduct.price, '¥299')
assert.equal(homeProduct.image, 'https://mall.leedu.ac.cn/uploads/9.jpg')
assert.equal(homeProduct.target, '/pages/product/detail?id=9')

const detailPage = adapters.createDetailPage({
  id: 9,
  name: '蓝牙耳机',
  cover: '/uploads/9.jpg',
  description: '主动降噪',
  skus: [{ id: 11, name: '黑色', image: '', price: 29900, stock: 8 }]
}, 11)
assert.equal(detailPage.bottom.secondaryAction, 'addCart')
assert.equal(detailPage.blocks.find((block) => block.type === 'sku').active, 11)

const cartPage = adapters.createCartPage([{
  sku_id: 11,
  product_id: 9,
  product_name: '蓝牙耳机',
  sku_name: '黑色',
  sku_image: '/uploads/9.jpg',
  price: 29900,
  quantity: 2,
  subtotal: 59800,
  available: true
}])
assert.equal(cartPage.bottom.total, '合计 ¥598')

console.log(`API contract OK: ${contracts.length} endpoints, auth, errors and page adapters verified`)
