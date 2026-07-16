import { request } from "@/api/client";
import type { PayChannel, PaymentResponse, PayScene } from "@/api/client";

const PENDING_PAYMENT_STORAGE_KEY = "mall_pc_pending_payment_no";

type CreatePaymentTarget =
  | { order_id: number; trade_id?: never }
  | { order_id?: never; trade_id: number };

type CreatePaymentPayload = CreatePaymentTarget & {
  pay_channel: PayChannel;
  pay_scene?: PayScene;
};

export const paymentApi = {
  create(payload: CreatePaymentPayload): Promise<PaymentResponse> {
    return request<PaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  detail(paymentNo: string): Promise<PaymentResponse> {
    return request<PaymentResponse>(`/payments/${paymentNo}`);
  },
  sync(paymentNo: string): Promise<PaymentResponse> {
    return request<PaymentResponse>(`/payments/${paymentNo}/sync`, {
      method: "POST"
    });
  },
  pendingStorage: {
    read(): string {
      return window.localStorage.getItem(PENDING_PAYMENT_STORAGE_KEY)?.trim() ?? "";
    },
    write(paymentNo: string): void {
      window.localStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, paymentNo);
    },
    clear(paymentNo?: string): void {
      if (paymentNo && this.read() !== paymentNo) {
        return;
      }
      window.localStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
    }
  }
};
