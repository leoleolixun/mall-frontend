const products = [
  { name: '蓝牙耳机 Pro', price: '¥299', tag: '主动降噪' },
  { name: '智能台灯', price: '¥159', tag: '护眼调光' },
  { name: '氨基酸洁面乳', price: '¥128', tag: '温和洁净' },
  { name: '儿童保温杯', price: '¥89', tag: '316 不锈钢' }
]

const orderGoods = [
  { name: '蓝牙耳机 Pro', desc: '曜石黑 · 1 件', price: '¥299' },
  { name: '氨基酸洁面乳', desc: '套装 · 2 件', price: '¥256' }
]

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
  favorites: '/pages/user/favorites',
  messages: '/pages/message/index',
  security: '/pages/security/index',
  support: '/pages/support/tickets',
  invoice: '/pages/invoice/index',
  help: '/pages/help/index',
  empty: '/pages/search/empty'
}

export const tabRoutes = [
  pageRoutes.home,
  pageRoutes.category,
  pageRoutes.cart,
  pageRoutes.orders,
  pageRoutes.mine
]

export const mobilePages = {
  home: {
    title: '商城首页',
    blocks: [
      { type: 'search', placeholder: '搜索商品 / 品牌', target: 'list' },
      { type: 'hero', title: '夏季焕新', desc: '领券下单更划算', action: '立即选购', target: 'list' },
      { type: 'iconGrid', items: ['美妆', '数码', '服饰', '母婴', '食品'] },
      { type: 'title', text: '为你推荐' },
      { type: 'products', items: products.slice(0, 4) }
    ]
  },
  category: {
    title: '商品分类',
    blocks: [
      { type: 'search', placeholder: '搜索分类或商品', target: 'list' },
      {
        type: 'category',
        active: '数码',
        tabs: ['推荐', '美妆', '数码', '服饰', '母婴', '家居', '食品'],
        title: '数码家电',
        items: ['手机通讯', '影音娱乐', '智能穿戴', '生活电器', '电脑办公', '配件耗材']
      }
    ]
  },
  list: {
    title: '搜索结果',
    blocks: [
      { type: 'search', placeholder: '蓝牙耳机', target: 'empty' },
      { type: 'chips', items: ['综合', '销量', '新品', '价格'], active: '综合' },
      { type: 'products', items: products }
    ]
  },
  detail: {
    title: '商品详情',
    bottom: { left: '客服', secondary: '加入购物车', primary: '立即购买', target: 'checkout' },
    blocks: [
      { type: 'detailHero', title: '蓝牙耳机 Pro 主动降噪', price: '¥299', desc: '高解析音质 · 30 小时续航 · 30 天无忧退换' },
      { type: 'sku', title: '规格', items: ['曜石黑', '珍珠白', '海盐蓝'], active: '曜石黑' },
      { type: 'info', title: '商品保障', desc: '正品保障、极速发货、7 天无理由退换。' }
    ]
  },
  cart: {
    title: '购物车',
    bottom: { total: '合计 ¥604', primary: '去结算', target: 'checkout' },
    blocks: [
      {
        type: 'cart',
        items: [
          { name: '蓝牙耳机 Pro', desc: '曜石黑', price: '¥299', count: 1 },
          { name: '氨基酸洁面乳', desc: '套装', price: '¥128', count: 2 },
          { name: '儿童保温杯', desc: '粉色', price: '¥89', count: 1 }
        ]
      }
    ]
  },
  checkout: {
    title: '确认订单',
    bottom: { total: '应付 ¥604', primary: '提交订单', target: 'payResult' },
    blocks: [
      { type: 'addressCard', title: '李先生 138****8888', desc: '上海市浦东新区 XX 路 88 号', tag: '默认', target: 'address' },
      { type: 'goodsList', title: '商品清单', items: orderGoods },
      { type: 'payment', title: '支付方式', items: ['微信支付', '支付宝'], active: '微信支付' }
    ]
  },
  payResult: {
    title: '支付结果',
    blocks: [
      { type: 'result', status: '支付成功', desc: '订单已提交，商家将尽快发货。', code: '订单号：202607040001', primary: '查看订单', secondary: '继续购物', primaryTarget: 'orderDetail', secondaryTarget: 'home' }
    ]
  },
  orders: {
    title: '我的订单',
    blocks: [
      { type: 'chips', items: ['全部', '待付款', '待发货', '待收货'], active: '全部' },
      {
        type: 'orders',
        items: [
          { title: '订单 202607040001', status: '待发货', desc: '蓝牙耳机 Pro 等 2 件商品', price: '¥525', target: 'orderDetail' },
          { title: '订单 202607030012', status: '待支付', desc: '智能台灯等 1 件商品', price: '¥159', target: 'checkout' },
          { title: '订单 202607020030', status: '已完成', desc: '儿童保温杯等 1 件商品', price: '¥89', target: 'orderDetail' }
        ]
      }
    ]
  },
  orderDetail: {
    title: '订单详情',
    blocks: [
      { type: 'state', title: '待发货', desc: '商家正在为你备货，请耐心等待。' },
      { type: 'goodsList', title: '商品信息', items: orderGoods },
      { type: 'kv', title: '订单信息', items: [['订单编号', '202607040001'], ['下单时间', '2026-07-04 18:30'], ['支付方式', '微信支付']] },
      { type: 'actions', items: [{ text: '联系商家' }, { text: '查看物流', primary: true, target: 'logistics' }] }
    ]
  },
  logistics: {
    title: '物流跟踪',
    blocks: [
      { type: 'summary', title: '顺丰速运 SF1234567890', desc: '预计明日 18:00 前送达', action: '复制单号' },
      {
        type: 'timeline',
        title: '物流轨迹',
        items: [
          { title: '运输中', desc: '快件已到达上海浦东集散中心', time: '2026-07-05 09:20', active: true },
          { title: '已揽收', desc: '商家已交付快递', time: '2026-07-04 20:14' },
          { title: '已出库', desc: '仓库完成拣货并出库', time: '2026-07-04 19:02' }
        ]
      }
    ]
  },
  afterSaleList: {
    title: '售后服务',
    blocks: [
      { type: 'chips', items: ['全部', '处理中', '待寄回', '已完成'], active: '全部' },
      {
        type: 'orders',
        items: [
          { title: 'AS202607040001', status: '待寄回', desc: '蓝牙耳机 Pro · 退款退货', price: '¥299', target: 'afterSaleDetail' },
          { title: 'AS202607020018', status: '处理中', desc: '智能台灯 · 换货', price: '¥159', target: 'afterSaleDetail' },
          { title: 'AS202606280033', status: '已完成', desc: '儿童保温杯 · 仅退款', price: '¥89', target: 'afterSaleDetail' }
        ]
      },
      { type: 'actions', items: [{ text: '申请售后', primary: true, target: 'afterSaleApply' }] }
    ]
  },
  afterSaleApply: {
    title: '申请售后',
    blocks: [
      { type: 'summary', title: '蓝牙耳机 Pro', desc: '可申请退款 / 退货退款' },
      { type: 'form', title: '服务类型', groups: [{ label: '服务类型', items: ['仅退款', '退货退款', '换货'], active: '退货退款' }, { label: '退款原因', items: ['商品破损', '错发漏发', '不想要了'], active: '商品破损' }], placeholder: '退款说明', upload: '上传凭证' },
      { type: 'actions', items: [{ text: '提交申请', primary: true, target: 'afterSaleDetail' }] }
    ]
  },
  afterSaleDetail: {
    title: '售后详情',
    blocks: [
      { type: 'state', title: '待寄回商品', desc: '请在 7 天内填写退货物流信息。' },
      { type: 'steps', items: [['申请提交', '已完成'], ['商家审核', '已通过'], ['买家寄回', '待处理']] },
      { type: 'kv', title: '服务信息', items: [['服务单号', 'AS202607040001'], ['退款金额', '¥299'], ['退货地址', '上海市浦东新区售后仓']] },
      { type: 'actions', items: [{ text: '填写物流', primary: true }] }
    ]
  },
  mine: {
    title: '我的',
    blocks: [
      { type: 'profile', name: '李先生', desc: '积分 1280 · 普通会员', target: 'profile' },
      { type: 'stats', items: [['1', '待付款'], ['2', '待发货'], ['1', '待收货'], ['0', '售后']] },
      { type: 'menu', items: [['地址管理', 'address'], ['优惠券', 'coupons'], ['收藏商品', 'favorites'], ['客服工单', 'support'], ['账号安全', 'security'], ['消息中心', 'messages']] }
    ]
  },
  login: {
    title: '登录授权',
    blocks: [
      { type: 'login', title: '欢迎登录商城', desc: '授权手机号后可同步订单、优惠券和售后进度。', primary: '微信一键登录', secondary: '手机号登录', target: 'mine' }
    ]
  },
  profile: {
    title: '个人资料',
    blocks: [
      { type: 'avatar' },
      { type: 'fields', items: [['昵称', '李先生'], ['手机号', '138****8888'], ['生日', '1995-01-01'], ['性别', '男'], ['地区', '上海市']] },
      { type: 'actions', items: [{ text: '保存资料', primary: true, target: 'mine' }] }
    ]
  },
  address: {
    title: '地址管理',
    blocks: [
      { type: 'addresses', items: [['李先生 138****8888', '上海市浦东新区 XX 路 88 号', '默认'], ['王女士 139****6666', '杭州市西湖区 XX 路 20 号', '家']] },
      { type: 'actions', items: [{ text: '新增收货地址', primary: true }] }
    ]
  },
  coupons: {
    title: '优惠券',
    blocks: [
      { type: 'chips', items: ['可用', '已使用', '已过期'], active: '可用' },
      { type: 'coupons', items: [['满 299 减 30', '全品类可用'], ['满 99 减 10', '美妆个护可用'], ['新人专享 8 折', '指定商品可用']] }
    ]
  },
  favorites: {
    title: '收藏夹',
    blocks: [
      { type: 'chips', items: ['商品', '店铺'], active: '商品' },
      { type: 'products', items: products }
    ]
  },
  messages: {
    title: '消息中心',
    blocks: [
      { type: 'messages', items: [['交易物流', '你的订单已从上海发出'], ['优惠活动', '你有一张优惠券即将过期'], ['账户通知', '登录设备发生变化']] }
    ]
  },
  security: {
    title: '账号安全',
    blocks: [
      { type: 'state', title: '安全等级 高', desc: '已绑定手机号，建议开启支付密码。' },
      { type: 'fields', items: [['绑定手机', '已完成'], ['实名认证', '已完成'], ['支付密码', '去设置'], ['隐私设置', '去设置'], ['注销账号', '申请']] }
    ]
  },
  support: {
    title: '客服工单',
    blocks: [
      { type: 'chips', items: ['订单问题', '售后问题', '发票问题'], active: '订单问题' },
      { type: 'orders', items: [{ title: 'TK202607050001', status: '待客服回复', desc: '关于订单配送时效的咨询' }, { title: 'TK202607030006', status: '已解决', desc: '商品退款到账时间咨询' }] },
      { type: 'actions', items: [{ text: '新建工单', primary: true }] }
    ]
  },
  invoice: {
    title: '发票管理',
    blocks: [
      { type: 'state', title: '可开发票订单', desc: '选择已完成订单，提交抬头信息。', action: '申请发票' },
      { type: 'orders', items: [{ title: '蓝牙耳机 Pro 订单', status: '电子普通发票', desc: '2026-07-04', price: '¥299' }, { title: '智能台灯订单', status: '待开票', desc: '2026-07-03', price: '¥159' }] }
    ]
  },
  help: {
    title: '帮助中心',
    blocks: [
      { type: 'search', placeholder: '搜索帮助问题', target: 'empty' },
      { type: 'menu', title: '热门问题', items: [['如何修改收货地址'], ['订单多久发货'], ['如何申请退款'], ['发票在哪里下载']] },
      { type: 'state', title: '仍需帮助？', desc: '联系在线客服或提交工单。', action: '联系客服', target: 'support' }
    ]
  },
  empty: {
    title: '搜索结果',
    blocks: [
      { type: 'search', placeholder: '不存在的商品' },
      { type: 'empty', title: '没有找到相关商品', desc: '换个关键词试试，或看看推荐商品。', primary: '返回首页', secondary: '重新搜索', primaryTarget: 'home', secondaryTarget: 'list' },
      { type: 'title', text: '猜你喜欢' },
      { type: 'products', items: products.slice(1, 3) }
    ]
  }
}
