import { request } from "@/api/client";
import type { LogisticsResponse, OrderPreviewResponse, OrderRequestItem, OrderResponse, PageResponse } from "@/api/client";

export const orderApi = {
  create(payload: { address_id: number; user_coupon_id?: number; remark: string; idempotency_token: string; items: OrderRequestItem[] }): Promise<OrderResponse> {
    return request<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  list(payload: { page?: number; pageSize?: number; status?: number } = {}): Promise<PageResponse<OrderResponse>> {
    const search = new URLSearchParams();
    search.set("page", String(payload.page ?? 1));
    search.set("page_size", String(payload.pageSize ?? 10));
    if (payload.status) {
      search.set("status", String(payload.status));
    }
    return request<PageResponse<OrderResponse>>(`/orders?${search.toString()}`);
  },
  detail(orderId: number): Promise<OrderResponse> {
    return request<OrderResponse>(`/orders/${orderId}`);
  },
  cancel(orderId: number): Promise<void> {
    return request<void>(`/orders/${orderId}/cancel`, {
      method: "POST"
    });
  },
  confirm(orderId: number): Promise<OrderResponse> {
    return request<OrderResponse>(`/orders/${orderId}/confirm`, {
      method: "POST"
    });
  },
  logistics(orderId: number): Promise<LogisticsResponse> {
    return request<LogisticsResponse>(`/orders/${orderId}/logistics`);
  },
  preview(payload: { address_id: number; user_coupon_id?: number; items: OrderRequestItem[] }): Promise<OrderPreviewResponse> {
    return request<OrderPreviewResponse>("/orders/preview", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
