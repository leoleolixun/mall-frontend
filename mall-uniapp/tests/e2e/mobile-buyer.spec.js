import { expect, test } from '@playwright/test'

const success = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, message: 'ok', data }) })
const failure = (status, message) => ({ status, contentType: 'application/json', body: JSON.stringify({ code: status === 401 ? 40100 : 40000, message }) })

test('账号登录、Token 刷新、购物车和交易创建使用最新预览令牌', async ({ page }) => {
  const calls = []
  let refreshCount = 0
  let previewCount = 0
  let favoriteAdded = false
  let createdTradePayload = null
  let createdPaymentPayload = null

  const product = {
    id: 9,
    merchant_id: 1,
    merchant_name: '测试商家',
    merchant_logo: '/uploads/merchant.jpg',
    category_id: 3,
    name: '蓝牙耳机',
    cover: '/uploads/9.jpg',
    description: '主动降噪',
    min_price: 29900,
    skus: [{ id: 11, product_id: 9, name: '黑色', image: '', price: 29900, stock: 8, status: 1 }]
  }
  const cartItem = {
    sku_id: 11,
    merchant_id: 1,
    merchant_name: '测试商家',
    merchant_logo: '/uploads/merchant.jpg',
    product_id: 9,
    product_name: '蓝牙耳机',
    sku_name: '黑色',
    sku_image: '',
    price: 29900,
    quantity: 1,
    subtotal: 29900,
    available: true,
    message: ''
  }
  const address = {
    id: 5,
    receiver_name: '李先生',
    receiver_phone: '13800000000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '测试路 1 号',
    is_default: true
  }
  const order = {
    id: 7,
    trade_id: 12,
    order_no: 'O202607160001',
    user_id: 1,
    merchant_id: 1,
    merchant_name: '测试商家',
    status: 1,
    status_text: '待付款',
    receiver_name: address.receiver_name,
    receiver_phone: address.receiver_phone,
    receiver_address: '上海市上海市浦东新区测试路 1 号',
    goods_amount: 29900,
    freight_amount: 0,
    discount_amount: 1000,
    payable_amount: 28900,
    user_coupon_id: 8,
    remark: '移动端下单',
    items: [{ id: 71, ...cartItem, discount_amount: 1000, payable_amount: 28900 }],
    created_at: '2026-07-16T10:00:00+08:00',
    updated_at: '2026-07-16T10:00:00+08:00'
  }
  const payment = (status) => ({
    id: 31,
    payment_no: 'P202607160001',
    trade_id: 12,
    trade_no: 'T202607160001',
    user_id: 1,
    pay_channel: 'alipay',
    pay_scene: 'wap',
    status,
    status_text: status === 2 ? '已支付' : '待支付',
    amount: 28900,
    allocations: [{ order_id: 7, merchant_id: 1, amount: 28900 }],
    transaction_id: status === 2 ? 'ALIPAY-TEST-1' : '',
    failure_reason: '',
    pay_params: { provider: 'alipay', scene: 'wap' }
  })

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api\/v1/, '')
    const method = request.method()
    const authorization = request.headers().authorization || ''
    calls.push(`${method} ${path}`)

    if (method === 'POST' && path === '/auth/login/password') {
      await route.fulfill(success({
        access_token: 'expired-access',
        refresh_token: 'refresh-token',
        user: { id: 1, nickname: '移动端用户', avatar: '', mobile: '', gender: '', birthday: '', bio: '' }
      }))
      return
    }
    if (method === 'POST' && path === '/auth/refresh') {
      refreshCount += 1
      await route.fulfill(success({
        access_token: 'renewed-access',
        refresh_token: 'renewed-refresh',
        user: { id: 1, nickname: '移动端用户', avatar: '', mobile: '', gender: '', birthday: '', bio: '' }
      }))
      return
    }

    const protectedPath = path === '/me'
      || path.startsWith('/orders')
      || path.startsWith('/trades')
      || path.startsWith('/after-sales')
      || path.startsWith('/favorites')
      || path.startsWith('/cart')
      || path.startsWith('/addresses')
      || path.startsWith('/me/coupons')
      || path.startsWith('/payments')
    if (protectedPath && authorization === 'Bearer expired-access') {
      await route.fulfill(failure(401, '登录已过期'))
      return
    }

    if (method === 'GET' && path === '/categories') return route.fulfill(success([{ id: 3, name: '数码' }]))
    if (method === 'GET' && path === '/products') return route.fulfill(success({ list: [{ ...product, skus: undefined }], page: 1, page_size: 20, total: 1 }))
    if (method === 'GET' && path === '/products/9') return route.fulfill(success(product))
    if (method === 'GET' && path === '/me') return route.fulfill(success({ id: 1, nickname: '移动端用户', avatar: '', mobile: '', gender: '', birthday: '', bio: '' }))
    if (method === 'GET' && path === '/orders') return route.fulfill(success({ list: [], page: 1, page_size: 50, total: 0 }))
    if (method === 'GET' && path === '/after-sales') return route.fulfill(success({ list: [], page: 1, page_size: 50, total: 0 }))
    if (method === 'GET' && path === '/favorites/products') {
      return route.fulfill(success({ list: favoriteAdded ? [{ ...product, skus: undefined }] : [], page: 1, page_size: 50, total: favoriteAdded ? 1 : 0 }))
    }
    if (method === 'POST' && path === '/favorites/products') {
      favoriteAdded = true
      return route.fulfill(success(null))
    }
    if (method === 'POST' && path === '/cart/items') return route.fulfill(success(null))
    if (method === 'GET' && path === '/cart/items') return route.fulfill(success([cartItem]))
    if (method === 'GET' && path === '/addresses') return route.fulfill(success([address]))
    if (method === 'GET' && path === '/me/coupons') {
      return route.fulfill(success([{ id: 8, status: 1, status_text: '未使用', coupon: { id: 3, merchant_id: 1, name: '新人券', threshold_amount: 0, discount_amount: 1000 } }]))
    }
    if (method === 'POST' && path === '/trades/preview') {
      previewCount += 1
      const body = request.postDataJSON()
      const selected = body.merchant_coupons.some((item) => item.merchant_id === 1 && item.user_coupon_id === 8)
      return route.fulfill(success({
        idempotency_token: `preview-token-${previewCount}`,
        address,
        merchant_groups: [{
          merchant_id: 1,
          merchant_name: '测试商家',
          merchant_logo: '/uploads/merchant.jpg',
          items: [order.items[0]],
          goods_amount: 29900,
          freight_amount: 0,
          discount_amount: selected ? 1000 : 0,
          payable_amount: selected ? 28900 : 29900,
          user_coupon_id: selected ? 8 : 0
        }],
        goods_amount: 29900,
        freight_amount: 0,
        discount_amount: selected ? 1000 : 0,
        payable_amount: selected ? 28900 : 29900
      }))
    }
    if (method === 'POST' && path === '/trades') {
      createdTradePayload = request.postDataJSON()
      return route.fulfill(success({
        id: 12,
        trade_no: 'T202607160001',
        status: 1,
        status_text: '待支付',
        goods_amount: 29900,
        freight_amount: 0,
        discount_amount: 1000,
        payable_amount: 28900,
        orders: [order]
      }))
    }
    if (method === 'GET' && path === '/trades/12') {
      return route.fulfill(success({
        id: 12,
        trade_no: 'T202607160001',
        status: 2,
        status_text: '已支付',
        goods_amount: 29900,
        freight_amount: 0,
        discount_amount: 1000,
        payable_amount: 28900,
        orders: [{ ...order, status: 2, status_text: '待发货' }]
      }))
    }
    if (method === 'POST' && path === '/payments') {
      createdPaymentPayload = request.postDataJSON()
      return route.fulfill(success(payment(1)))
    }
    if (method === 'GET' && path === '/payments/P202607160001') return route.fulfill(success(payment(1)))
    if (method === 'POST' && path === '/payments/P202607160001/sync') return route.fulfill(success(payment(2)))
    if (method === 'GET' && path === '/orders/7') return route.fulfill(success(order))

    await route.fulfill(failure(404, `未模拟接口 ${method} ${path}`))
  })

  await page.goto('#/pages/user/login')
  const loginInputs = page.getByRole('textbox')
  await loginInputs.nth(0).fill('mobile-user')
  await loginInputs.nth(1).fill('MallTest_123456')
  await page.getByText('登录', { exact: true }).click()
  await expect(page.getByText('移动端用户', { exact: true })).toBeVisible()
  expect(refreshCount).toBe(1)

  await page.goto('#/pages/product/detail?id=9')
  await expect(page.getByText('蓝牙耳机', { exact: true })).toBeVisible()
  await page.getByText('收藏商品', { exact: true }).click()
  await expect(page.getByText('取消收藏', { exact: true })).toBeVisible()
  await page.getByText('加入购物车', { exact: true }).click()

  await page.goto('#/pages/cart/index')
  await page.getByText('去结算', { exact: true }).click()
  await page.getByText('新人券 -¥10', { exact: true }).click()
  await page.getByText('提交交易并支付', { exact: true }).click()

  await expect(page).toHaveURL(/#\/pages\/payment\/result\?payment_no=P202607160001/)
  await expect(page.getByText('支付成功', { exact: true })).toBeVisible()
  await expect(page.getByText('交易号：T202607160001', { exact: true })).toBeVisible()
  expect(previewCount).toBeGreaterThanOrEqual(3)
  expect(createdTradePayload.idempotency_token).toBe(`preview-token-${previewCount}`)
  expect(createdTradePayload.merchant_coupons).toEqual([{ merchant_id: 1, user_coupon_id: 8 }])
  expect(createdPaymentPayload).toEqual({ trade_id: 12, pay_channel: 'alipay', pay_scene: 'wap' })
  expect(calls.filter((item) => item === 'POST /payments')).toHaveLength(1)
  expect(calls.some((item) => item.includes('mock-complete'))).toBe(false)
})

test('地址维护、配送信息、确认收货和售后状态形成闭环', async ({ page }) => {
  let addresses = []
  let addressUpdatePayload = null
  let orderStatus = 3
  let afterSaleStatus = 1
  let afterSalePayload = null

  const user = { id: 1, nickname: '移动端用户', avatar: '', mobile: '13800000000', gender: '', birthday: '', bio: '' }
  const orderItem = {
    id: 71,
    product_id: 9,
    sku_id: 11,
    product_name: '蓝牙耳机',
    sku_name: '黑色',
    sku_image: '',
    price: 29900,
    quantity: 1,
    subtotal: 29900,
    discount_amount: 1000,
    payable_amount: 28900
  }
  const currentOrder = () => ({
    id: 7,
    order_no: 'O202607160002',
    user_id: 1,
    merchant_id: 1,
    merchant_name: '测试商家',
    status: orderStatus,
    status_text: orderStatus === 3 ? '已发货' : '已完成',
    receiver_name: '李先生',
    receiver_phone: '13800000000',
    receiver_address: '上海市浦东新区测试路 1 号',
    goods_amount: 29900,
    freight_amount: 0,
    discount_amount: 1000,
    payable_amount: 28900,
    user_coupon_id: 8,
    remark: '',
    items: [orderItem],
    shipment: {
      id: 1,
      order_id: 7,
      delivery_type: 'self_delivery',
      logistics_company: '',
      tracking_no: '',
      shipped_at: '2026-07-16T10:30:00+08:00'
    },
    created_at: '2026-07-16T10:00:00+08:00',
    updated_at: '2026-07-16T10:30:00+08:00'
  })
  const currentAfterSale = () => ({
    id: 6,
    after_sale_no: 'A202607160001',
    order_id: 7,
    order_no: 'O202607160002',
    order_item_id: 71,
    product_name: '蓝牙耳机',
    sku_name: '黑色',
    sku_image: '',
    user_id: 1,
    merchant_id: 1,
    type: 'refund_only',
    type_text: '仅退款',
    status: afterSaleStatus,
    status_text: afterSaleStatus === 1 ? '待商家审核' : '用户已取消',
    reason: '商品质量问题',
    description: '耳机存在杂音',
    images: [],
    refund_amount: 28900,
    reject_reason: '',
    created_at: '2026-07-16T11:00:00+08:00',
    updated_at: '2026-07-16T11:00:00+08:00'
  })

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api\/v1/, '')
    const method = request.method()

    if (method === 'POST' && path === '/auth/login/password') {
      return route.fulfill(success({ access_token: 'valid-access', refresh_token: 'valid-refresh', user }))
    }
    if (method === 'GET' && path === '/me') return route.fulfill(success(user))
    if (method === 'GET' && path === '/orders') return route.fulfill(success({ list: [currentOrder()], page: 1, page_size: 50, total: 1 }))
    if (method === 'GET' && path === '/after-sales') return route.fulfill(success({ list: [], page: 1, page_size: 50, total: 0 }))
    if (method === 'GET' && path === '/addresses') return route.fulfill(success(addresses))
    if (method === 'POST' && path === '/addresses') {
      const payload = request.postDataJSON()
      const address = { id: 5, ...payload }
      addresses = [address]
      return route.fulfill(success(address))
    }
    if (method === 'PUT' && path === '/addresses/5/default') {
      addresses = addresses.map((item) => ({ ...item, is_default: true }))
      return route.fulfill(success(null))
    }
    if (method === 'PUT' && path === '/addresses/5') {
      addressUpdatePayload = request.postDataJSON()
      addresses = addresses.map((item) => ({ ...item, ...addressUpdatePayload }))
      return route.fulfill(success(addresses[0]))
    }
    if (method === 'DELETE' && path === '/addresses/5') {
      addresses = []
      return route.fulfill(success(null))
    }
    if (method === 'GET' && path === '/orders/7') return route.fulfill(success(currentOrder()))
    if (method === 'GET' && path === '/orders/7/logistics') {
      return route.fulfill(success({
        order_id: 7,
        delivery_type: 'self_delivery',
        logistics_company: '',
        tracking_no: '',
        shipped_at: '2026-07-16T10:30:00+08:00',
        traces: []
      }))
    }
    if (method === 'POST' && path === '/orders/7/confirm') {
      orderStatus = 4
      return route.fulfill(success(currentOrder()))
    }
    if (method === 'POST' && path === '/after-sales') {
      afterSalePayload = request.postDataJSON()
      return route.fulfill(success(currentAfterSale()))
    }
    if (method === 'GET' && path === '/after-sales/6') return route.fulfill(success(currentAfterSale()))
    if (method === 'POST' && path === '/after-sales/6/cancel') {
      afterSaleStatus = 5
      return route.fulfill(success(currentAfterSale()))
    }

    await route.fulfill(failure(404, `未模拟接口 ${method} ${path}`))
  })

  await page.goto('#/pages/user/login')
  const loginInputs = page.getByRole('textbox')
  await loginInputs.nth(0).fill('mobile-user')
  await loginInputs.nth(1).fill('MallTest_123456')
  await page.getByText('登录', { exact: true }).click()
  await expect(page.getByText('移动端用户', { exact: true })).toBeVisible()

  await page.goto('#/pages/user/address')
  const addressTextboxes = page.getByRole('textbox')
  await addressTextboxes.nth(0).fill('李先生')
  await page.getByRole('spinbutton').fill('13800000000')
  await addressTextboxes.nth(1).fill('上海市')
  await addressTextboxes.nth(2).fill('上海市')
  await addressTextboxes.nth(3).fill('浦东新区')
  await addressTextboxes.nth(4).fill('测试路 1 号')
  await page.getByText('保存地址', { exact: true }).click()
  await expect(page.getByText('李先生 13800000000', { exact: true })).toBeVisible()

  await page.getByText('设为默认', { exact: true }).first().click()
  await expect(page.getByText('默认', { exact: true })).toBeVisible()
  await page.getByText('编辑', { exact: true }).click()
  await page.getByRole('textbox').nth(4).fill('测试路 2 号')
  await page.getByText('保存地址', { exact: true }).click()
  expect(addressUpdatePayload.detail).toBe('测试路 2 号')

  await page.goto('#/pages/order/detail?id=7')
  await expect(page.getByText('已发货', { exact: true }).first()).toBeVisible()
  await page.getByText('查看物流', { exact: true }).click()
  await expect(page.getByText('商家正在配送', { exact: true })).toBeVisible()

  await page.goto('#/pages/order/detail?id=7')
  await page.getByText('确认收货', { exact: true }).click()
  await page.getByText('确定', { exact: true }).click()
  await expect(page.getByText('已完成', { exact: true }).first()).toBeVisible()

  await page.getByText('申请售后', { exact: true }).click()
  await page.getByRole('textbox').fill('耳机存在杂音')
  await page.getByText('提交申请', { exact: true }).click()
  await expect(page.getByText('待商家审核', { exact: true })).toBeVisible()
  expect(afterSalePayload).toEqual({
    order_id: 7,
    order_item_id: 71,
    type: 'refund_only',
    reason: '商品质量问题',
    description: '耳机存在杂音',
    images: []
  })

  await page.getByText('取消申请', { exact: true }).click()
  await page.getByText('确定', { exact: true }).click()
  await expect(page.getByText('用户已取消', { exact: true })).toBeVisible()

  await page.goto('#/pages/user/address')
  await page.getByText('删除', { exact: true }).click()
  await page.getByText('确定', { exact: true }).click()
  await expect(page.getByText('还没有收货地址', { exact: true })).toBeVisible()
})

test('跨商户购物车按店铺分组并原子创建交易', async ({ page }) => {
  let oldPreviewCalls = 0
  let tradePreviewCalls = 0
  let createdTradePayload = null
  let createdPaymentPayload = null
  let created = false
  const cartItems = [
    {
      sku_id: 11,
      merchant_id: 1,
      merchant_name: '测试商家',
      merchant_logo: '',
      product_id: 9,
      product_name: '蓝牙耳机',
      sku_name: '黑色',
      sku_image: '',
      price: 29900,
      quantity: 1,
      subtotal: 29900,
      stock: 8,
      available: true
    },
    {
      sku_id: 22,
      merchant_id: 2,
      merchant_name: '第二商家',
      merchant_logo: '',
      product_id: 20,
      product_name: '机械键盘',
      sku_name: '标准版',
      sku_image: '',
      price: 19900,
      quantity: 1,
      subtotal: 19900,
      stock: 6,
      available: true
    }
  ]
  const address = {
    id: 5,
    receiver_name: '李先生',
    receiver_phone: '13800000000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '测试路 1 号',
    is_default: true
  }
  const orders = cartItems.map((item, index) => ({
    id: 70 + index,
    trade_id: 12,
    order_no: `O20260716000${index + 1}`,
    merchant_id: item.merchant_id,
    merchant_name: item.merchant_name,
    status: 1,
    status_text: '待付款',
    receiver_address: '上海市上海市浦东新区测试路 1 号',
    goods_amount: item.subtotal,
    freight_amount: 0,
    discount_amount: 1000,
    payable_amount: item.subtotal - 1000,
    user_coupon_id: 8 + index,
    items: [{ id: 700 + index, ...item, discount_amount: 1000, payable_amount: item.subtotal - 1000 }],
    created_at: '2026-07-16T10:00:00+08:00'
  }))
  const payment = (status) => ({
    id: 32,
    payment_no: 'P202607160002',
    trade_id: 12,
    trade_no: 'T202607160002',
    user_id: 1,
    pay_channel: 'alipay',
    pay_scene: 'wap',
    status,
    status_text: status === 2 ? '已支付' : '待支付',
    amount: 47800,
    allocations: [
      { order_id: 70, merchant_id: 1, amount: 28900 },
      { order_id: 71, merchant_id: 2, amount: 18900 }
    ],
    transaction_id: status === 2 ? 'ALIPAY-TEST-2' : '',
    failure_reason: '',
    pay_params: { provider: 'alipay', scene: 'wap' }
  })

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, '')
    const method = request.method()
    if (method === 'POST' && path === '/auth/login/password') {
      return route.fulfill(success({ access_token: 'valid-access', refresh_token: 'valid-refresh', user: { id: 1, nickname: '跨商户用户' } }))
    }
    if (method === 'GET' && path === '/me') return route.fulfill(success({ id: 1, nickname: '跨商户用户' }))
    if (method === 'GET' && path === '/merchants') return route.fulfill(success({ list: [], page: 1, page_size: 20, total: 0 }))
    if (method === 'GET' && path === '/categories') return route.fulfill(success([]))
    if (method === 'GET' && path === '/products') return route.fulfill(success({ list: [], page: 1, page_size: 50, total: 0 }))
    if (method === 'GET' && path === '/orders') return route.fulfill(success({ list: created ? orders : [], page: 1, page_size: 50, total: created ? orders.length : 0 }))
    if (method === 'GET' && path === '/after-sales') return route.fulfill(success({ list: [], page: 1, page_size: 50, total: 0 }))
    if (method === 'GET' && path === '/cart/items') return route.fulfill(success(cartItems))
    if (method === 'GET' && path === '/addresses') return route.fulfill(success([address]))
    if (method === 'GET' && path === '/me/coupons') {
      return route.fulfill(success([
        { id: 8, status: 1, coupon: { merchant_id: 1, name: '耳机券', threshold_amount: 0, discount_amount: 1000 } },
        { id: 9, status: 1, coupon: { merchant_id: 2, name: '键盘券', threshold_amount: 0, discount_amount: 1000 } }
      ]))
    }
    if (method === 'POST' && path === '/orders/preview') {
      oldPreviewCalls += 1
      return route.fulfill(failure(400, '不应调用旧订单预览'))
    }
    if (method === 'POST' && path === '/trades/preview') {
      tradePreviewCalls += 1
      const body = request.postDataJSON()
      const couponByMerchant = new Map(body.merchant_coupons.map((item) => [item.merchant_id, item.user_coupon_id]))
      const groups = cartItems.map((item) => {
        const discount = couponByMerchant.has(item.merchant_id) ? 1000 : 0
        return {
          merchant_id: item.merchant_id,
          merchant_name: item.merchant_name,
          merchant_logo: '',
          items: [{ ...item, discount_amount: discount, payable_amount: item.subtotal - discount }],
          goods_amount: item.subtotal,
          freight_amount: 0,
          discount_amount: discount,
          payable_amount: item.subtotal - discount,
          user_coupon_id: couponByMerchant.get(item.merchant_id) || 0
        }
      })
      return route.fulfill(success({
        idempotency_token: `trade-preview-${tradePreviewCalls}`,
        address,
        merchant_groups: groups,
        goods_amount: 49800,
        freight_amount: 0,
        discount_amount: groups.reduce((sum, group) => sum + group.discount_amount, 0),
        payable_amount: groups.reduce((sum, group) => sum + group.payable_amount, 0)
      }))
    }
    if (method === 'POST' && path === '/trades') {
      createdTradePayload = request.postDataJSON()
      created = true
      return route.fulfill(success({ id: 12, trade_no: 'T202607160002', status: 1, status_text: '待支付', goods_amount: 49800, freight_amount: 0, discount_amount: 2000, payable_amount: 47800, orders }))
    }
    if (method === 'GET' && path === '/trades/12') {
      return route.fulfill(success({
        id: 12,
        trade_no: 'T202607160002',
        status: 2,
        status_text: '已支付',
        goods_amount: 49800,
        freight_amount: 0,
        discount_amount: 2000,
        payable_amount: 47800,
        orders: orders.map((item) => ({ ...item, status: 2, status_text: '待发货' }))
      }))
    }
    if (method === 'POST' && path === '/payments') {
      createdPaymentPayload = request.postDataJSON()
      return route.fulfill(success(payment(1)))
    }
    if (method === 'GET' && path === '/payments/P202607160002') return route.fulfill(success(payment(1)))
    if (method === 'POST' && path === '/payments/P202607160002/sync') return route.fulfill(success(payment(2)))
    return route.fulfill(failure(404, `未模拟接口 ${method} ${path}`))
  })

  await page.goto('#/pages/user/login')
  const loginInputs = page.getByRole('textbox')
  await loginInputs.nth(0).fill('multi-merchant-user')
  await loginInputs.nth(1).fill('MallTest_123456')
  await page.getByText('登录', { exact: true }).click()
  await expect(page.getByText('跨商户用户', { exact: true })).toBeVisible()

  await page.goto('#/pages/cart/index')
  await expect(page.getByText('测试商家', { exact: true })).toBeVisible()
  await expect(page.getByText('第二商家', { exact: true })).toBeVisible()
  await page.getByText('去结算', { exact: true }).click()
  await expect(page.getByText('店铺优惠券', { exact: true })).toHaveCount(2)
  await page.getByText('耳机券 -¥10', { exact: true }).click()
  await page.getByText('键盘券 -¥10', { exact: true }).click()
  await page.getByText('提交交易并支付', { exact: true }).click()

  await expect(page).toHaveURL(/#\/pages\/payment\/result\?payment_no=P202607160002/)
  await expect(page.getByText('支付成功', { exact: true })).toBeVisible()
  await expect(page.getByText('交易号：T202607160002', { exact: true })).toBeVisible()
  expect(oldPreviewCalls).toBe(0)
  expect(tradePreviewCalls).toBeGreaterThanOrEqual(4)
  expect(createdTradePayload.idempotency_token).toBe(`trade-preview-${tradePreviewCalls}`)
  expect(createdTradePayload.merchant_coupons).toEqual([
    { merchant_id: 1, user_coupon_id: 8 },
    { merchant_id: 2, user_coupon_id: 9 }
  ])
  expect(createdPaymentPayload).toEqual({ trade_id: 12, pay_channel: 'alipay', pay_scene: 'wap' })
})

test('公开首页接口失败后可以点击重试恢复', async ({ page }) => {
  let categoryAttempts = 0

  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace(/^\/api\/v1/, '')
    if (path === '/merchants') {
      return route.fulfill(success({
        list: [{ id: 1, name: '测试商家', logo: '/uploads/merchant.jpg', status: 1 }],
        page: 1,
        page_size: 20,
        total: 1
      }))
    }
    if (path === '/merchants/1') {
      return route.fulfill(success({ id: 1, name: '测试商家', logo: '/uploads/merchant.jpg', status: 1 }))
    }
    if (path === '/merchants/1/categories') {
      return route.fulfill(success([{ id: 3, merchant_id: 1, parent_id: 0, name: '数码', sort: 10 }]))
    }
    if (path === '/merchants/1/products') {
      return route.fulfill(success({
        list: [{ id: 9, merchant_id: 1, merchant_name: '测试商家', merchant_logo: '/uploads/merchant.jpg', category_id: 3, name: '蓝牙耳机', cover: '', min_price: 29900 }],
        page: 1,
        page_size: 50,
        total: 1
      }))
    }
    if (path === '/categories') {
      categoryAttempts += 1
      if (categoryAttempts === 1) return route.fulfill(failure(500, '分类服务暂时不可用'))
      return route.fulfill(success([{ id: 3, name: '数码' }]))
    }
    if (path === '/products') {
      return route.fulfill(success({
        list: [{ id: 9, merchant_id: 1, merchant_name: '测试商家', merchant_logo: '/uploads/merchant.jpg', category_id: 3, name: '蓝牙耳机', cover: '', min_price: 29900 }],
        page: 1,
        page_size: 20,
        total: 1
      }))
    }
    await route.fulfill(failure(404, '未模拟接口'))
  })

  await page.goto('#/pages/index/index')
  await expect(page.getByText('分类服务暂时不可用', { exact: true })).toBeVisible()
  await page.getByText('点击重试', { exact: true }).click()
  await expect(page.getByText('蓝牙耳机', { exact: true })).toBeVisible()
  await expect(page.locator('.merchant-tile').filter({ hasText: '测试商家' })).toBeVisible()
  await page.getByText('数码', { exact: true }).click()
  await expect(page).toHaveURL(/category_id=3/)
  await page.goto('#/pages/index/index')
  await page.locator('.merchant-tile').filter({ hasText: '测试商家' }).click()
  await expect(page).toHaveURL(/merchant_id=1/)
  await expect(page.getByText('当前店铺在售商品', { exact: true })).toBeVisible()
})
