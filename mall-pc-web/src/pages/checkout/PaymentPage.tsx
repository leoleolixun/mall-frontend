import type React from "react";
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, ShieldCheck, WalletCards } from "lucide-react";

import { moneyFromCent } from "@/api/client";
import type { OrderResponse, PayChannel, PaymentResponse, PayScene, TradeResponse } from "@/api/client";
import { paymentMethods } from "@/features/payment/constants/paymentMethods";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { SummaryRow } from "@/shared/components/SummaryRow";
import { formatPrice } from "@/shared/utils/money";

const channelIcon: Record<PayChannel, React.ReactNode> = {
  alipay: <WalletCards size={20} />
};

export const PaymentPage: React.FC<{
  order: OrderResponse | null;
  trade: TradeResponse | null;
  payment: PaymentResponse | null;
  onBackCheckout: () => void;
  onCheckPaymentStatus: () => Promise<void>;
  onCreatePayment: (channel: PayChannel, scene?: PayScene) => Promise<PaymentResponse | null>;
}> = ({ order, trade, payment, onBackCheckout, onCheckPaymentStatus, onCreatePayment }) => {
  const [selectedChannel, setSelectedChannel] = useState<PayChannel>("alipay");
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const creatingRef = useRef(false);
  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.channel === selectedChannel) ?? paymentMethods[0],
    [selectedChannel]
  );
  const activePaymentMethod = useMemo(
    () => payment ? paymentMethods.find((method) => method.channel === payment.pay_channel) ?? selectedMethod : selectedMethod,
    [payment, selectedMethod]
  );
  const payParams = payment?.pay_params;
  const payUrl = payParams?.pay_url;
  const isAlipayRedirect = payment?.pay_channel === "alipay" && Boolean(payUrl);
  const isTradePayment = Boolean(trade);
  const referenceNo = trade?.trade_no ?? order?.order_no ?? "-";
  const payableAmount = payment?.amount ?? trade?.payable_amount ?? order?.payable_amount ?? 0;

  const handleCreatePayment = async (): Promise<void> => {
    if (!selectedMethod.enabled || creatingRef.current) {
      return;
    }

    creatingRef.current = true;
    // Open the tab in the original click event so browsers do not block the
    // provider page after the asynchronous payment request completes.
    const paymentWindow = selectedMethod.scene === "page" ? window.open("about:blank", "_blank") : null;
    if (paymentWindow) {
      paymentWindow.opener = null;
    }

    setCreating(true);
    try {
      const createdPayment = await onCreatePayment(selectedChannel, selectedMethod.scene);
      const createdPayUrl = createdPayment?.pay_params?.pay_url;

      if (!createdPayUrl) {
        paymentWindow?.close();
        return;
      }

      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.location.replace(createdPayUrl);
        return;
      }

      window.location.assign(createdPayUrl);
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  const handlePaymentStatusCheck = async (): Promise<void> => {
    setCompleting(true);
    await onCheckPaymentStatus();
    setCompleting(false);
  };

  if (!trade && !order) {
    return (
      <section className="panel payment-empty">
        <HeroTitle title="交易支付" />
        <p>当前没有待支付交易，请先提交订单。</p>
        <button className="primary-button solid" onClick={onBackCheckout} type="button">返回确认订单</button>
      </section>
    );
  }

  return (
    <>
      <div className="title-row">
        <HeroTitle title={isTradePayment ? "交易支付" : "订单支付"} />
        <div className="steps">
          {["购物车", "确认订单", "支付", "完成"].map((item, index) => <Chip active={index === 2} key={item}>{item}</Chip>)}
        </div>
      </div>

      <div className="payment-layout">
        <section className="panel payment-method-panel">
          <div className="payment-section-title">
            <h2>选择支付方式</h2>
            <span>请选择当前可用的支付方式完成付款</span>
          </div>
          <div className="payment-method-grid">
            {paymentMethods.map((method) => (
              <button
                className={selectedChannel === method.channel ? "payment-method-card active" : "payment-method-card"}
                disabled={!method.enabled}
                key={method.channel}
                onClick={() => setSelectedChannel(method.channel)}
                type="button"
              >
                <span>{channelIcon[method.channel]}</span>
                <strong>{method.label}</strong>
                <em>{method.tag}</em>
                <p>{method.description}</p>
              </button>
            ))}
          </div>

          <div className="payment-request-panel">
            <div>
              <strong>确认支付</strong>
              <p>点击后将跳转至{selectedMethod.label}收银台，请核对右侧交易金额。</p>
            </div>
            <button className="primary-button solid" disabled={creating || !selectedMethod.enabled} onClick={() => void handleCreatePayment()} type="button">
              {creating ? "正在跳转" : "去支付"}
            </button>
          </div>

          {payment ? (
            <section className="payment-qr-panel">
              <div className="payment-qr-box">
                <ExternalLink size={72} />
                <span>支付宝网页支付</span>
              </div>
              <div>
                <h3>支付单已创建</h3>
                <p>支付单号：{payment.payment_no}</p>
                <p>支付场景：{payment.pay_scene}</p>
                <p>支付状态：{payment.status_text}</p>
                {isAlipayRedirect ? <p>支付宝收银台已打开，请在新页面完成付款。</p> : null}
                <button className="plain-button" disabled={completing} onClick={() => void handlePaymentStatusCheck()} type="button">
                  {completing ? "查询中" : "我已完成支付，查询状态"}
                </button>
              </div>
            </section>
          ) : null}
        </section>

        <aside className="panel payment-summary-panel">
          <div className="payment-safe">
            <ShieldCheck size={18} />
            <span>支付环境已加密</span>
          </div>
          <h2>{isTradePayment ? "交易摘要" : "订单摘要"}</h2>
          <SummaryRow label={isTradePayment ? "交易号" : "订单号"} value={referenceNo} />
          <SummaryRow label={isTradePayment ? "交易状态" : "订单状态"} value={trade?.status_text ?? order?.status_text ?? "-"} />
          {trade ? <SummaryRow label="商户订单" value={`${trade.orders.length} 张`} /> : null}
          <SummaryRow label="支付方式" value={activePaymentMethod.label} />
          {payment ? <SummaryRow label="支付单" value={payment.payment_no} /> : null}
          <strong>应付 {formatPrice(moneyFromCent(payableAmount))}</strong>
          <div className="payment-summary-note">
            <CheckCircle2 size={16} />
            <span>请在支付完成前不要关闭页面。</span>
          </div>
        </aside>
      </div>
    </>
  );
};

export default PaymentPage;
