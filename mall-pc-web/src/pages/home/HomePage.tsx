import type React from "react";
import type { Product } from "@/shared/types/domain";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

export const HomePage: React.FC<{
  catalog: Product[];
  onAdd: (product: Product) => void;
  onOpen: (product: Product) => void;
  onList: () => void;
  onPresale: () => void;
  onBundle: () => void;
}> = ({ catalog, onAdd, onOpen, onList, onPresale, onBundle }) => (
  <section className="home-screen">
    <section className="home-hero">
      <div className="home-hero-copy">
        <h1>夏季焕新购物节</h1>
        <p>精选美妆、数码、家居、母婴好物，支持满减券、会员积分和极速配送。</p>
        <div>
          <button className="primary-button solid" onClick={onList}>立即选购</button>
          <button className="plain-button" onClick={onBundle}>领取优惠券</button>
        </div>
      </div>
      <div className="home-hero-visual">
        <ProductVisual />
      </div>
    </section>

    <div className="home-main-layout">
      <aside className="panel home-category-panel">
        <h2>全部分类</h2>
        {["美妆个护", "数码家电", "服饰鞋包", "母婴玩具", "食品生鲜", "家居生活", "运动户外", "图书文具"].map((item, index) => (
          <button className={index === 0 ? "home-category active" : "home-category"} key={item} onClick={onList}>
            {item}
          </button>
        ))}
      </aside>

      <section className="home-content-stack">
        <section className="panel marketing-panel">
          {[
            ["限时秒杀", "10:00 场", onPresale],
            ["新人礼包", "最高 ¥99", onBundle],
            ["会员专区", "积分抵现", onList]
          ].map(([title, desc, action], index) => (
            <button className={index === 0 ? "marketing-card featured" : "marketing-card"} key={title as string} onClick={action as () => void}>
              <strong>{title as string}</strong>
              <span>{desc as string}</span>
            </button>
          ))}
        </section>

        <section className="panel featured-panel">
          <div className="section-title-row">
            <h2>为你推荐</h2>
            <button className="plain-button small" onClick={onList}>查看全部</button>
          </div>
          <div className="home-product-row">
            {catalog.slice(0, 4).map((product) => (
              <article className="mini-product-card" key={product.id}>
                <button className="visual-button" onClick={() => onOpen(product)}>
                  <ProductVisual />
                </button>
                <strong>{product.name}</strong>
                <div>
                  <b>{formatPrice(product.price)}</b>
                  <button className="primary-button small" onClick={() => onOpen(product)}>查看</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  </section>
);

export default HomePage;

