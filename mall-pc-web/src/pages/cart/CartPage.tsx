import type React from "react";
import { useMemo } from "react";
import type { CartLine, Product } from "@/shared/types/domain";
import { products } from "@/data/mock";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductCard } from "@/shared/components/ProductCard";
import { CartTable } from "@/shared/components/CartTable";
import { SummaryRow } from "@/shared/components/SummaryRow";
import { formatPrice } from "@/shared/utils/money";

export const CartPage: React.FC<{
  lines: CartLine[];
  onQuantityChange: (id: string, quantity: number) => void;
  onCheckout: () => void;
  onContinue: () => void;
  onAdd: (product: Product) => void;
}> = ({ lines, onQuantityChange, onCheckout, onContinue, onAdd }) => {
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);
  const total = Math.max(0, subtotal - 30 - 10);

  return (
    <>
      <HeroTitle title="购物车" />
      <div className="cart-layout">
        <section className="panel cart-table-panel">
          <div className="panel-title-row">
            <h2>已选商品</h2>
            <span>共 {lines.length} 件商品</span>
          </div>
          <CartTable lines={lines} onQuantityChange={onQuantityChange} />
          <div className="promo-box">
            <strong>满减活动</strong>
            <span>已满足满 599 减 30，可叠加会员积分抵扣。</span>
          </div>
        </section>
        <aside className="panel summary-panel">
          <h2>结算明细</h2>
          <SummaryRow label="商品金额" value={formatPrice(subtotal)} />
          <SummaryRow label="运费" value="¥0" />
          <SummaryRow label="优惠券" value="-¥30" />
          <SummaryRow label="积分抵扣" value="-¥10" />
          <strong>合计 {formatPrice(total)}</strong>
          <button className="primary-button solid" onClick={onCheckout}>去结算</button>
          <button className="plain-button" onClick={onContinue}>继续购物</button>
        </aside>
      </div>
      <section className="panel recommend-panel">
        <h2>加购推荐</h2>
        <div className="recommend-row">
          {products.slice(1, 5).map((product) => <ProductCard compact key={product.id} product={product} onAdd={onAdd} />)}
        </div>
      </section>
    </>
  );
};

export default CartPage;

