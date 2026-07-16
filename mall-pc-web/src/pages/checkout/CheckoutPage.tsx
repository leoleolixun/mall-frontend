import type React from "react";
import { useEffect, useMemo } from "react";
import { moneyFromCent } from "@/api/client";
import type { AddressResponse, TradePreviewResponse, UserCouponResponse } from "@/api/client";
import type { CartLine } from "@/shared/types/domain";
import { CartTable } from "@/shared/components/CartTable";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { SummaryRow } from "@/shared/components/SummaryRow";
import { formatPrice } from "@/shared/utils/money";

export const CheckoutPage: React.FC<{
  lines: CartLine[];
  addresses: AddressResponse[];
  userCoupons: UserCouponResponse[];
  selectedAddressId?: number;
  selectedUserCouponIds: Record<number, number | undefined>;
  preview?: TradePreviewResponse | null;
  submitting: boolean;
  onAddressSelect: (id: number) => void;
  onCouponSelect: (merchantId: number, id?: number) => void;
  onManageAddresses: () => void;
  onPay: () => void;
}> = ({ lines, addresses, userCoupons, selectedAddressId, selectedUserCouponIds, preview, submitting, onAddressSelect, onCouponSelect, onManageAddresses, onPay }) => {
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);
  const groups = useMemo(() => {
    const values = new Map<number, { id: number; name: string; lines: CartLine[]; goodsAmount: number }>();
    lines.forEach((line) => {
      const merchantId = line.merchantId ?? 0;
      const group = values.get(merchantId) ?? {
        id: merchantId,
        name: line.merchantName || `商户 ${merchantId}`,
        lines: [],
        goodsAmount: 0
      };
      group.lines.push(line);
      group.goodsAmount += Math.round(line.price * line.quantity * 100);
      values.set(merchantId, group);
    });
    return [...values.values()].sort((left, right) => left.id - right.id);
  }, [lines]);
  const previewByMerchant = useMemo(() => new Map(
    (preview?.merchant_groups ?? []).map((group) => [group.merchant_id, group])
  ), [preview]);
  const payable = preview ? moneyFromCent(preview.payable_amount) : subtotal;
  const hasUnavailableItem = lines.some((line) => line.available === false);
  const canSubmit = Boolean(selectedAddressId && lines.length > 0 && preview && !hasUnavailableItem);

  useEffect(() => {
    groups.forEach((group) => {
      const selectedId = selectedUserCouponIds[group.id];
      if (!selectedId) return;
      const usable = userCoupons.some((item) => item.id === selectedId
        && item.status === 1
        && item.coupon.merchant_id === group.id
        && item.coupon.threshold_amount <= group.goodsAmount);
      if (!usable) onCouponSelect(group.id, undefined);
    });
  }, [groups, onCouponSelect, selectedUserCouponIds, userCoupons]);

  return (
    <>
      <div className="title-row">
        <HeroTitle title="确认订单" />
        <div className="steps">
          {["购物车", "确认交易", "商户订单"].map((item, index) => <Chip active={index === 1} key={item}>{item}</Chip>)}
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
          <button className="address-card address-card-action" onClick={onManageAddresses}>
            <strong>{addresses.length === 0 ? "+ 新增收货地址" : "管理收货地址"}</strong>
            <span>{addresses.length === 0 ? "填写真实收货信息后再提交订单" : "新增、编辑或设置默认地址"}</span>
          </button>
        </div>
      </section>
      <div className="checkout-layout">
        <section className="panel checkout-merchant-list">
          <h2>按商户结算</h2>
          {groups.map((group) => {
            const previewGroup = previewByMerchant.get(group.id);
            const eligibleCoupons = userCoupons.filter((item) => item.status === 1
              && item.coupon.merchant_id === group.id
              && item.coupon.threshold_amount <= group.goodsAmount);
            return (
              <section className="checkout-merchant-group" key={group.id}>
                <div className="checkout-merchant-heading">
                  <h3>{group.name}</h3>
                  <strong>{formatPrice(moneyFromCent(previewGroup?.payable_amount ?? group.goodsAmount))}</strong>
                </div>
                <CartTable lines={group.lines} />
                <label className="checkout-coupon-field">
                  <span>店铺优惠券</span>
                  <select
                    onChange={(event) => {
                      const id = Number(event.target.value);
                      onCouponSelect(group.id, id > 0 ? id : undefined);
                    }}
                    value={selectedUserCouponIds[group.id] ?? 0}
                  >
                    <option value={0}>{eligibleCoupons.length > 0 ? "不使用优惠券" : "暂无可用优惠券"}</option>
                    {eligibleCoupons.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.coupon.name}（减 {formatPrice(moneyFromCent(item.coupon.discount_amount))}）
                      </option>
                    ))}
                  </select>
                </label>
                {previewGroup ? (
                  <div className="checkout-merchant-amounts">
                    <span>商品 {formatPrice(moneyFromCent(previewGroup.goods_amount))}</span>
                    <span>运费 {formatPrice(moneyFromCent(previewGroup.freight_amount))}</span>
                    <span>优惠 -{formatPrice(moneyFromCent(previewGroup.discount_amount))}</span>
                  </div>
                ) : null}
              </section>
            );
          })}
        </section>
        <aside className="panel pay-panel">
          <h2>交易汇总</h2>
          {preview ? (
            <>
              <SummaryRow label="商品金额" value={formatPrice(moneyFromCent(preview.goods_amount))} />
              <SummaryRow label="运费" value={formatPrice(moneyFromCent(preview.freight_amount))} />
              <SummaryRow label="优惠" value={`-${formatPrice(moneyFromCent(preview.discount_amount))}`} />
            </>
          ) : (
            <>
              <SummaryRow label="商品金额" value={formatPrice(subtotal)} />
              <SummaryRow label="优惠与运费" value={selectedAddressId ? "正在核算" : "选择地址后核算"} />
            </>
          )}
          <strong>{preview ? "应付" : "商品小计"} {formatPrice(payable)}</strong>
          {!selectedAddressId ? <p className="checkout-hint">请先新增并选择收货地址。</p> : null}
          {hasUnavailableItem ? <p className="checkout-hint">请先返回购物车处理不可结算商品。</p> : null}
          <button className="primary-button solid" disabled={!canSubmit || submitting} onClick={onPay}>
            {submitting ? "正在提交交易" : "提交交易"}
          </button>
        </aside>
      </div>
    </>
  );
};

export default CheckoutPage;
