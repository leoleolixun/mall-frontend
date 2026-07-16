import type React from "react";
import { MessageSquare, ShoppingCart } from "lucide-react";
import type { Product } from "@/shared/types/domain";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

export const ReviewsPage: React.FC<{
  product: Product;
  onAdd: (product: Product) => void;
  onBack: () => void;
}> = ({ product, onAdd, onBack }) => (
  <>
    <HeroTitle title="商品评价" />
    <div className="review-layout">
      <section className="panel review-list">
        <div className="detail-review-empty">
          <MessageSquare size={44} />
          <h2>暂无用户评价</h2>
          <p>当前商品暂无可展示的评价。</p>
        </div>
      </section>
      <aside className="panel aside-product">
        <h2>商品信息</h2>
        <ProductVisual alt={product.name} src={product.cover} />
        <strong>{product.name}</strong>
        <b>{formatPrice(product.price)}</b>
        <button className="primary-button" onClick={() => onAdd(product)}><ShoppingCart size={16} />加入购物车</button>
        <button className="plain-button" onClick={onBack}>返回详情</button>
      </aside>
    </div>
  </>
);

export default ReviewsPage;
