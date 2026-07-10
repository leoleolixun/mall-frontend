import { useCallback, useEffect, useMemo, useState } from "react";

import type { PaymentResponse } from "@/api/client";
import { paymentApi } from "@/features/payment/api/paymentApi";

const AUTO_CHECK_LIMIT = 8;
const AUTO_CHECK_INTERVAL_MS = 2_000;

const resolvePaymentNo = (): string => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("out_trade_no")?.trim()
    || searchParams.get("payment_no")?.trim()
    || paymentApi.pendingStorage.read();
};

export interface PaymentResultState {
  checking: boolean;
  error: string;
  payment: PaymentResponse | null;
  retry: () => void;
}

export const usePaymentResult = (): PaymentResultState => {
  const paymentNo = useMemo(resolvePaymentNo, []);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [checking, setChecking] = useState(Boolean(paymentNo));
  const [error, setError] = useState(paymentNo ? "" : "未找到本次支付单号，请返回订单中心查看最新状态");
  const [retryToken, setRetryToken] = useState(0);

  const retry = useCallback((): void => {
    setRetryToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!paymentNo) {
      return;
    }

    let active = true;
    let timer: number | undefined;

    const check = async (attempt: number): Promise<void> => {
      setChecking(true);
      setError("");

      try {
        const latestPayment = await paymentApi.detail(paymentNo);
        if (!active) {
          return;
        }

        setPayment(latestPayment);
        if (latestPayment.status !== 1) {
          paymentApi.pendingStorage.clear(latestPayment.payment_no);
          return;
        }

        if (attempt + 1 < AUTO_CHECK_LIMIT) {
          timer = window.setTimeout(() => void check(attempt + 1), AUTO_CHECK_INTERVAL_MS);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "查询支付结果失败");
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    void check(0);
    return () => {
      active = false;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [paymentNo, retryToken]);

  return { checking, error, payment, retry };
};
