import type React from "react";
import { useMemo } from "react";
import { moneyFromCent } from "@/api/client";
import type { AddressResponse, OrderPreviewResponse } from "@/api/client";
import type { CartLine } from "@/shared/types/domain";
import { CartTable } from "@/shared/components/CartTable";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { SummaryRow } from "@/shared/components/SummaryRow";
import { formatPrice } from "@/shared/utils/money";

export const CheckoutPage: React.FC<{
  lines: CartLine[];
  addresses: AddressResponse[];
  selectedAddressId?: number;
  preview?: OrderPreviewResponse | null;
  onAddressSelect: (id: number) => void;
  onCreateDefaultAddress: () => void;
  onPay: () => void;
  onPickup: () => void;
}> = ({ lines, addresses, selectedAddressId, preview, onAddressSelect, onCreateDefaultAddress, onPay, onPickup }) => {
  const payable = useMemo(() => preview ? moneyFromCent(preview.payable_amount) : Math.max(0, lines.reduce((sum, line) => sum + line.price * line.quantity, 0)), [lines, preview]);

  return (
  <>
    <div className="title-row">
      <HeroTitle title="确认订单" />
      <div className="steps">
        {["购物车", "确认订单", "支付", "完成"].map((item, index) => <Chip active={index === 1} key={item}>{item}</Chip>)}
      </div>
    </div>
    <section className="panel address-panel">
      <h2>收货地址</h2>
      <div className="address-list">
        {addresses.map((address) => (
          <button className={selectedAddressId === address.id ? "address-card active" : "address-card"} key={address.id} onClick={() => onAddressSelect(address.id)}>
            <strong>{address.receiver_name} {address.receiver_phone}</strong>
            <span>{address.province}{address.city}{address.district}{address.detail}</span>
          </button>
        ))}
        <button className="address-card" onClick={onCreateDefaultAddress}>
          <strong>+ 新增收货地址</strong>
          <span>使用默认测试地址完成订单联调</span>
        </button>
      </div>
    </section>
    <div className="checkout-layout">
      <section className="panel">
        <h2>商品清单</h2>
        <CartTable lines={lines} />
      </section>
      <aside className="panel pay-panel">
        <h2>订单结算</h2>
        {preview ? (
          <>
            <SummaryRow label="商品金额" value={formatPrice(moneyFromCent(preview.goods_amount))} />
            <SummaryRow label="运费" value={formatPrice(moneyFromCent(preview.freight_amount))} />
            <SummaryRow label="优惠" value={`-${formatPrice(moneyFromCent(preview.discount_amount))}`} />
          </>
        ) : null}
        <strong>应付 {formatPrice(payable)}</strong>
        <button className="primary-button solid" onClick={onPay}>提交订单，去支付</button>
        <button className="plain-button" onClick={onPickup}>选择门店自提</button>
      </aside>
    </div>
  </>
  );
};

export default CheckoutPage;
