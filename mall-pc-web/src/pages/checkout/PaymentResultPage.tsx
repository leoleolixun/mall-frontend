import type React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { moneyFromCent } from "@/api/client";
import type { OrderResponse } from "@/api/client";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { formatPrice } from "@/shared/utils/money";

export const PaymentResultPage: React.FC<{ failed?: boolean; order?: OrderResponse | null }> = ({ failed = false, order }) => (
  <>
    <HeroTitle title={failed ? "支付失败" : "支付结果"} />
    <section className={failed ? "panel result-card failed" : "panel result-card"}>
      {failed ? <XCircle size={72} /> : <CheckCircle2 size={72} />}
      <h2>{failed ? "支付未完成" : "支付成功"}</h2>
      <p>{failed ? "支付渠道返回失败，请重新支付或更换支付方式。" : `订单 ${order?.order_no ?? "已创建"} 已提交，当前状态：${order?.status_text ?? "待支付"}。`}</p>
      <strong>{failed ? "待支付 ¥714" : `应付 ${formatPrice(order ? moneyFromCent(order.payable_amount) : 0)}`}</strong>
      <div>
        <button className="primary-button solid">{failed ? "重新支付" : "查看订单"}</button>
        <button className="plain-button">{failed ? "更换支付方式" : "继续购物"}</button>
      </div>
    </section>
    {failed ? (
      <section className="panel reason-panel">
        <h2>可能原因</h2>
        {["余额不足或银行卡限额", "支付二维码已过期", "网络波动导致渠道超时", "订单超过支付有效期"].map((item) => <p className="soft-row" key={item}>{item}</p>)}
      </section>
    ) : null}
  </>
);

export default PaymentResultPage;

