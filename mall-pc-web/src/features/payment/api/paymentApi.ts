import { request } from "@/api/client";
import type { PayChannel, PaymentResponse, PayScene } from "@/api/client";

export const paymentApi = {
  create(payload: { order_id: number; pay_channel: PayChannel; pay_scene?: PayScene }): Promise<PaymentResponse> {
    return request<PaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  detail(paymentNo: string): Promise<PaymentResponse> {
    return request<PaymentResponse>(`/payments/${paymentNo}`);
  },
  mockComplete(paymentNo: string): Promise<PaymentResponse> {
    return request<PaymentResponse>(`/payments/${paymentNo}/mock-complete`, {
      method: "POST"
    });
  }
};
