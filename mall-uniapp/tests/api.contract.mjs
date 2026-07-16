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
const clientSource = fs.readFileSync(new URL('../src/api/client.js', import.meta.url), 'utf8')
const clientModule = await importSource(clientSource)
assert.equal(clientModule.API_BASE, 'https://mall.leedu.ac.cn/api/v1')

globalThis.__MALL_SITE_ORIGIN__ = 'https://test-mall.example.com/'
const configuredClientModule = await importSource(`${clientSource}\n// configured origin contract instance`)
assert.equal(configuredClientModule.SITE_ORIGIN, 'https://test-mall.example.com')
assert.equal(configuredClientModule.API_BASE, 'https://test-mall.example.com/api/v1')
delete globalThis.__MALL_SITE_ORIGIN__

globalThis.window = {}
globalThis.document = {}
const h5ClientModule = await importSource(`${clientSource}\n// h5 contract instance`)
assert.equal(h5ClientModule.API_BASE, '/api/v1')
delete globalThis.window
delete globalThis.document

globalThis.__mallApiClient = clientModule

const mallApiSource = fs.readFileSync(new URL('../src/api/mallApi.js', import.meta.url), 'utf8').replace(
  "import { authStorage, buildQuery, request } from './client.js'",
  'const { authStorage, buildQuery, request } = globalThis.__mallApiClient'
)
const apiModule = await importSource(mallApiSource)
const { request } = clientModule
const {
  addressApi,
  afterSaleApi,
  authApi,
  cartApi,
  catalogApi,
  couponApi,
  favoriteApi,
  merchantApi,
  orderApi,
  paymentApi,
  tradeApi
} = apiModule

authApi.storage.write({ access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 1 } })

await catalogApi.categories()
await catalogApi.productDetail(9)
await catalogApi.products({ page: 2, pageSize: 5, merchantId: 2, categoryId: 3, keyword: ' 蓝牙耳机 ' })
await merchantApi.list()
await merchantApi.detail(2)
await merchantApi.categories(2)
await merchantApi.products(2, { page: 2, pageSize: 5, categoryId: 3, keyword: ' 蓝牙耳机 ' })
await cartApi.addItem(11, 2)
await cartApi.deleteItem(11)
await cartApi.items()
await cartApi.clear()
await cartApi.updateItem(11, 4)
await authApi.login({ username: 'demo', password: 'secret' })
await authApi.logout('refresh-token')
await authApi.refresh('refresh-token')
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
await orderApi.detail(7)
await orderApi.cancel(7)
await orderApi.confirm(7)
await orderApi.logistics(7)
await orderApi.preview({ address_id: 5, items: [] })
await tradeApi.preview({ address_id: 5, merchant_coupons: [], items: [] })
await tradeApi.create({ address_id: 5, merchant_coupons: [], items: [], idempotency_token: 'token' })
await tradeApi.list({ page: 2, pageSize: 10, status: 1 })
await tradeApi.detail(12)
await tradeApi.cancel(12)
await paymentApi.create({ trade_id: 12, pay_channel: 'alipay', pay_scene: 'wap' })
await paymentApi.detail('PAY/7')
await paymentApi.sync('PAY/7')
await favoriteApi.list({ page: 2, pageSize: 5 })
await favoriteApi.add(9)
await favoriteApi.delete(9)
await couponApi.available(2)
await couponApi.claim(3)
await couponApi.mine(1)
await afterSaleApi.create({ order_id: 7, order_item_id: 8, type: 'refund_only', reason: '商品问题' })
await afterSaleApi.list({ page: 2, pageSize: 5, status: 1 })
await afterSaleApi.detail(6)
await afterSaleApi.cancel(6)

const contracts = calls.map((call) => `${call.method || 'GET'} ${call.url.replace('https://mall.leedu.ac.cn/api/v1', '')}`)
assert.deepEqual(contracts, [
  'GET /categories',
  'GET /products/9',
  'GET /products?page=2&page_size=5&merchant_id=2&category_id=3&keyword=%E8%93%9D%E7%89%99%E8%80%B3%E6%9C%BA',
  'GET /merchants?page=1&page_size=20',
  'GET /merchants/2',
  'GET /merchants/2/categories',
  'GET /merchants/2/products?page=2&page_size=5&category_id=3&keyword=%E8%93%9D%E7%89%99%E8%80%B3%E6%9C%BA',
  'POST /cart/items',
  'DELETE /cart/items/11',
  'GET /cart/items',
  'DELETE /cart/items',
  'PUT /cart/items/11',
  'POST /auth/login/password',
  'POST /auth/logout',
  'POST /auth/refresh',
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
  'GET /orders/7',
  'POST /orders/7/cancel',
  'POST /orders/7/confirm',
  'GET /orders/7/logistics',
  'POST /orders/preview',
  'POST /trades/preview',
  'POST /trades',
  'GET /trades?page=2&page_size=10&status=1',
  'GET /trades/12',
  'POST /trades/12/cancel',
  'POST /payments',
  'GET /payments/PAY%2F7',
  'POST /payments/PAY%2F7/sync',
  'GET /favorites/products?page=2&page_size=5',
  'POST /favorites/products',
  'DELETE /favorites/products/9',
  'GET /coupons?merchant_id=2',
  'POST /coupons/3/claim',
  'GET /me/coupons?status=1',
  'POST /after-sales',
  'GET /after-sales?page=2&page_size=5&status=1',
  'GET /after-sales/6',
  'POST /after-sales/6/cancel'
])

assert.equal(calls[0].header.Authorization, undefined)
assert.equal(calls[7].header.Authorization, 'Bearer access-token')
assert.equal(calls[12].header.Authorization, undefined)
assert.deepEqual(calls[7].data, { sku_id: 11, quantity: 2 })
const paymentCreateCall = calls.find((call) => call.url.endsWith('/payments') && call.method === 'POST')
assert.deepEqual(paymentCreateCall.data, { trade_id: 12, pay_channel: 'alipay', pay_scene: 'wap' })

responder = (options) => options.success({ statusCode: 502, data: '<html>Bad Gateway</html>' })
await assert.rejects(request('/categories', { auth: false }), (error) => error.status === 502 && error.message.includes('HTTP 502'))

responder = (options) => options.success({ statusCode: 401, data: { code: 401, message: 'unauthorized' } })
await assert.rejects(request('/me'), (error) => error.status === 401)
assert.equal(authApi.storage.read(), null)

authApi.storage.write({ access_token: 'expired-token', refresh_token: 'refresh-token', user: { id: 1 } })
let refreshCount = 0
responder = (options) => {
  if (options.url.endsWith('/auth/refresh')) {
    refreshCount += 1
    options.success({
      statusCode: 200,
      data: {
        code: 0,
        message: 'ok',
        data: { access_token: 'renewed-token', refresh_token: 'renewed-refresh-token', user: { id: 1 } }
      }
    })
    return
  }
  if (options.header.Authorization === 'Bearer expired-token') {
    options.success({ statusCode: 401, data: { code: 401, message: 'expired' } })
    return
  }
  options.success({ statusCode: 200, data: { code: 0, message: 'ok', data: { id: 1 } } })
}
const refreshedProfile = await request('/me')
assert.equal(refreshedProfile.id, 1)
assert.equal(authApi.storage.read().access_token, 'renewed-token')
assert.equal(refreshCount, 1)

authApi.storage.write({ access_token: 'concurrent-expired', refresh_token: 'concurrent-refresh', user: { id: 1 } })
refreshCount = 0
responder = (options) => {
  setTimeout(() => {
    if (options.url.endsWith('/auth/refresh')) {
      refreshCount += 1
      options.success({
        statusCode: 200,
        data: {
          code: 0,
          message: 'ok',
          data: { access_token: 'concurrent-renewed', refresh_token: 'concurrent-renewed-refresh', user: { id: 1 } }
        }
      })
      return
    }
    if (options.header.Authorization === 'Bearer concurrent-expired') {
      options.success({ statusCode: 401, data: { code: 401, message: 'expired' } })
      return
    }
    options.success({ statusCode: 200, data: { code: 0, message: 'ok', data: { id: 1 } } })
  }, 0)
}
await Promise.all([request('/me'), request('/orders?page=1&page_size=1')])
assert.equal(refreshCount, 1)

const mobilePagesSource = fs.readFileSync(new URL('../src/common/mobilePages.js', import.meta.url), 'utf8')
const mobilePagesModule = await importSource(mobilePagesSource)
globalThis.__mallPageClient = clientModule
globalThis.__mobilePagesModule = mobilePagesModule
const adapterSource = fs.readFileSync(new URL('../src/common/mallPageAdapters.js', import.meta.url), 'utf8')
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
  [{ id: 9, merchant_id: 1, merchant_name: '测试商家', name: '蓝牙耳机', min_price: 29900, cover: '/uploads/9.jpg' }],
  [{ id: 1, name: '测试商家', logo: '/uploads/merchant.jpg' }]
)
const homeProduct = homePage.blocks.find((block) => block.type === 'products').items[0]
const homeCategory = homePage.blocks.find((block) => block.type === 'iconGrid').items[0]
assert.equal(homeCategory.target, '/pages/search/list?category_id=3')
assert.equal(homeProduct.price, '¥299')
assert.equal(homeProduct.image, 'https://mall.leedu.ac.cn/uploads/9.jpg')
assert.equal(homeProduct.target, '/pages/product/detail?id=9')
assert.equal(homeProduct.merchantName, '测试商家')
assert.equal(homePage.blocks.find((block) => block.type === 'merchantList').items[0].target, '/pages/search/list?merchant_id=1')

const detailPage = adapters.createDetailPage({
  id: 9,
  merchant_id: 1,
  merchant_name: '测试商家',
  merchant_logo: '/uploads/merchant.jpg',
  name: '蓝牙耳机',
  cover: '/uploads/9.jpg',
  description: '主动降噪',
  skus: [{ id: 11, name: '黑色', image: '', price: 29900, stock: 8 }]
}, 11)
assert.equal(detailPage.bottom.secondaryAction, 'addCart')
assert.equal(detailPage.blocks.find((block) => block.type === 'sku').active, 11)
assert.equal(detailPage.blocks.find((block) => block.type === 'merchantBanner').name, '测试商家')

const cartPage = adapters.createCartPage([{
  sku_id: 11,
  merchant_id: 1,
  merchant_name: '测试商家',
  merchant_logo: '/uploads/merchant.jpg',
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
assert.equal(cartPage.bottom.primaryDisabled, false)
assert.equal(cartPage.blocks[0].merchantName, '测试商家')

const crossMerchantCartPage = adapters.createCartPage([
  {
    sku_id: 11,
    merchant_id: 1,
    merchant_name: '测试商家',
    product_id: 9,
    product_name: '蓝牙耳机',
    sku_name: '黑色',
    price: 29900,
    quantity: 1,
    subtotal: 29900,
    available: true
  },
  {
    sku_id: 22,
    merchant_id: 2,
    merchant_name: '第二商家',
    product_id: 20,
    product_name: '键盘',
    sku_name: '标准版',
    price: 19900,
    quantity: 1,
    subtotal: 19900,
    available: true
  }
])
assert.equal(crossMerchantCartPage.blocks.length, 2)
assert.equal(crossMerchantCartPage.bottom.primaryDisabled, false)

const checkoutPage = adapters.createCheckoutPage({
  items: [
    {
      sku_id: 11,
      merchant_id: 1,
      merchant_name: '测试商家',
      product_id: 9,
      product_name: '蓝牙耳机',
      sku_name: '黑色',
      price: 29900,
      quantity: 1,
      subtotal: 29900
    },
    {
      sku_id: 22,
      merchant_id: 2,
      merchant_name: '第二商家',
      product_id: 20,
      product_name: '机械键盘',
      sku_name: '标准版',
      price: 19900,
      quantity: 1,
      subtotal: 19900
    }
  ],
  address: { id: 5, receiver_name: 'Lee', receiver_phone: '13800000000', province: '上海市', city: '上海市', district: '浦东新区', detail: '测试路 1 号' },
  preview: {
    goods_amount: 49800,
    freight_amount: 0,
    discount_amount: 4000,
    payable_amount: 45800,
    merchant_groups: [
      { merchant_id: 1, merchant_name: '测试商家', items: [{ sku_id: 11, product_name: '蓝牙耳机', sku_name: '黑色', price: 29900, quantity: 1, subtotal: 29900 }], goods_amount: 29900, freight_amount: 0, discount_amount: 3000, payable_amount: 26900 },
      { merchant_id: 2, merchant_name: '第二商家', items: [{ sku_id: 22, product_name: '机械键盘', sku_name: '标准版', price: 19900, quantity: 1, subtotal: 19900 }], goods_amount: 19900, freight_amount: 0, discount_amount: 1000, payable_amount: 18900 }
    ]
  },
  payChannel: '',
  paymentOptions: [],
  userCoupons: [
    { id: 8, status: 1, coupon: { merchant_id: 1, name: '满减券', threshold_amount: 10000, discount_amount: 3000 } },
    { id: 9, status: 1, coupon: { merchant_id: 1, name: '高门槛券', threshold_amount: 50000, discount_amount: 5000 } },
    { id: 10, status: 1, coupon: { merchant_id: 2, name: '键盘券', threshold_amount: 10000, discount_amount: 1000 } }
  ],
  selectedCouponIds: { 1: 8, 2: 10 }
})
assert.equal(checkoutPage.blocks.some((block) => block.type === 'payment'), false)
const checkoutCoupons = checkoutPage.blocks.filter((block) => block.type === 'couponSelector')
assert.equal(checkoutCoupons.length, 2)
assert.equal(checkoutCoupons[0].active, 8)
assert.equal(checkoutCoupons[0].items.find((item) => item.value === 9).disabled, true)
assert.equal(checkoutCoupons[1].active, 10)
assert.equal(checkoutCoupons[1].items.some((item) => item.value === 8), false)
assert.equal(checkoutPage.bottom.primary, '提交交易')

const orderDetailPage = adapters.createOrderDetailPage({
  id: 7,
  order_no: 'O7',
  merchant_id: 1,
  merchant_name: '测试商家',
  status: 3,
  status_text: '已发货',
  receiver_address: '上海市浦东新区测试路 1 号',
  payable_amount: 29900,
  created_at: '2026-07-16T10:00:00+08:00',
  shipment: { delivery_type: 'express' },
  items: [{ id: 8, sku_id: 11, product_name: '蓝牙耳机', sku_name: '黑色', quantity: 1, price: 29900, subtotal: 29900 }]
})
const orderActions = orderDetailPage.blocks.find((block) => block.type === 'actions').items
assert.equal(orderActions.some((item) => item.action === 'confirmOrder'), true)
assert.equal(orderActions.some((item) => item.action === 'viewLogistics'), true)

const afterSalePage = adapters.createAfterSaleDetailPage({
  id: 6,
  after_sale_no: 'A6',
  order_no: 'O7',
  product_name: '蓝牙耳机',
  sku_name: '黑色',
  type_text: '仅退款',
  status: 1,
  status_text: '待商家审核',
  reason: '商品问题',
  refund_amount: 29900,
  created_at: '2026-07-16T10:00:00+08:00'
})
assert.equal(afterSalePage.blocks.find((block) => block.type === 'actions').items[0].action, 'cancelAfterSale')

console.log(`API contract OK: ${contracts.length} endpoints, token refresh, errors and page adapters verified`)
