import { authStorage, buildQuery, request } from './client.js'

export const catalogApi = {
  categories(merchantId) {
    const path = merchantId ? `/merchants/${merchantId}/categories` : '/categories'
    return request(path, { auth: false })
  },
  productDetail(productId) {
    return request(`/products/${productId}`, { auth: false })
  },
  products(params = {}) {
    return request(`/products${buildQuery({
      page: params.page || 1,
      page_size: params.pageSize || 50,
      merchant_id: params.merchantId,
      category_id: params.categoryId,
      keyword: params.keyword && params.keyword.trim()
    })}`, { auth: false })
  }
}

export const merchantApi = {
  list(params = {}) {
    return request(`/merchants${buildQuery({
      page: params.page || 1,
      page_size: params.pageSize || 20
    })}`, { auth: false })
  },
  detail(merchantId) {
    return request(`/merchants/${merchantId}`, { auth: false })
  },
  categories(merchantId) {
    return request(`/merchants/${merchantId}/categories`, { auth: false })
  },
  products(merchantId, params = {}) {
    return request(`/merchants/${merchantId}/products${buildQuery({
      page: params.page || 1,
      page_size: params.pageSize || 50,
      category_id: params.categoryId,
      keyword: params.keyword && params.keyword.trim()
    })}`, { auth: false })
  }
}
export const cartApi = {
  addItem(skuId, quantity) {
    return request('/cart/items', {
      method: 'POST',
      data: { sku_id: skuId, quantity }
    })
  },
  deleteItem(skuId) {
    return request(`/cart/items/${skuId}`, { method: 'DELETE' })
  },
  items() {
    return request('/cart/items')
  },
  clear() {
    return request('/cart/items', { method: 'DELETE' })
  },
  updateItem(skuId, quantity) {
    return request(`/cart/items/${skuId}`, {
      method: 'PUT',
      data: { quantity }
    })
  }
}

export const authApi = {
  login(payload) {
    return request('/auth/login/password', {
      method: 'POST',
      data: payload,
      auth: false
    })
  },
  async logout(refreshToken) {
    try {
      return await request('/auth/logout', {
        method: 'POST',
        data: { refresh_token: refreshToken },
        refreshAuth: false
      })
    } catch (error) {
      if (!error || error.status !== 401 || !refreshToken) throw error
      const nextAuth = await request('/auth/refresh', {
        method: 'POST',
        data: { refresh_token: refreshToken },
        auth: false
      })
      authStorage.write(nextAuth)
      return request('/auth/logout', {
        method: 'POST',
        data: { refresh_token: nextAuth.refresh_token },
        refreshAuth: false
      })
    }
  },
  refresh(refreshToken) {
    return request('/auth/refresh', {
      method: 'POST',
      data: { refresh_token: refreshToken },
      auth: false
    })
  },
  me() {
    return request('/me')
  },
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      data: payload,
      auth: false
    })
  },
  updateProfile(payload) {
    return request('/me', {
      method: 'PUT',
      data: payload
    })
  },
  storage: authStorage
}

export const addressApi = {
  create(payload) {
    return request('/addresses', { method: 'POST', data: payload })
  },
  delete(id) {
    return request(`/addresses/${id}`, { method: 'DELETE' })
  },
  list() {
    return request('/addresses')
  },
  setDefault(id) {
    return request(`/addresses/${id}/default`, { method: 'PUT' })
  },
  update(id, payload) {
    return request(`/addresses/${id}`, { method: 'PUT', data: payload })
  }
}

export const orderApi = {
  create(payload) {
    return request('/orders', { method: 'POST', data: payload })
  },
  list(params = {}) {
    return request(`/orders${buildQuery({
      page: params.page || 1,
      page_size: params.pageSize || 20,
      status: params.status
    })}`)
  },
  detail(orderId) {
    return request(`/orders/${orderId}`)
  },
  cancel(orderId) {
    return request(`/orders/${orderId}/cancel`, { method: 'POST' })
  },
  confirm(orderId) {
    return request(`/orders/${orderId}/confirm`, { method: 'POST' })
  },
  logistics(orderId) {
    return request(`/orders/${orderId}/logistics`)
  },
  preview(payload) {
    return request('/orders/preview', { method: 'POST', data: payload })
  }
}

export const tradeApi = {
  preview(payload) {
    return request('/trades/preview', { method: 'POST', data: payload })
  },
  create(payload) {
    return request('/trades', { method: 'POST', data: payload })
  },
  list(params = {}) {
    return request(`/trades${buildQuery({
      page: params.page || 1,
      page_size: params.pageSize || 20,
      status: params.status
    })}`)
  },
  detail(tradeId) {
    return request(`/trades/${tradeId}`)
  },
  cancel(tradeId) {
    return request(`/trades/${tradeId}/cancel`, { method: 'POST' })
  }
}

export const paymentApi = {
  create(payload) {
    return request('/payments', { method: 'POST', data: payload })
  },
  detail(paymentNo) {
    return request(`/payments/${encodeURIComponent(paymentNo)}`)
  },
  sync(paymentNo) {
    return request(`/payments/${encodeURIComponent(paymentNo)}/sync`, { method: 'POST' })
  }
}

export const favoriteApi = {
  list(params = {}) {
    return request(`/favorites/products${buildQuery({
      page: params.page || 1,
      page_size: params.pageSize || 50
    })}`)
  },
  add(productId) {
    return request('/favorites/products', {
      method: 'POST',
      data: { product_id: productId }
    })
  },
  delete(productId) {
    return request(`/favorites/products/${productId}`, { method: 'DELETE' })
  }
}

export const couponApi = {
  available(merchantId) {
    return request(`/coupons${buildQuery({ merchant_id: merchantId })}`)
  },
  claim(couponId) {
    return request(`/coupons/${couponId}/claim`, { method: 'POST' })
  },
  mine(status) {
    return request(`/me/coupons${buildQuery({ status })}`)
  }
}

export const afterSaleApi = {
  create(payload) {
    return request('/after-sales', { method: 'POST', data: payload })
  },
  list(params = {}) {
    return request(`/after-sales${buildQuery({
      page: params.page || 1,
      page_size: params.pageSize || 50,
      status: params.status
    })}`)
  },
  detail(id) {
    return request(`/after-sales/${id}`)
  },
  cancel(id) {
    return request(`/after-sales/${id}/cancel`, { method: 'POST' })
  }
}
