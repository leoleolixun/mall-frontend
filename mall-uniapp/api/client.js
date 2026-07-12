export const SITE_ORIGIN = 'https://mall.leedu.ac.cn'
export const REMOTE_API_ORIGIN = `${SITE_ORIGIN}/api`
const isBrowserH5 = typeof window !== 'undefined' && typeof document !== 'undefined'

// H5 uses a same-origin /api proxy; mini programs and native runtimes call HTTPS directly.
export const API_ORIGIN = isBrowserH5 ? '/api' : REMOTE_API_ORIGIN
export const API_BASE = `${API_ORIGIN}/v1`

const AUTH_STORAGE_KEY = 'mall_uniapp_auth'
const REQUEST_TIMEOUT = 15000

const getUni = () => {
  if (typeof uni === 'undefined') {
    throw new Error('UniApp request runtime is unavailable')
  }
  return uni
}

export const moneyFromCent = (value) => Math.round(Number(value) || 0) / 100

export const formatMoney = (value) => {
  const amount = moneyFromCent(value)
  return `¥${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
}

export const normalizeAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  if (/^(https?:|data:|blob:)/i.test(value)) return value
  return `${SITE_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`
}

export const buildQuery = (params = {}) => {
  const entries = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)

  return entries.length ? `?${entries.join('&')}` : ''
}

export const authStorage = {
  read() {
    try {
      const value = getUni().getStorageSync(AUTH_STORAGE_KEY)
      if (!value) return null
      return typeof value === 'string' ? JSON.parse(value) : value
    } catch (error) {
      this.clear()
      return null
    }
  },
  write(auth) {
    getUni().setStorageSync(AUTH_STORAGE_KEY, auth)
  },
  clear() {
    try {
      getUni().removeStorageSync(AUTH_STORAGE_KEY)
    } catch (error) {
      // Storage cleanup should not block logout or an unauthorized response.
    }
  }
}

export class ApiError extends Error {
  constructor(message, status = 0, code = status, payload = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

const fallbackMessage = (status) => {
  if (status === 401) return '登录状态已失效，请重新登录'
  if (status === 403) return '暂无权限执行此操作'
  if (status === 404) return '请求的接口不存在'
  if (status >= 500) return `服务暂时不可用（HTTP ${status}）`
  return status ? `请求失败（HTTP ${status}）` : '网络连接失败，请稍后重试'
}

export const request = (path, options = {}) => {
  const runtime = getUni()
  const auth = authStorage.read()
  const header = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.header || {})
  }

  if (auth && auth.access_token && options.auth !== false) {
    header.Authorization = `Bearer ${auth.access_token}`
  }

  return new Promise((resolve, reject) => {
    runtime.request({
      url: `${API_BASE}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: options.timeout || REQUEST_TIMEOUT,
      success(response) {
        const status = Number(response.statusCode) || 0
        const payload = response.data
        const validPayload = payload && typeof payload === 'object'

        if (status >= 200 && status < 300 && validPayload && payload.code === 0) {
          resolve(payload.data)
          return
        }

        if (status === 401 && options.auth !== false) {
          authStorage.clear()
        }

        const message = validPayload && payload.message
          ? payload.message
          : fallbackMessage(status)
        const code = validPayload && Number.isFinite(Number(payload.code))
          ? Number(payload.code)
          : status

        reject(new ApiError(message, status, code, payload))
      },
      fail(error) {
        const message = error && error.errMsg && error.errMsg.indexOf('timeout') >= 0
          ? '请求超时，请检查网络后重试'
          : '网络连接失败，请稍后重试'
        reject(new ApiError(message, 0, 0, error || null))
      }
    })
  })
}
