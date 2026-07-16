import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/common/orderFlow.js', import.meta.url), 'utf8')
const orderFlow = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

let createPayload = null
const order = await orderFlow.createOrderFromLatestPreview({
  addressId: 5,
  userCouponId: 8,
  items: [{ sku_id: 11, quantity: 2 }],
  remark: '移动端下单',
  preview: async (payload) => {
    assert.deepEqual(payload, {
      address_id: 5,
      user_coupon_id: 8,
      items: [{ sku_id: 11, quantity: 2 }]
    })
    return { idempotency_token: 'latest-preview-token' }
  },
  create: async (payload) => {
    createPayload = payload
    return { id: 7 }
  }
})

assert.equal(order.id, 7)
assert.equal(createPayload.idempotency_token, 'latest-preview-token')
assert.equal(createPayload.user_coupon_id, 8)

await assert.rejects(
  orderFlow.createOrderFromLatestPreview({
    addressId: 5,
    items: [{ sku_id: 11, quantity: 1 }],
    remark: '',
    preview: async () => ({}),
    create: async () => ({ id: 8 })
  }),
  /幂等令牌/
)

let createTradePayload = null
const trade = await orderFlow.createTradeFromLatestPreview({
  addressId: 5,
  merchantCoupons: [
    { merchant_id: 2, user_coupon_id: 10 },
    { merchant_id: 1, user_coupon_id: 8 }
  ],
  items: [{ sku_id: 11, quantity: 1 }, { sku_id: 22, quantity: 2 }],
  remark: '跨商户下单',
  preview: async (payload) => {
    assert.deepEqual(payload.merchant_coupons, [
      { merchant_id: 1, user_coupon_id: 8 },
      { merchant_id: 2, user_coupon_id: 10 }
    ])
    return { idempotency_token: 'latest-trade-preview-token' }
  },
  create: async (payload) => {
    createTradePayload = payload
    return { id: 12, orders: [{ id: 7 }, { id: 8 }] }
  }
})

assert.equal(trade.id, 12)
assert.equal(createTradePayload.idempotency_token, 'latest-trade-preview-token')
assert.equal(createTradePayload.merchant_coupons.length, 2)

await assert.rejects(
  orderFlow.createTradeFromLatestPreview({
    addressId: 5,
    items: [{ sku_id: 11, quantity: 1 }],
    preview: async () => ({}),
    create: async () => ({ id: 13 })
  }),
  /交易预览未返回幂等令牌/
)

console.log('Order flow contract OK: latest preview tokens are required for order and trade creation')
