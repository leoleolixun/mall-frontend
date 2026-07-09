import { request } from "@/api/client";
import type { OrderPreviewResponse, OrderRequestItem, OrderResponse } from "@/api/client";

export const orderApi = {
  create(payload: { address_id: number; remark: string; idempotency_token: string; items: OrderRequestItem[] }): Promise<OrderResponse> {
    return request<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });
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
