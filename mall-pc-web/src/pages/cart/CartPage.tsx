import type React from "react";
import { useMemo } from "react";
import type { CartLine } from "@/shared/types/domain";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { CartTable } from "@/shared/components/CartTable";
import { SummaryRow } from "@/shared/components/SummaryRow";
import { formatPrice } from "@/shared/utils/money";

export const CartPage: React.FC<{
  lines: CartLine[];
  onQuantityChange: (id: string, quantity: number) => Promise<void>;
  onCheckout: () => void;
  onContinue: () => void;
}> = ({ lines, onQuantityChange, onCheckout, onContinue }) => {
  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);
  const canCheckout = lines.length > 0 && lines.every((line) => line.available !== false);
  const merchantGroups = useMemo(() => {
    const groups = new Map<number, { id: number; name: string; lines: CartLine[] }>();
    lines.forEach((line) => {
      const merchantId = line.merchantId ?? 0;
      const group = groups.get(merchantId) ?? {
        id: merchantId,
        name: line.merchantName || `商户 ${merchantId}`,
        lines: []
      };
      group.lines.push(line);
      groups.set(merchantId, group);
    });
    return [...groups.values()].sort((left, right) => left.id - right.id);
  }, [lines]);

  return (
    <>
      <HeroTitle title="购物车" />
      <div className="cart-layout">
        <section className="panel cart-table-panel">
          <div className="panel-title-row">
            <h2>已选商品</h2>
            <span>共 {itemCount} 件</span>
          </div>
          <div className="cart-merchant-groups">
            {merchantGroups.map((group) => (
              <section className="cart-merchant-group" key={group.id}>
                <h3>{group.name}</h3>
                <CartTable lines={group.lines} onQuantityChange={onQuantityChange} />
              </section>
            ))}
          </div>
        </section>
        <aside className="panel summary-panel">
          <h2>结算明细</h2>
          <SummaryRow label="商品金额" value={formatPrice(subtotal)} />
          <SummaryRow label="优惠与运费" value="结算时计算" />
          <strong>商品小计 {formatPrice(subtotal)}</strong>
          {!canCheckout ? <p className="cart-checkout-error">请先删除或调整不可结算商品。</p> : null}
          <button className="primary-button solid" disabled={!canCheckout} onClick={onCheckout}>去结算</button>
          <button className="plain-button" onClick={onContinue}>继续购物</button>
        </aside>
      </div>
    </>
  );
};

export default CartPage;
