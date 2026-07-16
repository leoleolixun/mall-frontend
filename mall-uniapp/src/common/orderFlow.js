export const createOrderFromLatestPreview = async ({
  addressId,
  userCouponId = 0,
  items,
  remark,
  preview,
  create
}) => {
  const request = {
    address_id: addressId,
    user_coupon_id: Number(userCouponId) || 0,
    items
  }
  const latestPreview = await preview(request)

  if (!latestPreview || !latestPreview.idempotency_token) {
    throw new Error('订单预览未返回幂等令牌')
  }

  return create({
    ...request,
    remark,
    idempotency_token: latestPreview.idempotency_token
  })
}

export const createTradeFromLatestPreview = async ({
  addressId,
  merchantCoupons = [],
  items,
  remark,
  preview,
  create
}) => {
  const request = {
    address_id: addressId,
    merchant_coupons: merchantCoupons
      .map((item) => ({
        merchant_id: Number(item.merchant_id),
        user_coupon_id: Number(item.user_coupon_id)
      }))
      .filter((item) => item.merchant_id > 0 && item.user_coupon_id > 0)
      .sort((left, right) => left.merchant_id - right.merchant_id),
    items
  }
  const latestPreview = await preview(request)

  if (!latestPreview || !latestPreview.idempotency_token) {
    throw new Error('交易预览未返回幂等令牌')
  }

  return create({
    ...request,
    remark,
    idempotency_token: latestPreview.idempotency_token
  })
}
