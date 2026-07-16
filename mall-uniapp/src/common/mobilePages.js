export const pageRoutes = {
  home: '/pages/index/index',
  category: '/pages/category/index',
  list: '/pages/search/list',
  detail: '/pages/product/detail',
  cart: '/pages/cart/index',
  checkout: '/pages/checkout/index',
  payResult: '/pages/payment/result',
  orders: '/pages/order/list',
  orderDetail: '/pages/order/detail',
  logistics: '/pages/order/logistics',
  afterSaleList: '/pages/after-sales/list',
  afterSaleApply: '/pages/after-sales/apply',
  afterSaleDetail: '/pages/after-sales/detail',
  mine: '/pages/user/mine',
  login: '/pages/user/login',
  profile: '/pages/user/profile',
  address: '/pages/user/address',
  coupons: '/pages/user/coupons',
  favorites: '/pages/user/favorites'
}

export const tabRoutes = [
  pageRoutes.home,
  pageRoutes.category,
  pageRoutes.cart,
  pageRoutes.orders,
  pageRoutes.mine
]

const dynamicPage = (title) => ({ title, blocks: [] })

export const mobilePages = {
  home: {
    title: '商城首页',
    blocks: [
      { type: 'search', placeholder: '搜索商品', target: 'list' },
      { type: 'iconGrid', items: [] },
      { type: 'title', text: '为你推荐' },
      { type: 'products', items: [] }
    ]
  },
  category: dynamicPage('商品分类'),
  list: dynamicPage('搜索结果'),
  detail: dynamicPage('商品详情'),
  cart: dynamicPage('购物车'),
  checkout: dynamicPage('确认订单'),
  payResult: dynamicPage('支付结果'),
  orders: dynamicPage('我的订单'),
  orderDetail: dynamicPage('订单详情'),
  logistics: dynamicPage('物流跟踪'),
  afterSaleList: dynamicPage('售后服务'),
  afterSaleApply: dynamicPage('申请售后'),
  afterSaleDetail: dynamicPage('售后详情'),
  profile: dynamicPage('个人资料'),
  address: dynamicPage('地址管理'),
  coupons: dynamicPage('优惠券'),
  favorites: dynamicPage('收藏夹'),
  mine: {
    title: '我的',
    blocks: [{
      type: 'menu',
      items: [
        ['地址管理', 'address'],
        ['优惠券', 'coupons'],
        ['收藏商品', 'favorites'],
        ['售后服务', 'afterSaleList']
      ]
    }]
  },
  login: {
    title: '账号登录',
    blocks: [{ type: 'login' }]
  }
}
