const RUNTIME_STORAGE_KEY = 'mall_uniapp_runtime'

const emptyRuntime = () => ({
  currentPayment: null,
  lastOrder: null,
  lastTrade: null,
  selectedAddressId: null,
  selectedCouponId: 0,
  selectedCouponIds: {}
})

const read = () => {
  try {
    const value = uni.getStorageSync(RUNTIME_STORAGE_KEY)
    if (!value) return emptyRuntime()
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return { ...emptyRuntime(), ...parsed }
  } catch (error) {
    return emptyRuntime()
  }
}
const write = (value) => {
  uni.setStorageSync(RUNTIME_STORAGE_KEY, value)
  return value
}

export const mallRuntime = {
  read,
  patch(partial) {
    return write({ ...read(), ...partial })
  },
  clear() {
    uni.removeStorageSync(RUNTIME_STORAGE_KEY)
  }
}
