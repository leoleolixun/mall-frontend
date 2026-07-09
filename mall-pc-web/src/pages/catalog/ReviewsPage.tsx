import type React from "react";
import { ShoppingCart } from "lucide-react";
import { reviews, products } from "@/data/mock";
import type { Product } from "@/shared/types/domain";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductVisual } from "@/shared/components/ProductVisual";

export const ReviewsPage: React.FC<{ onAdd: (product: Product) => void; onBack: () => void }> = ({ onAdd, onBack }) => (
  <>
    <HeroTitle title="商品评价" subtitle="评分摘要、评价筛选、图文评价。" />
    <section className="panel review-summary">
      <div>
        <strong>4.9</strong>
        <span>★★★★★ 好评率 98%</span>
      </div>
      <div className="chip-row">
        {["全部 1280", "有图 326", "追评 98", "音质好 520", "物流快 260"].map((item, index) => <Chip active={index === 0} key={item}>{item}</Chip>)}
      </div>
    </section>
    <div className="review-layout">
      <section className="panel review-list">
        {reviews.map((review) => (
          <article className="review-item" key={review.id}>
            <div className="avatar">{review.user.slice(0, 1)}</div>
            <div>
              <h3>{review.user}</h3>
              <span>★★★★★</span>
              <p>{review.content}</p>
              <small>{review.sku} · {review.date}</small>
            </div>
            <ProductVisual compact />
          </article>
        ))}
      </section>
      <aside className="panel aside-product">
        <h2>商品信息</h2>
        <ProductVisual />
        <strong>蓝牙耳机 Pro 主动降噪</strong>
        <b>¥299</b>
        <button className="primary-button" onClick={() => onAdd(products[1])}><ShoppingCart size={16} />加入购物车</button>
        <button className="plain-button" onClick={onBack}>返回详情</button>
      </aside>
    </div>
  </>
);

export default ReviewsPage;
