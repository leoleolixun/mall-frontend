import { request } from "@/api/client";
import type { CouponResponse, UserCouponResponse } from "@/api/client";

export const couponApi = {
  available(merchantId?: number): Promise<CouponResponse[]> {
    const query = merchantId ? `?merchant_id=${merchantId}` : "";
    return request<CouponResponse[]>(`/coupons${query}`);
  },
  claim(id: number): Promise<UserCouponResponse> {
    return request<UserCouponResponse>(`/coupons/${id}/claim`, { method: "POST" });
  },
  mine(status?: number): Promise<UserCouponResponse[]> {
    const search = new URLSearchParams();
    if (status) {
      search.set("status", String(status));
    }
    const query = search.toString();
    return request<UserCouponResponse[]>(`/me/coupons${query ? `?${query}` : ""}`);
  }
};
