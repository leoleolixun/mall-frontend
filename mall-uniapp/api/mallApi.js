import { authStorage, buildQuery, request } from './client.js'

export const catalogApi = {
  categories() {
    return request('/categories', { auth: false })
  },
  productDetail(productId) {
    return request(`/products/${productId}`, { auth: false })
  },
  products(params = {}) {
    return request(`/products${buildQuery({
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
  logout(refreshToken) {
    return request('/auth/logout', {
      method: 'POST',
      data: { refresh_token: refreshToken }
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
  preview(payload) {
    return request('/orders/preview', { method: 'POST', data: payload })
  },
  pay(orderId) {
    return request(`/orders/${orderId}/pay`, { method: 'POST' })
  }
}

export const paymentApi = {
  create(payload) {
    return request('/payments', { method: 'POST', data: payload })
  },
  detail(paymentNo) {
    return request(`/payments/${encodeURIComponent(paymentNo)}`)
  },
  mockComplete(paymentNo) {
    return request(`/payments/${encodeURIComponent(paymentNo)}/mock-complete`, { method: 'POST' })
  }
}
