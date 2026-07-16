import { formatMoney, normalizeAssetUrl } from '@/api/client.js'
import { mobilePages } from './mobilePages.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

const pageCopy = (key) => clone(mobilePages[key] || mobilePages.home)

const productCard = (item) => ({
  id: item.id,
  name: item.name,
  price: formatMoney(item.min_price),
  tag: item.min_price > 0 ? '接口商品' : '暂无价格',
  image: normalizeAssetUrl(item.cover),
  target: `/pages/product/detail?id=${item.id}`
})

const goodsItem = (item) => ({
  id: item.sku_id || item.id,
  name: item.product_name || `SKU ${item.sku_id}`,
  desc: `${item.sku_name || '默认规格'} · ${item.quantity} 件`,
  price: formatMoney(item.subtotal === undefined ? item.price * item.quantity : item.subtotal),
  image: normalizeAssetUrl(item.sku_image)
})

const emptyState = (title, desc, target = 'home') => ({
  type: 'empty',
  title,
  desc,
  primary: '返回首页',
  secondary: '重新加载',
  primaryTarget: target,
  secondaryAction: 'refresh'
})

export const createHomePage = (categories, products) => {
  const page = pageCopy('home')
  const categoryBlock = page.blocks.find((block) => block.type === 'iconGrid')
  const productBlock = page.blocks.find((block) => block.type === 'products')

  if (categoryBlock) categoryBlock.items = categories.slice(0, 8).map((item) => item.name)
  if (productBlock) productBlock.items = products.map(productCard)
  if (!products.length) page.blocks.push(emptyState('暂无上架商品', '商品上架后会显示在这里。'))
  return page
}

export const createCatalogPage = ({ categories, products, categoryId = null, keyword = '', total = 0, pageKey = 'list' }) => {
  const page = pageCopy(pageKey)
  const selected = categoryId === null ? 'all' : Number(categoryId)
  const categoryItems = [{ label: '全部', value: 'all' }].concat(
    categories.map((item) => ({ label: item.name, value: item.id }))
  )

  page.blocks = [
    { type: 'searchInput', placeholder: '搜索商品', value: keyword },
    { type: 'chips', items: categoryItems, active: selected, action: 'category' },
    { type: 'title', text: keyword ? `“${keyword}” 共 ${total} 件` : `全部商品 · ${total} 件` },
    products.length
      ? { type: 'products', items: products.map(productCard) }
      : emptyState('没有找到相关商品', '换个分类或关键词再试试。', 'home')
  ]
  return page
}

export const createDetailPage = (detail, selectedSkuId) => {
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
    }
  ]
  page.bottom = {
    left: selectedSku ? `库存 ${selectedSku.stock}` : '暂不可售',
    secondary: '加入购物车',
    secondaryAction: 'addCart',
    primary: '立即购买',
    primaryAction: 'buyNow'
  }
  return page
}

export const createCartPage = (items) => {
  const page = pageCopy('cart')
  const total = items.reduce((sum, item) => sum + (item.available === false ? 0 : Number(item.subtotal) || 0), 0)

  page.blocks = items.length
    ? [{
        type: 'cart',
        items: items.map((item) => ({
          id: item.sku_id,
          productId: item.product_id,
          name: item.product_name || `SKU ${item.sku_id}`,
          desc: item.message || item.sku_name || '默认规格',
          price: formatMoney(item.price),
          count: item.quantity,
          available: item.available,
          image: normalizeAssetUrl(item.sku_image)
        }))
      }]
    : [emptyState('购物车还是空的', '挑选商品后再来结算。')]
  page.bottom = items.length
    ? { total: `合计 ${formatMoney(total)}`, primary: '去结算', primaryAction: 'checkout' }
    : null
  return page
}

const fullAddress = (address) => address
  ? [address.province, address.city, address.district, address.detail].filter(Boolean).join('')
  : ''

export const createCheckoutPage = ({ items, address, preview, payChannel }) => {
  const page = pageCopy('checkout')
  if (!items.length) {
    page.blocks = [emptyState('没有可结算商品', '请先将商品加入购物车。')]
    page.bottom = null
    return page
  }
  const goodsAmount = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
  const payable = preview ? preview.payable_amount : goodsAmount

  page.blocks = [
    {
      type: 'addressCard',
      title: address ? `${address.receiver_name} ${address.receiver_phone}` : '请选择收货地址',
      desc: address ? fullAddress(address) : '下单前需要先添加一个收货地址',
      tag: address && address.is_default ? '默认' : '选择',
      target: 'address'
    },
    { type: 'goodsList', title: '商品清单', items: items.map(goodsItem) },
    {
      type: 'payment',
      title: '支付方式',
      items: [
        { label: '模拟支付', value: 'mock' },
        { label: '微信支付', value: 'wechat' },
        { label: '支付宝', value: 'alipay' }
      ],
      active: payChannel,
      action: 'paymentChannel'
    },
    {
      type: 'kv',
      title: '金额明细',
      items: [
        ['商品金额', formatMoney(preview ? preview.goods_amount : goodsAmount)],
        ['运费', formatMoney(preview ? preview.freight_amount : 0)],
        ['优惠', `-${formatMoney(preview ? preview.discount_amount : 0)}`]
      ]
    }
  ]
  page.bottom = {
    total: `应付 ${formatMoney(payable)}`,
    primary: '提交订单',
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
        { label: '已支付', value: 2 }
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

export const createOrderDetailPage = (order) => {
  const page = pageCopy('orderDetail')
  page.blocks = [
    { type: 'state', title: order.status_text, desc: `订单号 ${order.order_no}` },
    { type: 'goodsList', title: '商品信息', items: order.items.map(goodsItem) },
    {
      type: 'kv',
      title: '订单信息',
      items: [
        ['订单编号', order.order_no],
        ['订单状态', order.status_text],
        ['应付金额', formatMoney(order.payable_amount)]
      ]
    }
  ]
  if (order.status === 1) {
    page.blocks.push({ type: 'actions', items: [{ text: '继续支付', primary: true, action: 'payOrder', order }] })
  }
  return page
}

export const createMinePage = (user, orders = []) => {
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
        [String(orders.filter((item) => item.status === 2).length), '已支付'],
        [String(orders.length), '全部订单'],
        ['0', '售后']
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

export const createPaymentResultPage = (order, payment) => {
  const page = pageCopy('payResult')
  const paid = payment && payment.status === 2
  const result = {
    type: 'result',
    status: paid ? '支付成功' : '等待支付',
    desc: paid ? '支付已确认，商家将尽快处理订单。' : `当前状态：${payment ? payment.status_text : '未创建支付单'}`,
    code: `订单号：${order ? order.order_no : '-'}`,
    primary: '查看订单',
    secondary: '继续购物',
    primaryTarget: 'orders',
    secondaryTarget: 'home'
  }
  page.blocks = [result]
  if (payment && !paid && payment.pay_channel === 'mock') {
    page.blocks.push({ type: 'actions', items: [{ text: '模拟支付完成', primary: true, action: 'completePayment' }] })
  }
  if (payment && !paid) {
    page.blocks.push({ type: 'actions', items: [{ text: '刷新支付状态', action: 'refreshPayment' }] })
  }
  return page
}
