import type React from "react";
import { ShoppingCart } from "lucide-react";
import { bundleItems, products } from "@/data/mock";
import type { Product } from "@/shared/types/domain";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductVisual } from "@/shared/components/ProductVisual";

export const BundlePage: React.FC<{ onAdd: (product: Product) => void; onBuy: () => void }> = ({ onAdd, onBuy }) => (
  <>
    <HeroTitle title="组合套餐" />
    <div className="bundle-layout">
      <section className="panel bundle-builder">
        <h2>选择套餐商品</h2>
        <div className="bundle-grid">
          {bundleItems.map(([name, tag, price, selected]) => (
            <article className={selected ? "bundle-item selected" : "bundle-item"} key={name}>
              <ProductVisual compact />
              <div>
                <strong>{name}</strong>
                <span>{tag} · {price}</span>
              </div>
              <Chip active={selected}>{selected ? "已选" : "选择"}</Chip>
            </article>
          ))}
        </div>
      </section>
      <aside className="panel bundle-summary">
        <h2>套餐价</h2>
        <strong>¥386</strong>
        <p>单买价 ¥426 · 已优惠 ¥40</p>
        <h3>已选商品</h3>
        {["蓝牙耳机 Pro", "耳机保护套", "快充头", "收纳包"].map((item) => <span key={item}>{item}</span>)}
        <button className="primary-button" onClick={() => onAdd(products[1])}><ShoppingCart size={16} />加入购物车</button>
        <button className="plain-button" onClick={() => { onAdd(products[1]); onBuy(); }}>立即购买</button>
      </aside>
    </div>
  </>
);

export default BundlePage;

