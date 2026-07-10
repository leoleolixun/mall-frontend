import { request } from "@/api/client";
import type { OrderPreviewResponse, OrderRequestItem, OrderResponse, PageResponse } from "@/api/client";

export const orderApi = {
  create(payload: { address_id: number; remark: string; idempotency_token: string; items: OrderRequestItem[] }): Promise<OrderResponse> {
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
  preview(payload: { address_id: number; items: OrderRequestItem[] }): Promise<OrderPreviewResponse> {
    return request<OrderPreviewResponse>("/orders/preview", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  pay(orderId: number): Promise<OrderResponse> {
    return request<OrderResponse>(`/orders/${orderId}/pay`, {
      method: "POST"
    });
  }
};
