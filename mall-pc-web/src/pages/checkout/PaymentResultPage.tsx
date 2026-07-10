import type React from "react";
import { CheckCircle2, Clock3, LoaderCircle, XCircle } from "lucide-react";

import { moneyFromCent } from "@/api/client";
import type { PaymentResponse } from "@/api/client";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { formatPrice } from "@/shared/utils/money";

interface PaymentResultPageProps {
  checking: boolean;
  error: string;
  failed?: boolean;
  payment: PaymentResponse | null;
  onContinueShopping: () => void;
  onRetry: () => void;
  onViewOrders: () => void;
}

export const PaymentResultPage: React.FC<PaymentResultPageProps> = ({
  checking,
  error,
  failed = false,
  payment,
  onContinueShopping,
  onRetry,
  onViewOrders
}) => {
  const isLoading = checking && !payment;
  const isSuccess = !failed && payment?.status === 2;
  const isPending = !failed && payment?.status === 1;
  const isFailure = failed || payment?.status === 3 || payment?.status === 4 || payment?.status === 5;
  const hasBlockingError = Boolean(error) && !payment;
  const canRetry = !isSuccess && !isFailure;

  const title = isLoading
    ? "正在确认支付结果"
    : isSuccess
      ? "支付成功"
      : isPending
        ? "支付结果确认中"
        : payment?.status === 3
          ? "支付已关闭"
          : payment?.status === 5
            ? "支付已退款"
            : isFailure
              ? "支付未完成"
              : "暂时无法确认支付结果";

  const description = isLoading
    ? "正在向服务器查询本次支付状态，请稍候。"
    : isSuccess
      ? `订单 ${payment.order_no} 已完成支付。`
      : isPending
        ? error || `订单 ${payment.order_no} 当前仍为待支付，系统会继续等待支付平台通知。`
        : error
          ? error
          : payment?.failure_reason || "支付未完成，请返回订单中心重新发起支付。";

  return (
    <>
      <HeroTitle title="支付结果" />
      <section
        aria-live="polite"
        className={isFailure || hasBlockingError ? "panel result-card failed" : isLoading || isPending ? "panel result-card pending" : "panel result-card"}
      >
        {isLoading ? <LoaderCircle className="result-loading-icon" size={72} /> : null}
        {!isLoading && isSuccess ? <CheckCircle2 size={72} /> : null}
        {!isLoading && isPending ? <Clock3 size={72} /> : null}
        {!isLoading && !isSuccess && !isPending ? <XCircle size={72} /> : null}
        <h2>{title}</h2>
        <p>{description}</p>
        {payment ? <p>支付单号：{payment.payment_no} · 状态：{payment.status_text}</p> : null}
        {payment ? <strong>支付金额 {formatPrice(moneyFromCent(payment.amount))}</strong> : null}
        <div>
          <button
            className="primary-button solid"
            disabled={checking && canRetry}
            onClick={canRetry ? onRetry : onViewOrders}
            type="button"
          >
            {canRetry ? checking ? "查询中" : "重新查询" : "查看订单"}
          </button>
          <button className="plain-button" onClick={isSuccess || isFailure ? onContinueShopping : onViewOrders} type="button">
            {isSuccess || isFailure ? "继续购物" : "查看订单"}
          </button>
        </div>
      </section>
      {isFailure ? (
        <section className="panel reason-panel">
          <h2>支付说明</h2>
          {[
            "支付失败或订单关闭后，系统不会扣减支付金额",
            "如已扣款但订单状态未更新，请稍后在订单中心重新查询",
            "重新支付前请确认订单仍处于待支付状态"
          ].map((item) => <p className="soft-row" key={item}>{item}</p>)}
        </section>
      ) : null}
    </>
  );
};

export default PaymentResultPage;
