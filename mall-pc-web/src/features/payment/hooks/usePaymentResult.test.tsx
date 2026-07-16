import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PaymentResponse } from "@/api/client";

const paymentMocks = vi.hoisted(() => ({
  detail: vi.fn(),
  sync: vi.fn(),
  clear: vi.fn(),
  read: vi.fn(() => "")
}));

vi.mock("@/features/payment/api/paymentApi", () => ({
  paymentApi: {
    detail: paymentMocks.detail,
    sync: paymentMocks.sync,
    pendingStorage: {
      clear: paymentMocks.clear,
      read: paymentMocks.read,
      write: vi.fn()
    }
  }
}));

import { usePaymentResult } from "./usePaymentResult";

const payment = (status: number): PaymentResponse => ({
  id: 1,
  payment_no: "P-TEST-1",
  order_id: 2,
  order_no: "O-TEST-1",
  user_id: 3,
  merchant_id: 1,
  pay_channel: "alipay",
  pay_scene: "page",
  status,
  status_text: status === 1 ? "待支付" : "已支付",
  amount: 29900,
  transaction_id: status === 2 ? "TRADE-1" : "",
  failure_reason: "",
  paid_at: status === 2 ? "2026-07-16T12:00:00+08:00" : null,
  closed_at: null
});

describe("usePaymentResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/payment/result?payment_no=P-TEST-1");
  });

  it("待支付的支付宝支付单会主动同步并清理本地标记", async () => {
    paymentMocks.detail.mockResolvedValue(payment(1));
    paymentMocks.sync.mockResolvedValue(payment(2));

    const { result } = renderHook(() => usePaymentResult());
    await waitFor(() => expect(result.current.payment?.status).toBe(2));

    expect(paymentMocks.detail).toHaveBeenCalledWith("P-TEST-1");
    expect(paymentMocks.sync).toHaveBeenCalledWith("P-TEST-1");
    expect(paymentMocks.clear).toHaveBeenCalledWith("P-TEST-1");
    expect(result.current.error).toBe("");
  });
});
