<template>
  <view class="page-shell">
    <scroll-view scroll-y class="page-scroll" :class="{ 'page-scroll--bottom': page.bottom }">
      <view class="page-content">
        <view v-if="loading" class="request-state">正在加载...</view>
        <view v-if="errorMessage" class="request-state request-state--error" @tap="refresh">
          <text>{{ errorMessage }}</text>
          <text class="request-state__action">点击重试</text>
        </view>
        <block v-for="(block, index) in page.blocks" :key="index">
          <view v-if="block.type === 'search'" class="search-box" @tap="go(block.target)">
            <text class="search-icon">⌕</text>
            <text class="search-text">{{ block.placeholder }}</text>
          </view>

          <view v-else-if="block.type === 'searchInput'" class="search-box">
            <text class="search-icon">⌕</text>
            <input
              v-model="searchKeyword"
              class="search-input"
              confirm-type="search"
              :placeholder="block.placeholder"
              @confirm="submitSearch"
            />
          </view>

          <view v-else-if="block.type === 'hero'" class="hero-card">
            <view>
              <text class="hero-title">{{ block.title }}</text>
              <text class="hero-desc">{{ block.desc }}</text>
            </view>
            <view class="button button--primary" @tap="go(block.target)">{{ block.action }}</view>
          </view>

          <view v-else-if="block.type === 'iconGrid'" class="icon-grid">
            <view v-for="item in block.items" :key="optionValue(item)" class="icon-item" @tap="go(item.target || 'category')">
              <view class="round-icon">{{ optionLabel(item).slice(0, 1) }}</view>
              <text>{{ optionLabel(item) }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'merchantList'" class="merchant-section">
            <text class="section-title section-title--compact">{{ block.title }}</text>
            <scroll-view scroll-x class="merchant-scroll" :show-scrollbar="false">
              <view class="merchant-row-list">
                <view v-for="item in block.items" :key="item.id" class="merchant-tile" @tap="go(item.target)">
                  <view class="merchant-logo">
                    <image v-if="item.logo" class="media-image" :src="item.logo" mode="aspectFill" />
                    <text v-else>{{ item.name.slice(0, 1) }}</text>
                  </view>
                  <text class="merchant-name">{{ item.name }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <text v-else-if="block.type === 'title'" class="section-title">{{ block.text }}</text>

          <view v-else-if="block.type === 'products'" class="product-grid">
            <view v-for="item in block.items" :key="item.id || item.name" class="product-card" @tap="go(item.target || 'detail')">
              <view class="product-image">
                <image v-if="item.image" class="media-image" :src="item.image" mode="aspectFill" />
                <text v-else>{{ item.tag }}</text>
              </view>
              <text class="product-name">{{ item.name }}</text>
              <text v-if="item.merchantName" class="product-merchant">{{ item.merchantName }}</text>
              <text class="product-price">{{ item.price }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'merchantBanner'" class="merchant-banner" @tap="go(block.target)">
            <view class="merchant-logo merchant-logo--small">
              <image v-if="block.logo" class="media-image" :src="block.logo" mode="aspectFill" />
              <text v-else>{{ block.name.slice(0, 1) }}</text>
            </view>
            <view class="merchant-banner__copy">
              <text class="item-title">{{ block.name }}</text>
              <text class="muted">{{ block.desc }}</text>
            </view>
            <text v-if="block.target" class="merchant-banner__arrow">›</text>
          </view>

          <view v-else-if="block.type === 'category'" class="category-panel">
            <view class="category-side">
              <view v-for="item in block.tabs" :key="item" class="category-tab" :class="{ active: item === block.active }">
                <text>{{ item }}</text>
              </view>
            </view>
            <view class="category-main">
              <text class="section-title section-title--compact">{{ block.title }}</text>
              <view class="sub-grid">
                <view v-for="item in block.items" :key="item" class="sub-item" @tap="go('list')">
                  <view class="sub-image">{{ item.slice(0, 1) }}</view>
                  <text>{{ item }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-else-if="block.type === 'chips'" class="chips">
            <view
              v-for="item in block.items"
              :key="optionValue(item)"
              class="chip"
              :class="{ active: optionValue(item) === block.active, disabled: item.disabled }"
              @tap="selectOption(block, item)"
            >{{ optionLabel(item) }}</view>
          </view>

          <view v-else-if="block.type === 'detailHero'" class="detail-block">
            <view class="detail-image">
              <image v-if="block.image" class="media-image" :src="block.image" mode="aspectFill" />
              <text v-else>商品</text>
            </view>
            <view class="detail-info">
              <text class="detail-title">{{ block.title }}</text>
              <text class="detail-price">{{ block.price }}</text>
              <text class="muted">{{ block.desc }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'sku'" class="card">
            <text class="card-title">{{ block.title }}</text>
            <view class="chips chips--inside">
              <view
                v-for="item in block.items"
                :key="optionValue(item)"
                class="chip"
                :class="{ active: optionValue(item) === block.active, disabled: item.disabled }"
                @tap="selectOption(block, item)"
              >{{ optionLabel(item) }}</view>
            </view>
          </view>

          <view v-else-if="block.type === 'info'" class="card">
            <text class="card-title">{{ block.title }}</text>
            <text class="muted">{{ block.desc }}</text>
          </view>

          <view v-else-if="block.type === 'cart'" class="list">
            <view class="cart-merchant" @tap="go(block.target)">
              <view class="merchant-logo merchant-logo--small">
                <image v-if="block.merchantLogo" class="media-image" :src="block.merchantLogo" mode="aspectFill" />
                <text v-else>{{ block.merchantName.slice(0, 1) }}</text>
              </view>
              <text class="item-title">{{ block.merchantName }}</text>
              <text v-if="block.target" class="merchant-banner__arrow">›</text>
            </view>
            <view v-for="item in block.items" :key="item.id || item.name" class="cart-card" :class="{ 'cart-card--disabled': item.available === false }">
              <view class="thumb">
                <image v-if="item.image" class="media-image" :src="item.image" mode="aspectFill" />
              </view>
              <view class="cart-info">
                <text class="item-title">{{ item.name }}</text>
                <text class="muted">{{ item.desc }}</text>
                <text class="product-price">{{ item.price }}</text>
              </view>
              <view class="counter">
                <view class="counter-button" @tap="changeCart(item, item.count - 1)">−</view>
                <text class="counter-value">{{ item.count }}</text>
                <view class="counter-button" @tap="changeCart(item, item.count + 1)">＋</view>
              </view>
            </view>
          </view>

          <view v-else-if="block.type === 'addressCard'" class="address-card" @tap="go(block.target)">
            <view>
              <text class="item-title">{{ block.title }}</text>
              <text class="muted">{{ block.desc }}</text>
            </view>
            <text class="tag">{{ block.tag }}</text>
          </view>

          <view v-else-if="block.type === 'goodsList'" class="card">
            <text class="card-title">{{ block.title }}</text>
            <view v-for="item in block.items" :key="item.id || item.name" class="goods-row">
              <view class="thumb thumb--small">
                <image v-if="item.image" class="media-image" :src="item.image" mode="aspectFill" />
              </view>
              <view class="goods-info">
                <text class="item-title">{{ item.name }}</text>
                <text class="muted">{{ item.desc }}</text>
                <text v-if="item.action" class="text-action text-action--inline" @tap.stop="go(item.target)">{{ item.action }}</text>
              </view>
              <text class="item-price">{{ item.price }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'payment' || block.type === 'couponSelector'" class="card">
            <text class="card-title">{{ block.title }}</text>
            <view v-if="block.items.length" class="chips chips--inside">
              <view
                v-for="item in block.items"
                :key="optionValue(item)"
                class="chip"
                :class="{ active: optionValue(item) === block.active, disabled: item.disabled }"
                @tap="selectOption(block, item)"
              >{{ optionLabel(item) }}</view>
            </view>
            <text v-else class="muted">当前平台暂无可用支付方式</text>
          </view>

          <view v-else-if="block.type === 'result'" class="result-card">
            <view class="success-icon" :class="{ 'success-icon--pending': block.result === 'pending', 'success-icon--failed': block.result === 'failed' }">
              {{ block.result === 'success' ? '✓' : (block.result === 'pending' ? '…' : '!') }}
            </view>
            <text class="result-title">{{ block.status }}</text>
            <text class="muted centered">{{ block.desc }}</text>
            <text class="code-text">{{ block.code }}</text>
            <view class="action-row">
              <view class="button button--ghost" @tap="go(block.secondaryTarget)">{{ block.secondary }}</view>
              <view class="button button--primary" @tap="go(block.primaryTarget)">{{ block.primary }}</view>
            </view>
          </view>

          <view v-else-if="block.type === 'orders'" class="list">
            <view v-for="item in block.items" :key="item.title" class="order-card" @tap="go(item.target)">
              <view class="order-head">
                <text class="item-title">{{ item.title }}</text>
                <text class="tag" :class="{ 'tag--hot': item.status === '待支付' || item.status === '待寄回' || item.status === '待客服回复' }">{{ item.status }}</text>
              </view>
              <view class="order-body">
                <view class="thumb thumb--small"></view>
                <text class="muted order-desc">{{ item.desc }}</text>
                <text v-if="item.price" class="item-price">{{ item.price }}</text>
              </view>
            </view>
          </view>

          <view v-else-if="block.type === 'state'" class="state-card">
            <view>
              <text class="state-title">{{ block.title }}</text>
              <text class="state-desc">{{ block.desc }}</text>
            </view>
            <view v-if="block.action" class="button button--primary button--small" @tap="go(block.target)">{{ block.action }}</view>
          </view>

          <view v-else-if="block.type === 'kv'" class="card">
            <text class="card-title">{{ block.title }}</text>
            <view v-for="item in block.items" :key="item[0]" class="field-row">
              <text class="field-label">{{ item[0] }}</text>
              <text class="field-value">{{ item[1] }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'actions'" class="action-row action-row--block">
            <view v-for="item in block.items" :key="item.text" class="button" :class="item.primary ? 'button--primary' : 'button--ghost'" @tap="runAction(item)">
              {{ item.text }}
            </view>
          </view>

          <view v-else-if="block.type === 'summary'" class="summary-card">
            <view class="thumb"></view>
            <view class="summary-info">
              <text class="item-title">{{ block.title }}</text>
              <text class="muted">{{ block.desc }}</text>
            </view>
            <view v-if="block.action" class="button button--ghost button--small">{{ block.action }}</view>
          </view>

          <view v-else-if="block.type === 'timeline'" class="card">
            <text class="card-title">{{ block.title }}</text>
            <view v-for="item in block.items" :key="item.title" class="timeline-row">
              <view class="timeline-dot" :class="{ active: item.active }"></view>
              <view class="timeline-info">
                <text class="item-title" :class="{ red: item.active }">{{ item.title }}</text>
                <text class="muted">{{ item.desc }}</text>
                <text class="time-text">{{ item.time }}</text>
              </view>
            </view>
          </view>

          <view v-else-if="block.type === 'form'" class="card">
            <text class="card-title">{{ block.title }}</text>
            <view v-for="group in block.groups" :key="group.label" class="form-group">
              <text class="field-label">{{ group.label }}</text>
              <view class="chips chips--inside">
                <view v-for="item in group.items" :key="item" class="chip" :class="{ active: item === group.active }">{{ item }}</view>
              </view>
            </view>
            <view class="input-box">{{ block.placeholder }}</view>
            <view class="upload-box">＋ {{ block.upload }}</view>
          </view>

          <view v-else-if="block.type === 'afterSaleForm'" class="card form-stack">
            <text class="card-title">售后类型</text>
            <view class="chips chips--inside">
              <view class="chip" :class="{ active: afterSaleForm.type === 'refund_only' }" @tap="selectAfterSaleType('refund_only')">仅退款</view>
              <view class="chip" :class="{ active: afterSaleForm.type === 'return_refund' }" @tap="selectAfterSaleType('return_refund')">退货退款</view>
            </view>
            <text class="card-title card-title--spaced">申请原因</text>
            <view class="chips chips--inside">
              <view
                v-for="reason in ['商品质量问题', '商品破损', '错发漏发', '其他原因']"
                :key="reason"
                class="chip"
                :class="{ active: afterSaleForm.reason === reason }"
                @tap="selectAfterSaleReason(reason)"
              >{{ reason }}</view>
            </view>
            <textarea v-model.trim="afterSaleForm.description" class="form-textarea" maxlength="500" placeholder="补充说明（选填）" />
            <text class="muted">最多 500 字</text>
          </view>

          <view v-else-if="block.type === 'steps'" class="card">
            <view v-for="(item, stepIndex) in block.items" :key="item[0]" class="step-row">
              <view class="timeline-dot" :class="{ active: stepIndex < 2 }"></view>
              <text class="item-title">{{ item[0] }}</text>
              <text class="field-value" :class="{ red: stepIndex < 2 }">{{ item[1] }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'profile'" class="profile-card" @tap="go(block.target)">
            <view class="avatar">
              <image v-if="block.avatar" class="media-image media-image--round" :src="block.avatar" mode="aspectFill" />
              <text v-else>{{ block.name.slice(0, 1) }}</text>
            </view>
            <view>
              <text class="profile-name">{{ block.name }}</text>
              <text class="muted">{{ block.desc }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'stats'" class="stats-card">
            <view v-for="item in block.items" :key="item[1]" class="stat-item">
              <text class="stat-number">{{ item[0] }}</text>
              <text class="muted">{{ item[1] }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'menu'" class="card">
            <text v-if="block.title" class="card-title">{{ block.title }}</text>
            <view v-for="item in block.items" :key="item[0]" class="menu-row" @tap="go(item[1])">
              <text>{{ item[0] }}</text>
              <text class="chevron">›</text>
            </view>
          </view>

          <view v-else-if="block.type === 'login'" class="login-card">
            <view class="avatar avatar--large">商</view>
            <text class="result-title">{{ authMode === 'login' ? '账号登录' : '注册账号' }}</text>
            <view class="form-stack form-stack--wide">
              <input v-model.trim="authForm.username" class="form-input" placeholder="用户名" />
              <input v-model="authForm.password" class="form-input" password placeholder="密码" />
              <input v-if="authMode === 'register'" v-model.trim="authForm.nickname" class="form-input" placeholder="昵称" />
            </view>
            <view class="button button--primary button--wide" :class="{ disabled: working }" @tap="submitAuth">
              {{ working ? '提交中...' : (authMode === 'login' ? '登录' : '注册并登录') }}
            </view>
            <view class="text-action" @tap="toggleAuthMode">
              {{ authMode === 'login' ? '没有账号？立即注册' : '已有账号？返回登录' }}
            </view>
          </view>

          <view v-else-if="block.type === 'avatar'" class="avatar-card">
            <view class="avatar avatar--large">
              <image v-if="block.image" class="media-image media-image--round" :src="block.image" mode="aspectFill" />
              <text v-else>用</text>
            </view>
          </view>

          <view v-else-if="block.type === 'profileForm'" class="card form-stack">
            <input v-model.trim="profileForm.nickname" class="form-input" placeholder="昵称" />
            <input v-model.trim="profileForm.avatar" class="form-input" placeholder="头像 URL" />
            <input v-model.trim="profileForm.mobile" class="form-input" type="number" placeholder="手机号" />
            <input v-model.trim="profileForm.gender" class="form-input" placeholder="性别" />
            <input v-model.trim="profileForm.birthday" class="form-input" placeholder="生日，例如 1995-01-01" />
            <textarea v-model.trim="profileForm.bio" class="form-textarea" placeholder="个人简介" />
          </view>

          <view v-else-if="block.type === 'fields'" class="card">
            <view v-for="item in block.items" :key="item[0]" class="field-row">
              <text class="field-label">{{ item[0] }}</text>
              <text class="field-value">{{ item[1] }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'addresses'" class="list">
            <view v-for="item in block.items" :key="item.id || item[2]" class="address-card address-card--plain" @tap="selectAddress(item)">
              <view class="address-main">
                <text class="item-title">{{ item.title || item[0] }}</text>
                <text class="muted">{{ item.desc || item[1] }}</text>
                <view v-if="item.id" class="address-actions">
                  <text class="text-action text-action--inline" @tap.stop="editAddress(item)">编辑</text>
                  <text v-if="!item.isDefault" class="text-action text-action--inline" @tap.stop="setDefaultAddress(item)">设为默认</text>
                  <text class="text-action text-action--inline text-action--danger" @tap.stop="deleteAddress(item)">删除</text>
                </view>
              </view>
              <text class="tag">{{ item.tag || item[2] }}</text>
            </view>
          </view>

          <view v-else-if="block.type === 'addressForm'" class="card form-stack">
            <text class="card-title">{{ editingAddressId ? '编辑收货地址' : '新增收货地址' }}</text>
            <input v-model.trim="addressForm.receiver_name" class="form-input" placeholder="收货人" />
            <input v-model.trim="addressForm.receiver_phone" class="form-input" type="number" placeholder="手机号" />
            <input v-model.trim="addressForm.province" class="form-input" placeholder="省份" />
            <input v-model.trim="addressForm.city" class="form-input" placeholder="城市" />
            <input v-model.trim="addressForm.district" class="form-input" placeholder="区县" />
            <input v-model.trim="addressForm.detail" class="form-input" placeholder="详细地址" />
            <view class="switch-row">
              <text>设为默认地址</text>
              <switch :checked="addressForm.is_default" color="#e5484d" @change="addressForm.is_default = $event.detail.value" />
            </view>
            <view class="button button--primary button--wide" :class="{ disabled: working }" @tap="saveAddress">保存地址</view>
            <view v-if="editingAddressId" class="text-action centered" @tap="cancelAddressEdit">取消编辑</view>
          </view>

          <view v-else-if="block.type === 'coupons'" class="list">
            <view v-for="item in block.items" :key="item.id" class="coupon-card">
              <view>
                <text class="coupon-title">{{ item.title }}</text>
                <text class="state-desc">{{ item.desc }}</text>
                <text class="muted">{{ item.status }}</text>
              </view>
              <view v-if="item.action" class="button button--primary button--small" @tap="runAction({ action: item.action, couponId: item.id })">领取</view>
            </view>
          </view>

          <view v-else-if="block.type === 'favoriteProducts'" class="list">
            <view v-for="item in block.items" :key="item.id" class="favorite-card" @tap="go(item.target)">
              <view class="thumb">
                <image v-if="item.image" class="media-image" :src="item.image" mode="aspectFill" />
              </view>
              <view class="favorite-card__main">
                <text class="item-title">{{ item.name }}</text>
                <text class="product-price">{{ item.price }}</text>
              </view>
              <view class="button button--ghost button--small" @tap.stop="runAction({ action: 'removeFavorite', productId: item.id })">取消收藏</view>
            </view>
          </view>

          <view v-else-if="block.type === 'messages'" class="list">
            <view v-for="item in block.items" :key="item[0]" class="message-row">
              <view class="message-icon"></view>
              <view class="message-main">
                <text class="item-title">{{ item[0] }}</text>
                <text class="muted">{{ item[1] }}</text>
              </view>
              <view class="unread-dot"></view>
            </view>
          </view>

          <view v-else-if="block.type === 'empty'" class="empty-card">
            <view class="empty-illustration">⌕</view>
            <text class="result-title">{{ block.title }}</text>
            <text class="muted centered">{{ block.desc }}</text>
            <view class="action-row">
              <view class="button button--ghost" @tap="block.secondaryAction ? runAction({ action: block.secondaryAction }) : go(block.secondaryTarget)">{{ block.secondary }}</view>
              <view class="button button--primary" @tap="go(block.primaryTarget)">{{ block.primary }}</view>
            </view>
          </view>
        </block>
      </view>
    </scroll-view>

    <view v-if="page.bottom" class="bottom-bar">
      <view v-if="page.bottom.left || page.bottom.total" class="bottom-copy">
        <text v-if="page.bottom.left" class="bottom-left">{{ page.bottom.left }}</text>
        <text v-if="page.bottom.total" class="bottom-total">{{ page.bottom.total }}</text>
      </view>
      <view v-if="page.bottom.secondary" class="button button--ghost" @tap="runBottomAction(page.bottom.secondaryAction, page.bottom.secondaryTarget)">{{ page.bottom.secondary }}</view>
      <view class="button button--primary" :class="{ disabled: working || page.bottom.primaryDisabled }" @tap="runBottomAction(page.bottom.primaryAction, page.bottom.target)">{{ working ? '处理中...' : page.bottom.primary }}</view>
    </view>
  </view>
</template>

<script>
import { isBrowserH5 } from '@/api/client.js'
import {
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
} from '@/api/mallApi.js'
import {
  createAddressPage,
  createAfterSaleApplyPage,
  createAfterSaleDetailPage,
  createAfterSaleListPage,
  createCartPage,
  createCatalogPage,
  createCheckoutPage,
  createCouponsPage,
  createDetailPage,
  createFavoritesPage,
  createHomePage,
  getCartCheckoutAvailability,
  isUserCouponUsable,
  createLogisticsPage,
  createMinePage,
  createOrderDetailPage,
  createOrdersPage,
  createPaymentResultPage,
  createProfilePage
} from '@/common/mallPageAdapters.js'
import { mallRuntime } from '@/common/mallRuntime.js'
import { mobilePages, pageRoutes, tabRoutes } from '@/common/mobilePages.js'
import { createTradeFromLatestPreview } from '@/common/orderFlow.js'

const copyStaticPage = (key) => JSON.parse(JSON.stringify(mobilePages[key] || mobilePages.home))
const dynamicPageKeys = [
  'home', 'category', 'list', 'detail', 'cart', 'checkout', 'orders', 'orderDetail',
  'logistics', 'afterSaleList', 'afterSaleApply', 'afterSaleDetail', 'mine', 'profile',
  'address', 'coupons', 'favorites', 'payResult'
]

export default {
  name: 'MobilePage',
  props: {
    pageKey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      page: copyStaticPage(this.pageKey),
      loading: false,
      working: false,
      errorMessage: '',
      hasLoaded: false,
      pageOptions: {},
      merchants: [],
      currentMerchant: null,
      merchantId: null,
      categories: [],
      categoriesMerchantId: 'unloaded',
      products: [],
      categoryId: null,
      searchKeyword: '',
      productDetail: null,
      selectedSkuId: null,
      productFavorite: false,
      cartItems: [],
      addresses: [],
      selectedAddressId: null,
      userCoupons: [],
      selectedCouponIds: {},
      orderPreview: null,
      currentTrade: null,
      orders: [],
      currentOrder: null,
      activeOrderStatus: 'all',
      payChannel: isBrowserH5 ? 'alipay' : '',
      couponMode: 'available',
      availableCoupons: [],
      myCoupons: [],
      favorites: [],
      afterSales: [],
      currentAfterSale: null,
      activeAfterSaleStatus: 'all',
      afterSaleForm: {
        type: 'refund_only',
        reason: '商品质量问题',
        description: ''
      },
      authMode: 'login',
      authForm: {
        username: '',
        password: '',
        nickname: ''
      },
      profileForm: {
        nickname: '',
        avatar: '',
        mobile: '',
        gender: '',
        birthday: '',
        bio: ''
      },
      addressForm: {
        receiver_name: '',
        receiver_phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        is_default: false
      },
      editingAddressId: null
    }
  },
  created() {
    this.pageOptions = this.getPageOptions()
    if (this.page && this.page.title) {
      uni.setNavigationBarTitle({ title: this.page.title })
    }
    this.dataChangeHandler = (scope) => this.handleDataChange(scope)
    this.appShowHandler = () => this.handleAppShow()
    uni.$on('mall:data-changed', this.dataChangeHandler)
    uni.$on('mall:app-show', this.appShowHandler)
    this.refresh()
  },
  beforeDestroy() {
    this.removeDataListener()
  },
  beforeUnmount() {
    this.removeDataListener()
  },
  methods: {
    getPageOptions() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      const current = pages.length ? pages[pages.length - 1] : null
      return (current && (current.options || (current.$page && current.$page.options))) || {}
    },
    removeDataListener() {
      if (this.dataChangeHandler) {
        uni.$off('mall:data-changed', this.dataChangeHandler)
        this.dataChangeHandler = null
      }
      if (this.appShowHandler) {
        uni.$off('mall:app-show', this.appShowHandler)
        this.appShowHandler = null
      }
    },
    handleAppShow() {
      if (!this.hasLoaded || this.loading || this.working) return
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      const current = pages.length ? pages[pages.length - 1] : null
      const currentRoute = current && (current.route || (current.$page && current.$page.route))
      const expectedRoute = (pageRoutes[this.pageKey] || '').replace(/^\//, '')
      if (currentRoute === expectedRoute) this.refresh()
    },
    handleDataChange(scope) {
      if (this.working) return
      const affected = {
        auth: ['cart', 'checkout', 'orders', 'mine', 'profile', 'address', 'coupons', 'favorites', 'afterSaleList'],
        cart: ['cart', 'checkout'],
        address: ['address', 'checkout'],
        order: ['orders', 'orderDetail', 'mine', 'payResult'],
        payment: ['orders', 'orderDetail', 'payResult'],
        coupon: ['coupons', 'checkout'],
        favorite: ['detail', 'favorites'],
        afterSale: ['afterSaleList', 'afterSaleDetail', 'mine']
      }
      if ((affected[scope] || []).indexOf(this.pageKey) >= 0) {
        this.refresh()
      }
    },
    optionLabel(item) {
      return item && typeof item === 'object' ? item.label : item
    },
    optionValue(item) {
      return item && typeof item === 'object' ? item.value : item
    },
    apiErrorMessage(error) {
      return error && error.message ? error.message : '请求失败，请稍后重试'
    },
    notify(title, icon = 'none') {
      uni.showToast({ title, icon, duration: 1800 })
    },
    isLoggedIn() {
      const auth = authApi.storage.read()
      return Boolean(auth && auth.access_token)
    },
    setLoginRequired(title) {
      this.page = {
        title,
        blocks: [{
          type: 'state',
          title: '请先登录',
          desc: '登录后可同步购物车、收货地址和订单。',
          action: '去登录',
          target: 'login'
        }]
      }
    },
    ensureLoggedIn() {
      if (this.isLoggedIn()) return true
      this.notify('请先登录后继续操作')
      this.go('login')
      return false
    },
    async refresh() {
      if (this.loading) return
      this.loading = true
      this.errorMessage = ''
      if (!this.hasLoaded && dynamicPageKeys.indexOf(this.pageKey) >= 0) {
        this.page = { ...copyStaticPage(this.pageKey), blocks: [] }
      }

      try {
        if (this.pageKey === 'home') await this.loadHome()
        else if (this.pageKey === 'category' || this.pageKey === 'list') await this.loadCatalog()
        else if (this.pageKey === 'detail') await this.loadProductDetail()
        else if (this.pageKey === 'cart') await this.loadCart()
        else if (this.pageKey === 'checkout') await this.loadCheckout()
        else if (this.pageKey === 'orders') await this.loadOrders()
        else if (this.pageKey === 'orderDetail') await this.loadOrderDetail()
        else if (this.pageKey === 'logistics') await this.loadLogistics()
        else if (this.pageKey === 'afterSaleList') await this.loadAfterSales()
        else if (this.pageKey === 'afterSaleApply') await this.loadAfterSaleApply()
        else if (this.pageKey === 'afterSaleDetail') await this.loadAfterSaleDetail()
        else if (this.pageKey === 'mine') await this.loadMine()
        else if (this.pageKey === 'profile') await this.loadProfile()
        else if (this.pageKey === 'address') await this.loadAddresses()
        else if (this.pageKey === 'coupons') await this.loadCoupons()
        else if (this.pageKey === 'favorites') await this.loadFavorites()
        else if (this.pageKey === 'payResult') await this.loadPaymentResult()
        else this.page = copyStaticPage(this.pageKey)
        this.hasLoaded = true
      } catch (error) {
        this.errorMessage = this.apiErrorMessage(error)
        if (!this.hasLoaded) {
          this.page = { ...copyStaticPage(this.pageKey), blocks: [] }
        }
      } finally {
        this.loading = false
      }
    },
    async loadHome() {
      const results = await Promise.all([
        merchantApi.list({ page: 1, pageSize: 20 }),
        catalogApi.categories(),
        catalogApi.products({ page: 1, pageSize: 20 })
      ])
      this.merchants = results[0].list
      this.categories = results[1]
      this.categoriesMerchantId = 0
      this.products = results[2].list
      this.page = createHomePage(this.categories, this.products, this.merchants)
    },
    async loadCatalog() {
      const optionMerchant = this.pageOptions.merchant_id || this.pageOptions.merchantId
      const numericMerchant = Number(optionMerchant)
      if (optionMerchant && this.merchantId === null && Number.isFinite(numericMerchant) && numericMerchant > 0) {
        this.merchantId = numericMerchant
      }
      const optionCategory = this.pageOptions.category_id || this.pageOptions.categoryId
      const numericCategory = Number(optionCategory)
      if (optionCategory && this.categoryId === null && Number.isFinite(numericCategory)) this.categoryId = numericCategory
      if (this.pageOptions.keyword && !this.searchKeyword) {
        try {
          this.searchKeyword = decodeURIComponent(this.pageOptions.keyword)
        } catch (error) {
          this.searchKeyword = String(this.pageOptions.keyword)
        }
      }

      const categoryMerchantId = this.merchantId || 0
      if (this.categoriesMerchantId !== categoryMerchantId) {
        if (this.merchantId) {
          const merchantResults = await Promise.all([
            merchantApi.detail(this.merchantId),
            merchantApi.categories(this.merchantId)
          ])
          this.currentMerchant = merchantResults[0]
          this.categories = merchantResults[1]
        } else {
          this.currentMerchant = null
          this.categories = await catalogApi.categories()
        }
        this.categoriesMerchantId = categoryMerchantId
      }
      const productParams = {
        page: 1,
        pageSize: 50,
        categoryId: this.categoryId,
        keyword: this.searchKeyword
      }
      const result = this.merchantId
        ? await merchantApi.products(this.merchantId, productParams)
        : await catalogApi.products(productParams)
      this.products = result.list
      this.page = createCatalogPage({
        categories: this.categories,
        products: result.list,
        categoryId: this.categoryId,
        keyword: this.searchKeyword,
        total: result.total,
        pageKey: this.pageKey,
        merchant: this.currentMerchant
      })
    },
    async loadProductDetail() {
      let productId = Number(this.pageOptions.id)
      if (!productId) {
        const result = await catalogApi.products({ page: 1, pageSize: 1 })
        productId = result.list[0] && result.list[0].id
      }
      if (!productId) {
        this.page = { title: '商品详情', blocks: [{ type: 'state', title: '商品不存在', desc: '请返回商品列表重新选择。' }] }
        return
      }
      this.productDetail = await catalogApi.productDetail(productId)
      const firstAvailable = this.productDetail.skus.find((item) => item.stock > 0) || this.productDetail.skus[0]
      if (!this.selectedSkuId) this.selectedSkuId = firstAvailable ? firstAvailable.id : null
      this.productFavorite = false
      if (this.isLoggedIn()) {
        try {
          const favoritePage = await favoriteApi.list({ page: 1, pageSize: 50 })
          this.productFavorite = favoritePage.list.some((item) => item.id === this.productDetail.id)
        } catch (error) {
          this.productFavorite = false
        }
      }
      this.page = createDetailPage(this.productDetail, this.selectedSkuId, this.productFavorite)
    },
    async loadCart() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('购物车')
        return
      }
      this.cartItems = await cartApi.items()
      this.page = createCartPage(this.cartItems)
    },
    async loadCheckout() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('确认订单')
        return
      }
      const allCartItems = await cartApi.items()
      const checkout = getCartCheckoutAvailability(allCartItems)
      if (!checkout.allowed) {
        this.cartItems = allCartItems
        this.orderPreview = null
        this.page = {
          title: '确认订单',
          blocks: [{
            type: 'state',
            title: '暂不能结算',
            desc: checkout.reason,
            action: '返回购物车',
            target: 'cart'
          }]
        }
        return
      }
      const results = await Promise.all([addressApi.list(), couponApi.mine(1)])
      this.cartItems = allCartItems.filter((item) => item.available !== false && item.quantity > 0)
      this.addresses = results[0]
      this.userCoupons = results[1]
      const runtime = mallRuntime.read()
      const selected = this.addresses.find((item) => item.id === Number(runtime.selectedAddressId))
        || this.addresses.find((item) => item.is_default)
        || this.addresses[0]
      this.selectedAddressId = selected ? selected.id : null
      if (selected && runtime.selectedAddressId !== selected.id) mallRuntime.patch({ selectedAddressId: selected.id })
      const storedCouponIds = runtime.selectedCouponIds && typeof runtime.selectedCouponIds === 'object'
        ? runtime.selectedCouponIds
        : {}
      const groupAmounts = this.cartItems.reduce((groups, item) => {
        const merchantId = Number(item.merchant_id) || 0
        groups[merchantId] = (groups[merchantId] || 0) + (Number(item.subtotal) || 0)
        return groups
      }, {})
      this.selectedCouponIds = {}
      checkout.merchantIds.forEach((merchantId) => {
        const couponId = Number(storedCouponIds[String(merchantId)]) || 0
        const coupon = this.userCoupons.find((item) => item.id === couponId)
        if (couponId > 0 && isUserCouponUsable(coupon, groupAmounts[merchantId] || 0, Date.now(), merchantId)) {
          this.selectedCouponIds[String(merchantId)] = couponId
        }
      })
      mallRuntime.patch({ selectedCouponId: 0, selectedCouponIds: this.selectedCouponIds })

      await this.refreshCheckoutPreview()
    },
    checkoutItemsPayload() {
      return this.cartItems.map((item) => ({ sku_id: item.sku_id, quantity: item.quantity }))
    },
    checkoutPaymentOptions() {
      return isBrowserH5 ? [{ label: '支付宝', value: 'alipay' }] : []
    },
    checkoutMerchantCoupons() {
      return Object.entries(this.selectedCouponIds)
        .map(([merchantId, userCouponId]) => ({
          merchant_id: Number(merchantId),
          user_coupon_id: Number(userCouponId)
        }))
        .filter((item) => item.merchant_id > 0 && item.user_coupon_id > 0)
        .sort((left, right) => left.merchant_id - right.merchant_id)
    },
    renderCheckout() {
      const selected = this.addresses.find((address) => address.id === Number(this.selectedAddressId))
      const paymentOptions = this.checkoutPaymentOptions()
      if (!paymentOptions.some((item) => item.value === this.payChannel)) {
        this.payChannel = paymentOptions.length ? paymentOptions[0].value : ''
      }
      this.page = createCheckoutPage({
        items: this.cartItems,
        address: selected,
        preview: this.orderPreview,
        payChannel: this.payChannel,
        paymentOptions,
        userCoupons: this.userCoupons,
        selectedCouponIds: this.selectedCouponIds
      })
    },
    async refreshCheckoutPreview() {
      this.orderPreview = null
      if (this.selectedAddressId && this.cartItems.length) {
        try {
          this.orderPreview = await tradeApi.preview({
            address_id: this.selectedAddressId,
            merchant_coupons: this.checkoutMerchantCoupons(),
            items: this.checkoutItemsPayload()
          })
        } catch (error) {
          this.errorMessage = this.apiErrorMessage(error)
        }
      }
      this.renderCheckout()
    },
    async loadOrders() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('我的订单')
        return
      }
      const result = await orderApi.list({
        page: 1,
        pageSize: 50,
        status: this.activeOrderStatus === 'all' ? undefined : this.activeOrderStatus
      })
      this.orders = result.list
      this.page = createOrdersPage(this.orders, this.activeOrderStatus)
    },
    async loadOrderDetail() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('订单详情')
        return
      }
      const orderId = Number(this.pageOptions.id)
      if (!orderId) {
        this.currentOrder = null
        this.page = { title: '订单详情', blocks: [{ type: 'state', title: '订单参数不完整', desc: '请从订单列表重新进入。' }] }
        return
      }
      this.currentOrder = await orderApi.detail(orderId)
      mallRuntime.patch({ lastOrder: this.currentOrder })
      this.page = createOrderDetailPage(this.currentOrder, isBrowserH5)
    },
    async loadLogistics() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('物流跟踪')
        return
      }
      const orderId = Number(this.pageOptions.id || this.pageOptions.order_id)
      if (!orderId) {
        this.page = { title: '物流跟踪', blocks: [{ type: 'state', title: '订单参数不完整', desc: '请从订单详情重新进入。' }] }
        return
      }
      const results = await Promise.all([orderApi.detail(orderId), orderApi.logistics(orderId)])
      this.currentOrder = results[0]
      this.page = createLogisticsPage(results[0], results[1])
    },
    async loadAfterSales() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('售后服务')
        return
      }
      const result = await afterSaleApi.list({
        page: 1,
        pageSize: 50,
        status: this.activeAfterSaleStatus === 'all' ? undefined : this.activeAfterSaleStatus
      })
      this.afterSales = result.list
      this.page = createAfterSaleListPage(result.list, this.activeAfterSaleStatus)
    },
    async loadAfterSaleApply() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('申请售后')
        return
      }
      const orderId = Number(this.pageOptions.order_id)
      const orderItemId = Number(this.pageOptions.order_item_id)
      if (!orderId || !orderItemId) {
        this.page = { title: '申请售后', blocks: [{ type: 'state', title: '商品参数不完整', desc: '请从订单详情选择需要售后的商品。' }] }
        return
      }
      const order = await orderApi.detail(orderId)
      const item = order.items.find((value) => value.id === orderItemId)
      if (!item) {
        this.page = { title: '申请售后', blocks: [{ type: 'state', title: '订单商品不存在', desc: '请返回订单详情重新选择。' }] }
        return
      }
      this.currentOrder = order
      this.page = createAfterSaleApplyPage(order, item)
    },
    async loadAfterSaleDetail() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('售后详情')
        return
      }
      const id = Number(this.pageOptions.id)
      if (!id) {
        this.page = { title: '售后详情', blocks: [{ type: 'state', title: '售后参数不完整', desc: '请从售后列表重新进入。' }] }
        return
      }
      this.currentAfterSale = await afterSaleApi.detail(id)
      this.page = createAfterSaleDetailPage(this.currentAfterSale)
    },
    async loadMine() {
      if (!this.isLoggedIn()) {
        const loginPage = copyStaticPage('login')
        loginPage.title = '我的'
        this.page = loginPage
        return
      }
      const results = await Promise.all([
        authApi.me(),
        orderApi.list({ page: 1, pageSize: 50 }),
        afterSaleApi.list({ page: 1, pageSize: 1 })
      ])
      const auth = authApi.storage.read()
      if (auth) authApi.storage.write({ ...auth, user: results[0] })
      this.page = createMinePage(results[0], results[1].list, results[2].total)
    },
    async loadProfile() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('个人资料')
        return
      }
      const user = await authApi.me()
      this.profileForm = {
        nickname: user.nickname || '',
        avatar: user.avatar || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
        bio: user.bio || ''
      }
      this.page = createProfilePage(user)
    },
    async loadAddresses() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('地址管理')
        return
      }
      this.addresses = await addressApi.list()
      this.page = createAddressPage(this.addresses)
    },
    async loadCoupons() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('优惠券')
        return
      }
      const results = await Promise.all([couponApi.available(), couponApi.mine()])
      this.availableCoupons = results[0]
      this.myCoupons = results[1]
      this.page = createCouponsPage({ available: results[0], mine: results[1], mode: this.couponMode })
    },
    async loadFavorites() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('收藏夹')
        return
      }
      const result = await favoriteApi.list({ page: 1, pageSize: 50 })
      this.favorites = result.list
      this.page = createFavoritesPage(result.list)
    },
    async loadPaymentResult() {
      if (!this.isLoggedIn()) {
        this.setLoginRequired('支付结果')
        return
      }
      const runtime = mallRuntime.read()
      const paymentNo = this.pageOptions.out_trade_no || this.pageOptions.payment_no || (runtime.currentPayment && runtime.currentPayment.payment_no)
      if (!paymentNo) {
        this.page = createPaymentResultPage(runtime.lastOrder, null, runtime.lastTrade)
        return
      }
      let payment = await paymentApi.detail(paymentNo)
      if (payment.status === 1 && payment.pay_channel === 'alipay') {
        try {
          payment = await paymentApi.sync(payment.payment_no)
        } catch (error) {
          this.errorMessage = this.apiErrorMessage(error)
        }
      }
      let trade = runtime.lastTrade
      let order = runtime.lastOrder
      if (Number(payment.trade_id) > 0) {
        if (!trade || Number(trade.id) !== Number(payment.trade_id)) trade = await tradeApi.detail(payment.trade_id)
        const tradeOrders = Array.isArray(trade.orders) ? trade.orders : []
        order = tradeOrders.find((item) => Number(item.id) === Number(order && order.id)) || tradeOrders[0] || null
      } else if (Number(payment.order_id) > 0 && (!order || Number(order.id) !== Number(payment.order_id))) {
        order = await orderApi.detail(payment.order_id)
      }
      this.currentTrade = trade || null
      mallRuntime.patch({ currentPayment: payment, lastTrade: trade || null, lastOrder: order || null })
      this.page = createPaymentResultPage(order, payment, trade)
    },
    async selectOption(block, item) {
      if (item && item.disabled) return
      const value = this.optionValue(item)
      if (block.action === 'category') {
        this.categoryId = value === 'all' ? null : Number(value)
        await this.runWithLoading(() => this.loadCatalog())
      } else if (block.action === 'sku') {
        this.selectedSkuId = Number(value)
        this.page = createDetailPage(this.productDetail, this.selectedSkuId, this.productFavorite)
      } else if (block.action === 'paymentChannel') {
        this.payChannel = value
        this.renderCheckout()
      } else if (block.action === 'checkoutCoupon') {
        const merchantId = Number(block.merchantId) || 0
        this.selectedCouponIds = {
          ...this.selectedCouponIds,
          [String(merchantId)]: Number(value) || 0
        }
        mallRuntime.patch({ selectedCouponIds: this.selectedCouponIds })
        await this.runWithLoading(() => this.refreshCheckoutPreview())
      } else if (block.action === 'orderStatus') {
        this.activeOrderStatus = value
        await this.runWithLoading(() => this.loadOrders())
      } else if (block.action === 'couponMode') {
        this.couponMode = value
        this.page = createCouponsPage({ available: this.availableCoupons, mine: this.myCoupons, mode: this.couponMode })
      } else if (block.action === 'afterSaleStatus') {
        this.activeAfterSaleStatus = value
        await this.runWithLoading(() => this.loadAfterSales())
      }
    },
    submitSearch() {
      const keyword = this.searchKeyword.trim()
      if (this.pageKey === 'list') {
        this.runWithLoading(() => this.loadCatalog())
      } else {
        this.go(`/pages/search/list?keyword=${encodeURIComponent(keyword)}`)
      }
    },
    toggleAuthMode() {
      this.authMode = this.authMode === 'login' ? 'register' : 'login'
      this.errorMessage = ''
    },
    async submitAuth() {
      if (this.working) return
      if (!this.authForm.username || !this.authForm.password) {
        this.notify('请输入用户名和密码')
        return
      }
      if (this.authMode === 'register' && !this.authForm.nickname) {
        this.notify('请输入昵称')
        return
      }

      this.working = true
      this.errorMessage = ''
      try {
        const auth = this.authMode === 'login'
          ? await authApi.login({ username: this.authForm.username, password: this.authForm.password })
          : await authApi.register({ username: this.authForm.username, password: this.authForm.password, nickname: this.authForm.nickname })
        authApi.storage.write(auth)
        mallRuntime.clear()
        uni.$emit('mall:data-changed', 'auth')
        this.notify(this.authMode === 'login' ? '登录成功' : '注册成功', 'success')
        uni.switchTab({ url: pageRoutes.mine })
      } catch (error) {
        this.errorMessage = this.apiErrorMessage(error)
      } finally {
        this.working = false
      }
    },
    async logout() {
      if (this.working) return
      this.working = true
      const auth = authApi.storage.read()
      try {
        if (auth && auth.refresh_token) await authApi.logout(auth.refresh_token)
      } catch (error) {
        // A local logout still succeeds when the remote session is already gone.
      } finally {
        authApi.storage.clear()
        mallRuntime.clear()
        uni.$emit('mall:data-changed', 'auth')
        this.working = false
        uni.switchTab({ url: pageRoutes.home })
      }
    },
    selectedSku() {
      return this.productDetail && this.productDetail.skus.find((item) => item.id === Number(this.selectedSkuId))
    },
    async addCurrentProduct() {
      if (!this.ensureLoggedIn()) return false
      const sku = this.selectedSku()
      if (!sku || sku.stock <= 0) {
        this.notify('当前规格暂无库存')
        return false
      }
      await cartApi.addItem(sku.id, 1)
      uni.$emit('mall:data-changed', 'cart')
      this.notify('已加入购物车', 'success')
      return true
    },
    async changeCart(item, quantity) {
      if (this.working) return
      await this.runWorking(async () => {
        if (quantity <= 0) await cartApi.deleteItem(item.id)
        else await cartApi.updateItem(item.id, quantity)
        await this.loadCart()
        uni.$emit('mall:data-changed', 'cart')
      })
    },
    async startCheckout() {
      if (!this.ensureLoggedIn()) return
      const checkout = getCartCheckoutAvailability(this.cartItems)
      if (!checkout.allowed) {
        this.notify(checkout.reason)
        return
      }
      this.go('checkout')
    },
    async startPayment(order, createdTrade = null) {
      if (!this.payChannel) {
        throw new Error('当前平台暂未开通支付方式')
      }
      if (!order) throw new Error('待支付订单不存在')
      let trade = createdTrade
      if (Number(order.trade_id) > 0) {
        const runtime = mallRuntime.read()
        if (!trade || Number(trade.id) !== Number(order.trade_id)) {
          trade = runtime.lastTrade && Number(runtime.lastTrade.id) === Number(order.trade_id)
            ? runtime.lastTrade
            : await tradeApi.detail(order.trade_id)
        }
        if (Number(trade.status) !== 1) throw new Error('当前交易不需要支付')
      }
      const paymentPayload = trade
        ? { trade_id: trade.id, pay_channel: this.payChannel, pay_scene: 'wap' }
        : { order_id: order.id, pay_channel: this.payChannel, pay_scene: 'wap' }
      const payment = await paymentApi.create(paymentPayload)
      mallRuntime.patch({ lastTrade: trade || null, lastOrder: order, currentPayment: payment })
      uni.$emit('mall:data-changed', 'payment')
      const payUrl = payment.pay_params && payment.pay_params.pay_url
      if (this.payChannel === 'alipay' && payUrl) {
        if (!isBrowserH5 || typeof window === 'undefined') {
          throw new Error('支付宝 H5 支付需要在浏览器中打开')
        }
        window.location.assign(payUrl)
        return payment
      }
      this.go(`/pages/payment/result?payment_no=${encodeURIComponent(payment.payment_no)}`)
      return payment
    },
    async submitOrder() {
      if (!this.ensureLoggedIn() || this.working) return
      if (!this.selectedAddressId) {
        this.notify('请先添加收货地址')
        return
      }
      if (!this.cartItems.length) {
        this.notify('购物车没有可结算商品')
        return
      }
      await this.runWorking(async () => {
        const items = this.checkoutItemsPayload()
        const trade = await createTradeFromLatestPreview({
          addressId: this.selectedAddressId,
          merchantCoupons: this.checkoutMerchantCoupons(),
          items,
          remark: '移动端下单',
          preview: (payload) => tradeApi.preview(payload),
          create: (payload) => tradeApi.create(payload)
        })
        const firstOrder = Array.isArray(trade.orders) ? trade.orders[0] : null
        this.currentTrade = trade
        mallRuntime.patch({ lastTrade: trade, lastOrder: firstOrder, currentPayment: null, selectedCouponIds: {} })
        uni.$emit('mall:data-changed', 'cart')
        uni.$emit('mall:data-changed', 'order')
        this.selectedCouponIds = {}
        this.notify(`交易已创建，共生成 ${trade.orders.length} 张商户订单`, 'success')
        if (isBrowserH5 && this.payChannel) {
          await this.startPayment(firstOrder, trade)
          return
        }
        if (trade.orders.length === 1) this.go(`/pages/order/detail?id=${firstOrder.id}`)
        else this.go('orders')
      })
    },
    async saveProfile() {
      if (!this.ensureLoggedIn()) return
      await this.runWorking(async () => {
        const user = await authApi.updateProfile({ ...this.profileForm })
        const auth = authApi.storage.read()
        if (auth) authApi.storage.write({ ...auth, user })
        uni.$emit('mall:data-changed', 'auth')
        this.notify('个人资料已保存', 'success')
        await this.loadProfile()
      })
    },
    validAddressForm() {
      const required = ['receiver_name', 'receiver_phone', 'province', 'city', 'district', 'detail']
      return required.every((key) => Boolean(this.addressForm[key]))
    },
    editAddress(item) {
      if (!item || !item.raw) return
      this.editingAddressId = item.id
      this.addressForm = {
        receiver_name: item.raw.receiver_name || '',
        receiver_phone: item.raw.receiver_phone || '',
        province: item.raw.province || '',
        city: item.raw.city || '',
        district: item.raw.district || '',
        detail: item.raw.detail || '',
        is_default: Boolean(item.raw.is_default)
      }
    },
    cancelAddressEdit() {
      this.editingAddressId = null
      this.addressForm = { receiver_name: '', receiver_phone: '', province: '', city: '', district: '', detail: '', is_default: false }
    },
    async saveAddress() {
      if (!this.validAddressForm()) {
        this.notify('请填写完整的收货地址')
        return
      }
      await this.runWorking(async () => {
        const saved = this.editingAddressId
          ? await addressApi.update(this.editingAddressId, { ...this.addressForm })
          : await addressApi.create({ ...this.addressForm })
        mallRuntime.patch({ selectedAddressId: saved.id })
        const wasEditing = Boolean(this.editingAddressId)
        this.cancelAddressEdit()
        uni.$emit('mall:data-changed', 'address')
        this.notify(wasEditing ? '地址已更新' : '地址已保存', 'success')
        await this.loadAddresses()
      })
    },
    async setDefaultAddress(item) {
      await this.runWorking(async () => {
        await addressApi.setDefault(item.id)
        mallRuntime.patch({ selectedAddressId: item.id })
        uni.$emit('mall:data-changed', 'address')
        await this.loadAddresses()
      })
    },
    async deleteAddress(item) {
      const confirmed = await new Promise((resolve) => {
        uni.showModal({
          title: '删除地址',
          content: '确认删除这个收货地址？',
          cancelText: '取消',
          confirmText: '确定',
          success: (result) => resolve(result.confirm),
          fail: () => resolve(false)
        })
      })
      if (!confirmed) return
      await this.runWorking(async () => {
        await addressApi.delete(item.id)
        const runtime = mallRuntime.read()
        if (runtime.selectedAddressId === item.id) mallRuntime.patch({ selectedAddressId: null })
        uni.$emit('mall:data-changed', 'address')
        await this.loadAddresses()
      })
    },
    selectAddress(item) {
      if (!item || !item.id) return
      mallRuntime.patch({ selectedAddressId: item.id })
      this.selectedAddressId = item.id
      uni.$emit('mall:data-changed', 'address')
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      const previous = pages.length > 1 ? pages[pages.length - 2] : null
      const route = previous && (previous.route || (previous.$page && previous.$page.fullPath) || '')
      if (String(route).indexOf('pages/checkout/index') >= 0) uni.navigateBack()
      else this.notify('已选择该地址', 'success')
    },
    async refreshPayment() {
      await this.runWithLoading(() => this.loadPaymentResult())
    },
    confirmDialog(title, content) {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          cancelText: '取消',
          confirmText: '确定',
          success: (result) => resolve(Boolean(result.confirm)),
          fail: () => resolve(false)
        })
      })
    },
    async addFavorite(productId) {
      if (!this.ensureLoggedIn()) return
      await this.runWorking(async () => {
        await favoriteApi.add(productId)
        this.productFavorite = true
        this.page = createDetailPage(this.productDetail, this.selectedSkuId, true)
        uni.$emit('mall:data-changed', 'favorite')
        this.notify('已收藏', 'success')
      })
    },
    async removeFavorite(productId) {
      await this.runWorking(async () => {
        await favoriteApi.delete(productId)
        this.productFavorite = false
        uni.$emit('mall:data-changed', 'favorite')
        if (this.pageKey === 'favorites') await this.loadFavorites()
        else this.page = createDetailPage(this.productDetail, this.selectedSkuId, false)
        this.notify('已取消收藏', 'success')
      })
    },
    async claimCoupon(couponId) {
      await this.runWorking(async () => {
        await couponApi.claim(couponId)
        uni.$emit('mall:data-changed', 'coupon')
        this.notify('领取成功', 'success')
        await this.loadCoupons()
      })
    },
    selectAfterSaleType(type) {
      this.afterSaleForm.type = type
    },
    selectAfterSaleReason(reason) {
      this.afterSaleForm.reason = reason
    },
    async submitAfterSale(order, orderItem) {
      if (!order || !orderItem || !this.afterSaleForm.reason.trim()) {
        this.notify('请选择售后原因')
        return
      }
      await this.runWorking(async () => {
        const result = await afterSaleApi.create({
          order_id: order.id,
          order_item_id: orderItem.id,
          type: this.afterSaleForm.type,
          reason: this.afterSaleForm.reason.trim(),
          description: this.afterSaleForm.description.trim(),
          images: []
        })
        uni.$emit('mall:data-changed', 'afterSale')
        this.notify('售后申请已提交', 'success')
        this.go(`/pages/after-sales/detail?id=${result.id}`)
      })
    },
    async cancelAfterSale(afterSale) {
      if (!afterSale || !(await this.confirmDialog('取消售后', '确认取消这笔售后申请？'))) return
      await this.runWorking(async () => {
        await afterSaleApi.cancel(afterSale.id)
        uni.$emit('mall:data-changed', 'afterSale')
        await this.loadAfterSaleDetail()
        this.notify('售后申请已取消', 'success')
      })
    },
    async cancelOrder(order) {
      if (!order || !(await this.confirmDialog('取消订单', '确认取消这笔待付款订单？'))) return
      await this.runWorking(async () => {
        if (Number(order.trade_id) > 0) await tradeApi.cancel(order.trade_id)
        else await orderApi.cancel(order.id)
        uni.$emit('mall:data-changed', 'order')
        await this.loadOrderDetail()
        this.notify('订单已取消', 'success')
      })
    },
    async confirmOrder(order) {
      if (!order || !(await this.confirmDialog('确认收货', '确认已经收到商品？'))) return
      await this.runWorking(async () => {
        await orderApi.confirm(order.id)
        uni.$emit('mall:data-changed', 'order')
        await this.loadOrderDetail()
        this.notify('已确认收货', 'success')
      })
    },
    async runAction(item) {
      if (!item) return
      if (item.action === 'refresh') await this.refresh()
      else if (item.action === 'logout') await this.logout()
      else if (item.action === 'saveProfile') await this.saveProfile()
      else if (item.action === 'refreshPayment') await this.refreshPayment()
      else if (item.action === 'payOrder') await this.runWorking(() => this.startPayment(item.order))
      else if (item.action === 'cancelOrder') await this.cancelOrder(item.order)
      else if (item.action === 'confirmOrder') await this.confirmOrder(item.order)
      else if (item.action === 'viewLogistics') this.go(`/pages/order/logistics?id=${item.order.id}`)
      else if (item.action === 'addFavorite') await this.addFavorite(item.productId)
      else if (item.action === 'removeFavorite') await this.removeFavorite(item.productId)
      else if (item.action === 'claimCoupon') await this.claimCoupon(item.couponId)
      else if (item.action === 'submitAfterSale') await this.submitAfterSale(item.order, item.orderItem)
      else if (item.action === 'cancelAfterSale') await this.cancelAfterSale(item.afterSale)
      else this.go(item.target)
    },
    async runBottomAction(action, target) {
      if (this.page.bottom && this.page.bottom.primaryDisabled && (action === 'buyNow' || action === 'checkout')) {
        this.notify(this.page.bottom.disabledReason || '当前暂不可操作')
        return
      }
      if (action === 'addCart') await this.runWorking(() => this.addCurrentProduct())
      else if (action === 'buyNow') {
        await this.runWorking(async () => {
          const added = await this.addCurrentProduct()
          if (added) this.go('checkout')
        })
      } else if (action === 'checkout') await this.startCheckout()
      else if (action === 'submitOrder') await this.submitOrder()
      else this.go(target)
    },
    async runWorking(callback) {
      if (this.working) return
      this.working = true
      this.errorMessage = ''
      try {
        return await callback()
      } catch (error) {
        this.errorMessage = this.apiErrorMessage(error)
        this.notify(this.errorMessage)
      } finally {
        this.working = false
      }
    },
    async runWithLoading(callback) {
      if (this.loading) return
      this.loading = true
      this.errorMessage = ''
      try {
        return await callback()
      } catch (error) {
        this.errorMessage = this.apiErrorMessage(error)
      } finally {
        this.loading = false
      }
    },
    go(target) {
      if (!target) return
      const url = pageRoutes[target] || target
      if (!url) return
      const path = url.split('?')[0]
      if (tabRoutes.indexOf(path) >= 0) {
        uni.switchTab({ url: path })
      } else {
        uni.navigateTo({ url })
      }
    }
  }
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: #f8fafc;
  color: #172033;
}

.page-scroll {
  height: 100vh;
}

.page-scroll--bottom {
  padding-bottom: calc(124rpx + var(--window-bottom));
}

.page-content {
  padding: 24rpx;
  box-sizing: border-box;
}

.search-box {
  height: 72rpx;
  border-radius: 36rpx;
  background: #ffffff;
  border: 1rpx solid #e4e7ec;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.search-icon {
  width: 40rpx;
  color: #98a2b3;
  font-size: 28rpx;
}

.search-text,
.muted,
.field-label,
.time-text {
  color: #687386;
  font-size: 24rpx;
  line-height: 36rpx;
}

.hero-card,
.state-card,
.coupon-card {
  border-radius: 28rpx;
  background: #fff1f0;
  padding: 36rpx;
  margin-bottom: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.hero-title,
.state-title,
.coupon-title {
  display: block;
  color: #e5484d;
  font-size: 48rpx;
  line-height: 60rpx;
  font-weight: 700;
}

.hero-desc,
.state-desc {
  display: block;
  margin-top: 16rpx;
  color: #172033;
  font-size: 26rpx;
}

.button {
  min-width: 150rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  box-sizing: border-box;
}

.button--primary {
  color: #ffffff;
  background: #e5484d;
}

.button--ghost {
  color: #172033;
  background: #ffffff;
  border: 1rpx solid #e4e7ec;
}

.button--small {
  min-width: 132rpx;
  height: 60rpx;
  font-size: 24rpx;
}

.button--wide {
  width: 100%;
  margin-top: 24rpx;
}

.icon-grid {
  display: flex;
  justify-content: space-between;
  margin: 10rpx 0 44rpx;
}

.icon-item,
.stat-item,
.sub-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #172033;
  font-size: 24rpx;
}

.round-icon,
.message-icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 42rpx;
  background: #f0f3f8;
  color: #e5484d;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  font-weight: 700;
}

.section-title,
.card-title {
  display: block;
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 700;
  margin: 4rpx 0 24rpx;
}

.section-title--compact {
  margin-top: 0;
}

.merchant-section {
  margin-bottom: 36rpx;
}

.merchant-scroll {
  width: 100%;
  white-space: nowrap;
}

.merchant-row-list {
  display: inline-flex;
  gap: 16rpx;
  padding-right: 24rpx;
}

.merchant-tile {
  width: 280rpx;
  min-height: 116rpx;
  padding: 20rpx;
  border: 1rpx solid #e4e7ec;
  border-radius: 16rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.merchant-logo {
  width: 64rpx;
  height: 64rpx;
  flex: 0 0 64rpx;
  border-radius: 14rpx;
  overflow: hidden;
  background: #eef4ff;
  color: #315ea8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
}

.merchant-logo--small {
  width: 56rpx;
  height: 56rpx;
  flex-basis: 56rpx;
  border-radius: 12rpx;
}

.merchant-name {
  margin-left: 16rpx;
  color: #172033;
  font-size: 26rpx;
  line-height: 34rpx;
  white-space: normal;
  overflow-wrap: anywhere;
}

.merchant-banner,
.cart-merchant {
  min-height: 88rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #e4e7ec;
  border-radius: 16rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.merchant-banner__copy {
  min-width: 0;
  flex: 1;
  margin-left: 18rpx;
}

.merchant-banner__arrow {
  margin-left: auto;
  color: #98a2b3;
  font-size: 40rpx;
  line-height: 48rpx;
}

.cart-merchant .item-title {
  min-width: 0;
  margin-left: 18rpx;
  overflow-wrap: anywhere;
}

.card-title--spaced {
  margin-top: 24rpx;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-card {
  width: 334rpx;
  min-height: 380rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  border: 1rpx solid #e4e7ec;
  box-sizing: border-box;
}

.product-image,
.detail-image,
.sub-image {
  height: 210rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #fbe5e6, #eef4ff);
  color: #e5484d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 20rpx;
}

.product-name,
.item-title,
.profile-name {
  display: block;
  color: #172033;
  font-size: 28rpx;
  line-height: 38rpx;
  font-weight: 600;
}

.product-merchant {
  display: block;
  min-height: 32rpx;
  margin-top: 6rpx;
  color: #687386;
  font-size: 22rpx;
  line-height: 32rpx;
  overflow-wrap: anywhere;
}

.product-price,
.detail-price,
.item-price,
.bottom-total,
.stat-number {
  display: block;
  color: #e5484d;
  font-size: 32rpx;
  line-height: 42rpx;
  font-weight: 700;
}

.category-panel {
  display: flex;
  min-height: 760rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  border: 1rpx solid #e4e7ec;
}

.category-side {
  width: 172rpx;
  background: #f0f3f8;
}

.category-tab {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.category-tab.active {
  color: #e5484d;
  background: #ffffff;
  font-weight: 700;
}

.category-main {
  flex: 1;
  padding: 28rpx;
  box-sizing: border-box;
}

.sub-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.sub-item {
  width: 210rpx;
  margin-bottom: 36rpx;
}

.sub-image {
  width: 160rpx;
  height: 140rpx;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 24rpx;
}

.chips--inside {
  margin: 18rpx 0 0;
}

.chip {
  min-width: 132rpx;
  height: 56rpx;
  padding: 0 22rpx;
  margin: 0 16rpx 16rpx 0;
  border-radius: 28rpx;
  background: #f0f3f8;
  color: #172033;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.chip.active {
  color: #ffffff;
  background: #e5484d;
}

.detail-block {
  overflow: hidden;
  border-radius: 0 0 28rpx 28rpx;
  background: #ffffff;
  margin: -24rpx -24rpx 24rpx;
}

.detail-image {
  height: 560rpx;
  border-radius: 0;
  margin-bottom: 0;
  font-size: 48rpx;
}

.detail-info {
  padding: 32rpx 24rpx 36rpx;
}

.detail-title {
  display: block;
  font-size: 38rpx;
  line-height: 50rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.detail-price {
  font-size: 52rpx;
  line-height: 64rpx;
  margin-bottom: 14rpx;
}

.card,
.cart-card,
.address-card,
.summary-card,
.order-card,
.message-row,
.stats-card,
.profile-card,
.login-card,
.avatar-card,
.empty-card {
  background: #ffffff;
  border: 1rpx solid #e4e7ec;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.cart-card,
.summary-card,
.message-row,
.profile-card {
  display: flex;
  align-items: center;
}

.thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #fbe5e6, #eef4ff);
  flex: 0 0 auto;
}

.thumb--small {
  width: 96rpx;
  height: 96rpx;
}

.cart-info,
.summary-info,
.message-main {
  flex: 1;
  margin-left: 24rpx;
}

.counter {
  color: #172033;
  font-size: 26rpx;
  font-weight: 600;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff1f0;
}

.address-card--plain {
  background: #ffffff;
}

.tag {
  min-width: 100rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 24rpx;
  color: #687386;
  background: #f0f3f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  box-sizing: border-box;
}

.tag--hot {
  color: #ffffff;
  background: #e5484d;
}

.goods-row,
.field-row,
.menu-row,
.step-row,
.order-head,
.order-body,
.action-row {
  display: flex;
  align-items: center;
}

.goods-row {
  margin-top: 24rpx;
}

.goods-info,
.timeline-info {
  flex: 1;
  margin-left: 20rpx;
}

.result-card,
.login-card,
.avatar-card,
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72rpx 36rpx;
}

.success-icon,
.empty-illustration,
.avatar {
  width: 132rpx;
  height: 132rpx;
  border-radius: 66rpx;
  background: #fff1f0;
  color: #e5484d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  font-weight: 700;
  margin-bottom: 28rpx;
}

.success-icon--pending {
  background: #fff8e6;
  color: #b54708;
}

.success-icon--failed {
  background: #f2f4f7;
  color: #475467;
}

.favorite-card {
  display: flex;
  align-items: center;
  min-height: 156rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #e4e7ec;
  border-radius: 16rpx;
  background: #ffffff;
}

.favorite-card__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  margin: 0 20rpx;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  margin: 0 24rpx 0 0;
  background: #ffffff;
}

.avatar--large {
  width: 136rpx;
  height: 136rpx;
  margin: 0 0 28rpx;
  background: #fff1f0;
}

.result-title {
  color: #172033;
  font-size: 42rpx;
  line-height: 56rpx;
  font-weight: 700;
  margin-bottom: 18rpx;
}

.centered {
  text-align: center;
}

.code-text {
  margin: 28rpx 0 36rpx;
  color: #172033;
  font-size: 26rpx;
}

.action-row {
  justify-content: center;
}

.action-row .button {
  margin: 0 10rpx;
}

.action-row--block {
  margin-bottom: 24rpx;
}

.state-card {
  align-items: flex-start;
}

.field-row,
.menu-row,
.step-row {
  min-height: 88rpx;
  justify-content: space-between;
  border-bottom: 1rpx solid #eef1f5;
}

.field-row:last-child,
.menu-row:last-child,
.step-row:last-child {
  border-bottom: 0;
}

.field-value,
.chevron {
  color: #172033;
  font-size: 26rpx;
  font-weight: 600;
}

.chevron {
  color: #98a2b3;
  font-size: 40rpx;
}

.timeline-row {
  display: flex;
  padding-top: 28rpx;
}

.timeline-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 12rpx;
  background: #d0d5dd;
  margin-top: 8rpx;
  flex: 0 0 auto;
}

.timeline-dot.active {
  background: #e5484d;
}

.red {
  color: #e5484d;
}

.time-text {
  display: block;
  color: #98a2b3;
  margin-top: 8rpx;
}

.form-group {
  margin-top: 24rpx;
}

.input-box,
.upload-box {
  height: 76rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  color: #98a2b3;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  margin-top: 18rpx;
  box-sizing: border-box;
}

.upload-box {
  width: 180rpx;
  height: 140rpx;
  justify-content: center;
}

.stats-card {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  width: 25%;
}

.profile-card {
  background: #fff1f0;
  min-height: 180rpx;
}

.profile-name {
  font-size: 36rpx;
  line-height: 48rpx;
  margin-bottom: 10rpx;
}

.message-row {
  position: relative;
}

.unread-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background: #e5484d;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--window-bottom);
  min-height: 112rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #e4e7ec;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
}

.bottom-copy {
  min-width: 0;
  flex: 1;
  margin-right: 20rpx;
}

.bottom-left {
  display: block;
  color: #687386;
  font-size: 21rpx;
  line-height: 28rpx;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.bottom-total {
  font-size: 29rpx;
  line-height: 38rpx;
}

.request-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 24rpx;
  border-radius: 12rpx;
  background: #eef4ff;
  color: #315ea8;
  font-size: 24rpx;
}

.request-state--error {
  background: #fff1f0;
  color: #b42318;
}

.request-state__action,
.text-action {
  color: #e5484d;
  font-size: 24rpx;
  font-weight: 600;
}

.search-input {
  flex: 1;
  height: 70rpx;
  color: #172033;
  font-size: 26rpx;
}

.media-image {
  display: block;
  width: 100%;
  height: 100%;
}

.media-image--round {
  border-radius: 50%;
}

.product-image,
.detail-image,
.thumb,
.avatar {
  overflow: hidden;
}

.chip.disabled,
.button.disabled {
  opacity: 0.45;
}

.cart-card--disabled {
  opacity: 0.55;
}

.counter {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.counter-button {
  width: 52rpx;
  height: 52rpx;
  border-radius: 8rpx;
  background: #f0f3f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.counter-value {
  min-width: 54rpx;
  text-align: center;
  font-size: 26rpx;
}

.form-stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.form-stack--wide {
  width: 100%;
  margin-top: 28rpx;
}

.form-input,
.form-textarea {
  width: 100%;
  min-height: 80rpx;
  padding: 0 24rpx;
  margin-bottom: 18rpx;
  border: 1rpx solid #d0d5dd;
  border-radius: 12rpx;
  background: #ffffff;
  color: #172033;
  font-size: 26rpx;
  box-sizing: border-box;
}

.form-textarea {
  height: 160rpx;
  padding-top: 20rpx;
}

.text-action {
  margin-top: 24rpx;
}

.text-action--inline {
  margin: 0 28rpx 0 0;
}

.text-action--danger {
  color: #b42318;
}

.address-main {
  flex: 1;
  min-width: 0;
  padding-right: 20rpx;
}

.address-actions {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.switch-row {
  min-height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 26rpx;
}
</style>
