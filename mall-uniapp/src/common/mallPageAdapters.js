import { formatMoney, normalizeAssetUrl } from '@/api/client.js'
import { mobilePages } from './mobilePages.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

const pageCopy = (key) => clone(mobilePages[key] || mobilePages.home)

const productCard = (item) => ({
  id: item.id,
  name: item.name,
  price: formatMoney(item.min_price),
  tag: String(item.name || '商品').slice(0, 2),
  merchantId: Number(item.merchant_id) || 0,
  merchantName: item.merchant_name || (item.merchant_id ? `商户 ${item.merchant_id}` : ''),
  image: normalizeAssetUrl(item.cover),
  target: `/pages/product/detail?id=${item.id}`
})

const goodsItem = (item) => ({
  id: item.sku_id || item.id,
  name: item.product_name || `SKU ${item.sku_id}`,
  desc: `${item.sku_name || '默认规格'} · ${item.quantity} 件`,
  price: formatMoney(item.subtotal === undefined ? item.price * item.quantity : item.subtotal),
  image: normalizeAssetUrl(item.sku_image),
  action: item.action,
  target: item.target
})

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const emptyState = (title, desc, target = 'home') => ({
  type: 'empty',
  title,
  desc,
  primary: '返回首页',
  secondary: '重新加载',
  primaryTarget: target,
  secondaryAction: 'refresh'
})

export const createHomePage = (categories, products, merchants = []) => {
  const page = pageCopy('home')
  const categoryBlock = page.blocks.find((block) => block.type === 'iconGrid')
  const productBlock = page.blocks.find((block) => block.type === 'products')

  if (categoryBlock) {
    categoryBlock.items = categories.slice(0, 8).map((item) => ({
      label: item.name,
      value: item.id,
      target: `/pages/search/list?category_id=${item.id}`
    }))
  }
  if (merchants.length) {
    const recommendedIndex = page.blocks.findIndex((block) => block.type === 'title')
    page.blocks.splice(recommendedIndex < 0 ? page.blocks.length : recommendedIndex, 0, {
      type: 'merchantList',
      title: '精选店铺',
      items: merchants.map((merchant) => ({
        id: merchant.id,
        name: merchant.name,
        logo: normalizeAssetUrl(merchant.logo),
        target: `/pages/search/list?merchant_id=${merchant.id}`
      }))
    })
  }
  if (productBlock) productBlock.items = products.map(productCard)
  if (!products.length) page.blocks.push(emptyState('暂无上架商品', '商品上架后会显示在这里。'))
  return page
}

export const createCatalogPage = ({ categories, products, categoryId = null, keyword = '', total = 0, pageKey = 'list', merchant = null }) => {
  const page = pageCopy(pageKey)
  const selected = categoryId === null ? 'all' : Number(categoryId)
  const categoryItems = [{ label: '全部', value: 'all' }].concat(
    categories.map((item) => ({ label: item.name, value: item.id }))
  )

  page.blocks = [
    { type: 'searchInput', placeholder: '搜索商品', value: keyword },
    ...(merchant ? [{
      type: 'merchantBanner',
      name: merchant.name,
      logo: normalizeAssetUrl(merchant.logo),
      desc: '当前店铺在售商品'
    }] : []),
    { type: 'chips', items: categoryItems, active: selected, action: 'category' },
    { type: 'title', text: keyword ? `“${keyword}” 共 ${total} 件` : `${merchant ? merchant.name : '全部商品'} · ${total} 件` },
    products.length
      ? { type: 'products', items: products.map(productCard) }
      : emptyState('没有找到相关商品', '换个分类或关键词再试试。', 'home')
  ]
  return page
}

export const createDetailPage = (detail, selectedSkuId, favorite = false) => {
  const page = pageCopy('detail')
  const selectedSku = detail.skus.find((item) => item.id === Number(selectedSkuId)) || detail.skus[0]
  const skuItems = detail.skus.map((item) => ({
    label: `${item.name}${item.stock > 0 ? '' : '（缺货）'}`,
    value: item.id,
    disabled: item.stock <= 0
  }))

  page.blocks = [
    {
      type: 'detailHero',
      title: detail.name,
      price: selectedSku ? formatMoney(selectedSku.price) : '暂无价格',
      desc: detail.description || '商品详情以实际收到的商品为准。',
      image: normalizeAssetUrl((selectedSku && selectedSku.image) || detail.cover)
    },
    {
      type: 'merchantBanner',
      name: detail.merchant_name || `商户 ${detail.merchant_id}`,
      logo: normalizeAssetUrl(detail.merchant_logo),
      desc: '查看该店铺全部商品',
      target: `/pages/search/list?merchant_id=${detail.merchant_id}`
    },
    {
      type: 'sku',
      title: '规格',
      items: skuItems,
      active: selectedSku ? selectedSku.id : null,
      action: 'sku'
    },
    {
      type: 'info',
      title: '库存与保障',
      desc: selectedSku ? `当前库存 ${selectedSku.stock} 件` : '商品暂无可售规格'
    },
    {
      type: 'actions',
      items: [{
        text: favorite ? '取消收藏' : '收藏商品',
        action: favorite ? 'removeFavorite' : 'addFavorite',
        productId: detail.id
      }]
    }
  ]
  page.bottom = {
    left: selectedSku ? `库存 ${selectedSku.stock}` : '暂不可售',
    secondary: '加入购物车',
    secondaryAction: 'addCart',
    primary: '立即购买',
    primaryAction: 'buyNow',
    primaryDisabled: !selectedSku || selectedSku.stock <= 0,
    disabledReason: '当前规格暂无库存'
  }
  return page
}

export const getCartCheckoutAvailability = (items) => {
  const availableItems = items.filter((item) => item.available !== false && Number(item.quantity) > 0)
  if (!availableItems.length) {
    return { allowed: false, merchantIds: [], reason: '购物车没有可结算商品' }
  }
  const merchantIds = Array.from(new Set(availableItems.map((item) => Number(item.merchant_id) || 0)))
  if (merchantIds.some((merchantId) => merchantId <= 0)) {
    return { allowed: false, merchantIds, reason: '购物车商品缺少有效商户信息，请重新加入购物车' }
  }
  return { allowed: true, merchantIds: merchantIds.sort((a, b) => a - b), reason: '' }
}

export const createCartPage = (items) => {
  const page = pageCopy('cart')
  const total = items.reduce((sum, item) => sum + (item.available === false ? 0 : Number(item.subtotal) || 0), 0)
  const checkout = getCartCheckoutAvailability(items)
  const groups = new Map()
  items.forEach((item) => {
    const merchantId = Number(item.merchant_id) || 0
    if (!groups.has(merchantId)) {
      groups.set(merchantId, {
        merchantId,
        merchantName: item.merchant_name || (merchantId ? `商户 ${merchantId}` : '失效商品'),
        merchantLogo: normalizeAssetUrl(item.merchant_logo),
        target: merchantId ? `/pages/search/list?merchant_id=${merchantId}` : '',
        items: []
      })
    }
    groups.get(merchantId).items.push({
      id: item.sku_id,
      productId: item.product_id,
      name: item.product_name || `SKU ${item.sku_id}`,
      desc: item.message || item.sku_name || '默认规格',
      price: formatMoney(item.price),
      count: item.quantity,
      available: item.available,
      image: normalizeAssetUrl(item.sku_image)
    })
  })

  page.blocks = items.length
    ? Array.from(groups.values()).sort((a, b) => a.merchantId - b.merchantId).map((group) => ({
        type: 'cart',
        ...group
      }))
    : [emptyState('购物车还是空的', '挑选商品后再来结算。')]
  page.bottom = items.length
    ? {
        total: `合计 ${formatMoney(total)}`,
        left: checkout.allowed ? '' : checkout.reason,
        primary: checkout.allowed ? '去结算' : '暂不可结算',
        primaryAction: 'checkout',
        primaryDisabled: !checkout.allowed,
        disabledReason: checkout.reason
      }
    : null
  return page
}

const fullAddress = (address) => address
  ? [address.province, address.city, address.district, address.detail].filter(Boolean).join('')
  : ''

export const isUserCouponUsable = (item, goodsAmount, now = Date.now(), merchantId = 0) => {
  if (!item || item.status !== 1 || !item.coupon) return false
  const coupon = item.coupon
  if (merchantId > 0 && Number(coupon.merchant_id) !== Number(merchantId)) return false
  if ((Number(coupon.threshold_amount) || 0) > goodsAmount) return false
  const startAt = coupon.start_at ? Date.parse(coupon.start_at) : 0
  const endAt = coupon.end_at ? Date.parse(coupon.end_at) : 0
  if (Number.isFinite(startAt) && startAt > 0 && now < startAt) return false
  if (Number.isFinite(endAt) && endAt > 0 && now >= endAt) return false
  return true
}

export const createCheckoutPage = ({
  items,
  address,
  preview,
  payChannel,
  paymentOptions = [],
  userCoupons = [],
  selectedCouponIds = {}
}) => {
  const page = pageCopy('checkout')
  if (!items.length) {
    page.blocks = [emptyState('没有可结算商品', '请先将商品加入购物车。')]
    page.bottom = null
    return page
  }
  const cartGroups = new Map()
  items.forEach((item) => {
    const merchantId = Number(item.merchant_id) || 0
    if (!cartGroups.has(merchantId)) {
      cartGroups.set(merchantId, {
        merchant_id: merchantId,
        merchant_name: item.merchant_name || `商户 ${merchantId}`,
        merchant_logo: item.merchant_logo || '',
        items: [],
        goods_amount: 0,
        freight_amount: 0,
        discount_amount: 0,
        payable_amount: 0
      })
    }
    const group = cartGroups.get(merchantId)
    group.items.push(item)
    group.goods_amount += Number(item.subtotal) || 0
    group.payable_amount = group.goods_amount
  })
  const previewGroups = Array.isArray(preview && preview.merchant_groups) ? preview.merchant_groups : []
  const groups = (previewGroups.length ? previewGroups : Array.from(cartGroups.values()))
    .slice()
    .sort((left, right) => Number(left.merchant_id) - Number(right.merchant_id))
  const goodsAmount = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
  const payable = preview ? preview.payable_amount : goodsAmount

  page.blocks = [
    {
      type: 'addressCard',
      title: address ? `${address.receiver_name} ${address.receiver_phone}` : '请选择收货地址',
      desc: address ? fullAddress(address) : '下单前需要先添加一个收货地址',
      tag: address && address.is_default ? '默认' : '选择',
      target: 'address'
    }
  ]
  groups.forEach((group) => {
    const merchantId = Number(group.merchant_id) || 0
    const merchantCoupons = userCoupons.filter((item) => Number(item.coupon && item.coupon.merchant_id) === merchantId)
    const selectedCouponId = Number(selectedCouponIds[String(merchantId)]) || 0
    page.blocks.push(
      {
        type: 'merchantBanner',
        name: group.merchant_name || `商户 ${merchantId}`,
        logo: normalizeAssetUrl(group.merchant_logo),
        desc: '本店商品与优惠独立结算',
        target: `/pages/search/list?merchant_id=${merchantId}`
      },
      { type: 'goodsList', title: '商品清单', items: (group.items || []).map(goodsItem) },
      {
        type: 'couponSelector',
        title: '店铺优惠券',
        merchantId,
        items: [{ label: '不使用优惠券', value: 0 }].concat(merchantCoupons.map((item) => {
          const usable = isUserCouponUsable(item, Number(group.goods_amount) || 0, Date.now(), merchantId)
          return {
            label: `${item.coupon.name} -${formatMoney(item.coupon.discount_amount)}${usable ? '' : '（不可用）'}`,
            value: item.id,
            disabled: !usable
          }
        })),
        active: selectedCouponId,
        action: 'checkoutCoupon'
      },
      {
        type: 'kv',
        title: '店铺金额',
        items: [
          ['商品金额', formatMoney(group.goods_amount || 0)],
          ['运费', formatMoney(group.freight_amount || 0)],
          ['优惠', `-${formatMoney(group.discount_amount || 0)}`],
          ['店铺应付', formatMoney(group.payable_amount === undefined ? (group.goods_amount || 0) : group.payable_amount)]
        ]
      }
    )
  })
  if (paymentOptions.length) {
    page.blocks.push({
      type: 'payment',
      title: '支付方式',
      items: paymentOptions,
      active: payChannel,
      action: 'paymentChannel'
    })
  }
  page.blocks.push({
    type: 'kv',
    title: '交易金额',
    items: [
      ['商品金额', formatMoney(preview ? preview.goods_amount : goodsAmount)],
      ['运费', formatMoney(preview ? preview.freight_amount : 0)],
      ['优惠', `-${formatMoney(preview ? preview.discount_amount : 0)}`]
    ]
  })
  page.bottom = {
    total: `应付 ${formatMoney(payable)}`,
    primary: paymentOptions.length ? '提交交易并支付' : '提交交易',
    primaryAction: 'submitOrder'
  }
  return page
}

export const createOrdersPage = (orders, activeStatus = 'all') => {
  const page = pageCopy('orders')
  page.blocks = [
    {
      type: 'chips',
      items: [
        { label: '全部', value: 'all' },
        { label: '待支付', value: 1 },
        { label: '待发货', value: 2 },
        { label: '待收货', value: 3 },
        { label: '已完成', value: 4 },
        { label: '已取消', value: 5 }
      ],
      active: activeStatus,
      action: 'orderStatus'
    },
    orders.length
      ? {
          type: 'orders',
          items: orders.map((order) => ({
            id: order.id,
            title: `订单 ${order.order_no}`,
            status: order.status_text,
            desc: order.items.map((item) => item.product_name).join('、') || '订单商品',
            price: formatMoney(order.payable_amount),
            target: `/pages/order/detail?id=${order.id}`
          }))
        }
      : emptyState('暂无订单', '完成下单后，订单会显示在这里。')
  ]
  return page
}

export const createOrderDetailPage = (order, paymentEnabled = true) => {
  const page = pageCopy('orderDetail')
  const canApplyAfterSale = order.status === 2 || order.status === 3 || order.status === 4
  const orderItems = order.items.map((item) => ({
    ...item,
    action: canApplyAfterSale ? '申请售后' : '',
    target: canApplyAfterSale
      ? `/pages/after-sales/apply?order_id=${order.id}&order_item_id=${item.id}`
      : ''
  }))
  page.blocks = [
    { type: 'state', title: order.status_text, desc: `订单号 ${order.order_no}` },
    { type: 'goodsList', title: '商品信息', items: orderItems.map(goodsItem) },
    {
      type: 'kv',
      title: '订单信息',
      items: [
        ['订单编号', order.order_no],
        ['商家', order.merchant_name || `商家 ${order.merchant_id}`],
        ['订单状态', order.status_text],
        ['应付金额', formatMoney(order.payable_amount)],
        ['收货地址', order.receiver_address || '-'],
        ['下单时间', formatDateTime(order.created_at)]
      ]
    }
  ]
  const actions = []
  if (order.status === 1) {
    actions.push({ text: '取消订单', action: 'cancelOrder', order })
    if (paymentEnabled) actions.push({ text: order.trade_id ? '合并支付' : '继续支付', primary: true, action: 'payOrder', order })
  }
  if (order.status === 3) {
    actions.push({ text: '查看物流', action: 'viewLogistics', order })
    actions.push({ text: '确认收货', primary: true, action: 'confirmOrder', order })
  } else if (order.shipment) {
    actions.push({ text: '查看配送', action: 'viewLogistics', order })
  }
  if (actions.length) page.blocks.push({ type: 'actions', items: actions })
  return page
}

export const createMinePage = (user, orders = [], afterSaleCount = 0) => {
  const page = pageCopy('mine')
  page.blocks = [
    {
      type: 'profile',
      name: user.nickname || user.mobile || `用户 ${user.id}`,
      desc: user.mobile || '已登录',
      avatar: normalizeAssetUrl(user.avatar),
      target: 'profile'
    },
    {
      type: 'stats',
      items: [
        [String(orders.filter((item) => item.status === 1).length), '待付款'],
        [String(orders.filter((item) => item.status === 2).length), '待发货'],
        [String(orders.length), '全部订单'],
        [String(afterSaleCount), '售后']
      ]
    },
    ...page.blocks.filter((block) => block.type === 'menu'),
    { type: 'actions', items: [{ text: '退出登录', action: 'logout' }] }
  ]
  return page
}

export const createProfilePage = (user) => {
  const page = pageCopy('profile')
  page.blocks = [
    { type: 'avatar', image: normalizeAssetUrl(user.avatar) },
    { type: 'profileForm' },
    { type: 'actions', items: [{ text: '保存资料', primary: true, action: 'saveProfile' }] }
  ]
  return page
}

export const createAddressPage = (addresses) => {
  const page = pageCopy('address')
  page.blocks = [
    addresses.length
      ? {
          type: 'addresses',
          items: addresses.map((item) => ({
            id: item.id,
            title: `${item.receiver_name} ${item.receiver_phone}`,
            desc: fullAddress(item),
            tag: item.is_default ? '默认' : '设为默认',
            isDefault: item.is_default,
            raw: item
          }))
        }
      : emptyState('还没有收货地址', '新增地址后即可提交订单。', 'mine'),
    { type: 'addressForm' }
  ]
  return page
}

export const createPaymentResultPage = (order, payment, trade = null) => {
  const page = pageCopy('payResult')
  const paid = payment && payment.status === 2
  const pending = payment && payment.status === 1
  const result = {
    type: 'result',
    result: paid ? 'success' : (pending ? 'pending' : 'failed'),
    status: paid ? '支付成功' : (pending ? '等待支付' : '支付未完成'),
    desc: paid ? '支付已确认，商家将尽快处理订单。' : `当前状态：${payment ? payment.status_text : '未找到支付单'}`,
    code: trade || (payment && payment.trade_id)
      ? `交易号：${(trade && trade.trade_no) || (payment && payment.trade_no) || '-'}`
      : `订单号：${order ? order.order_no : '-'}`,
    primary: '查看订单',
    secondary: '继续购物',
    primaryTarget: 'orders',
    secondaryTarget: 'home'
  }
  page.blocks = [result]
  if (payment && pending) {
    page.blocks.push({ type: 'actions', items: [{ text: '查询支付状态', primary: true, action: 'refreshPayment' }] })
  }
  return page
}

export const createLogisticsPage = (order, logistics) => {
  const page = pageCopy('logistics')
  const selfDelivery = logistics.delivery_type === 'self_delivery'
  const deliveryName = selfDelivery ? '商家配送' : (logistics.logistics_company || '快递配送')
  const tracking = logistics.tracking_no ? ` ${logistics.tracking_no}` : ''
  const traces = (logistics.traces || []).map((item, index) => ({
    title: index === 0 ? '最新进度' : '配送进度',
    desc: item.content,
    time: formatDateTime(item.time),
    active: index === 0
  }))

  page.blocks = [
    {
      type: 'summary',
      title: `${deliveryName}${tracking}`,
      desc: `订单 ${order.order_no}`
    },
    traces.length
      ? { type: 'timeline', title: '配送记录', items: traces }
      : {
          type: 'state',
          title: selfDelivery ? '商家正在配送' : '暂无物流轨迹',
          desc: logistics.shipped_at ? `发货时间 ${formatDateTime(logistics.shipped_at)}` : '商家发货后会更新配送信息。'
        }
  ]
  return page
}

export const createCouponsPage = ({ available = [], mine = [], mode = 'available' }) => {
  const page = pageCopy('coupons')
  const source = mode === 'mine' ? mine : available
  const couponItems = source.map((item) => {
    const coupon = item.coupon || item
    return {
      id: coupon.id,
      title: coupon.name,
      desc: `满 ${formatMoney(coupon.threshold_amount)} 减 ${formatMoney(coupon.discount_amount)}`,
      status: item.status_text || (coupon.claimed ? '已领取' : '可领取'),
      action: mode === 'available' && !coupon.claimed ? 'claimCoupon' : '',
      raw: item
    }
  })
  page.blocks = [
    {
      type: 'chips',
      items: [{ label: '可领取', value: 'available' }, { label: '我的优惠券', value: 'mine' }],
      active: mode,
      action: 'couponMode'
    },
    couponItems.length
      ? { type: 'coupons', items: couponItems }
      : emptyState(mode === 'mine' ? '暂无优惠券' : '暂无可领取优惠券', '优惠券更新后会显示在这里。', 'mine')
  ]
  return page
}

export const createFavoritesPage = (products) => {
  const page = pageCopy('favorites')
  page.blocks = products.length
    ? [{
        type: 'favoriteProducts',
        items: products.map((item) => ({ ...productCard(item), action: 'removeFavorite' }))
      }]
    : [emptyState('还没有收藏商品', '收藏的商品会显示在这里。')]
  return page
}

export const createAfterSaleListPage = (items, activeStatus = 'all') => {
  const page = pageCopy('afterSaleList')
  page.blocks = [
    {
      type: 'chips',
      items: [
        { label: '全部', value: 'all' },
        { label: '待审核', value: 1 },
        { label: '退款中', value: 2 },
        { label: '已退款', value: 3 },
        { label: '已拒绝', value: 4 },
        { label: '已取消', value: 5 },
        { label: '退款失败', value: 6 }
      ],
      active: activeStatus,
      action: 'afterSaleStatus'
    },
    items.length
      ? {
          type: 'orders',
          items: items.map((item) => ({
            id: item.id,
            title: `售后 ${item.after_sale_no}`,
            status: item.status_text,
            desc: `${item.product_name} · ${item.type_text}`,
            price: formatMoney(item.refund_amount),
            target: `/pages/after-sales/detail?id=${item.id}`
          }))
        }
      : emptyState('暂无售后申请', '可从订单详情选择商品发起售后。', 'orders')
  ]
  return page
}

export const createAfterSaleApplyPage = (order, item) => {
  const page = pageCopy('afterSaleApply')
  page.blocks = [
    {
      type: 'summary',
      title: item.product_name,
      desc: `${item.sku_name || '默认规格'} · 可退款 ${formatMoney(item.payable_amount)}`
    },
    { type: 'afterSaleForm' },
    { type: 'actions', items: [{ text: '提交申请', primary: true, action: 'submitAfterSale', order, orderItem: item }] }
  ]
  return page
}

export const createAfterSaleDetailPage = (item) => {
  const page = pageCopy('afterSaleDetail')
  const fields = [
    ['售后单号', item.after_sale_no],
    ['订单号', item.order_no],
    ['售后类型', item.type_text],
    ['退款金额', formatMoney(item.refund_amount)],
    ['申请原因', item.reason],
    ['申请时间', formatDateTime(item.created_at)]
  ]
  if (item.reject_reason) fields.push(['拒绝原因', item.reject_reason])
  if (item.refund) fields.push(['退款状态', item.refund.status_text])
  page.blocks = [
    { type: 'state', title: item.status_text, desc: `${item.product_name} · ${item.sku_name || '默认规格'}` },
    { type: 'kv', title: '售后信息', items: fields }
  ]
  if (item.status === 1) {
    page.blocks.push({ type: 'actions', items: [{ text: '取消申请', action: 'cancelAfterSale', afterSale: item }] })
  }
  return page
}
