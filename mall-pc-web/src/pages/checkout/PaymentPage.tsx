import type React from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, QrCode, ShieldCheck, Smartphone, WalletCards } from "lucide-react";

import { moneyFromCent } from "@/api/client";
import type { OrderResponse, PayChannel, PaymentResponse, PayScene } from "@/api/client";
import { paymentMethods } from "@/features/payment/constants/paymentMethods";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { SummaryRow } from "@/shared/components/SummaryRow";
import { formatPrice } from "@/shared/utils/money";

const channelIcon: Record<PayChannel, React.ReactNode> = {
  alipay: <WalletCards size={20} />,
  mock: <CreditCard size={20} />,
  stripe: <CreditCard size={20} />,
  wechat: <Smartphone size={20} />
};

export const PaymentPage: React.FC<{
  order: OrderResponse | null;
  payment: PaymentResponse | null;
  onBackCheckout: () => void;
  onCheckPaymentStatus: () => Promise<void>;
  onCreatePayment: (channel: PayChannel, scene?: PayScene) => Promise<PaymentResponse | null>;
  onMockComplete: () => Promise<void>;
}> = ({ order, payment, onBackCheckout, onCheckPaymentStatus, onCreatePayment, onMockComplete }) => {
  const [selectedChannel, setSelectedChannel] = useState<PayChannel>("wechat");
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(false);
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
  const qrCodeUrl = payParams?.qr_code_url ?? payParams?.code_url;
  const isAlipayRedirect = payment?.pay_channel === "alipay" && Boolean(payUrl);

  const handleCreatePayment = async (): Promise<void> => {
    if (!selectedMethod.enabled) {
      return;
    }
    setCreating(true);
    await onCreatePayment(selectedChannel, selectedMethod.scene);
    setCreating(false);
  };

  const handlePaymentStatusCheck = async (): Promise<void> => {
    setCompleting(true);
    await onCheckPaymentStatus();
    setCompleting(false);
  };

  const handleMockComplete = async (): Promise<void> => {
    setCompleting(true);
    await onMockComplete();
    setCompleting(false);
  };

  const handleOpenPayUrl = (): void => {
    if (!payUrl) {
      return;
    }
    window.open(payUrl, "_blank", "noopener,noreferrer");
  };

  if (!order) {
    return (
      <section className="panel payment-empty">
        <HeroTitle title="订单支付" />
        <p>当前没有待支付订单，请先提交订单。</p>
        <button className="primary-button solid" onClick={onBackCheckout} type="button">返回确认订单</button>
      </section>
    );
  }

  return (
    <>
      <div className="title-row">
        <HeroTitle title="订单支付" />
        <div className="steps">
          {["购物车", "确认订单", "支付", "完成"].map((item, index) => <Chip active={index === 2} key={item}>{item}</Chip>)}
        </div>
      </div>

      <div className="payment-layout">
        <section className="panel payment-method-panel">
          <div className="payment-section-title">
            <h2>选择支付方式</h2>
            <span>后续新增 Stripe 只需扩展支付渠道配置</span>
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
              <strong>支付请求</strong>
              <p>
                点击后会调用后端 `POST /payments` 创建支付单，渠道参数为 `{selectedChannel}`
                {selectedMethod.scene ? `，支付场景为 ${selectedMethod.scene}` : ""}。
              </p>
            </div>
            <button className="primary-button solid" disabled={creating || !selectedMethod.enabled} onClick={() => void handleCreatePayment()} type="button">
              {creating ? "请求中" : `使用${selectedMethod.label}支付`}
            </button>
          </div>

          {payment ? (
            <section className="payment-qr-panel">
              <div className="payment-qr-box">
                <QrCode size={72} />
                <span>{payment.pay_channel === "wechat" ? "微信扫码支付" : payment.pay_channel === "alipay" ? "支付宝网页支付" : "支付二维码"}</span>
              </div>
              <div>
                <h3>支付单已创建</h3>
                <p>支付单号：{payment.payment_no}</p>
                <p>支付场景：{payment.pay_scene}</p>
                <p>支付状态：{payment.status_text}</p>
                {isAlipayRedirect ? <p>后端已返回支付宝网页支付链接，请打开支付宝收银台完成付款。</p> : null}
                {!isAlipayRedirect && qrCodeUrl ? <p>支付参数：{qrCodeUrl}</p> : null}
                {isAlipayRedirect ? (
                  <div className="payment-action-row">
                    <button className="primary-button solid" onClick={handleOpenPayUrl} type="button">打开支付宝付款</button>
                    <button className="plain-button" disabled={completing} onClick={() => void handlePaymentStatusCheck()} type="button">
                      {completing ? "查询中" : "我已完成支付，查询状态"}
                    </button>
                  </div>
                ) : (
                  <button className="plain-button" disabled={completing} onClick={() => void handleMockComplete()} type="button">
                    {completing ? "确认中" : "模拟已完成支付"}
                  </button>
                )}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="panel payment-summary-panel">
          <div className="payment-safe">
            <ShieldCheck size={18} />
            <span>支付环境已加密</span>
          </div>
          <h2>订单摘要</h2>
          <SummaryRow label="订单号" value={order.order_no} />
          <SummaryRow label="订单状态" value={order.status_text} />
          <SummaryRow label="支付方式" value={activePaymentMethod.label} />
          {payment ? <SummaryRow label="支付单" value={payment.payment_no} /> : null}
          <strong>应付 {formatPrice(moneyFromCent(payment?.amount ?? order.payable_amount))}</strong>
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
