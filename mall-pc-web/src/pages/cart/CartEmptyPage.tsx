import type React from "react";
import { ShoppingCart } from "lucide-react";
import { products } from "@/data/mock";
import type { Product } from "@/shared/types/domain";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductCard } from "@/shared/components/ProductCard";

interface CartEmptyPageProps {
  isLoggedIn: boolean;
  onContinue: () => void;
  onLogin: () => void;
  onAdd: (product: Product) => void;
}

export const CartEmptyPage: React.FC<CartEmptyPageProps> = ({ isLoggedIn, onContinue, onLogin, onAdd }) => {
  const description = isLoggedIn
    ? "当前账号购物车暂无商品，去挑选喜欢的商品加入购物车。"
    : "登录后可同步购物车，或先去看看推荐商品。";

  return (
    <>
      <HeroTitle title="购物车" />
      <section className="panel empty-state">
        <div className="empty-icon"><ShoppingCart size={54} /></div>
        <h2>购物车还是空的</h2>
        <p>{description}</p>
        <div>
          <button className="primary-button solid" onClick={onContinue}>去逛逛</button>
          {!isLoggedIn ? <button className="plain-button" onClick={onLogin}>登录账号</button> : null}
        </div>
      </section>
      <section className="panel recommend-panel">
        <h2>{isLoggedIn ? "为你推荐" : "猜你喜欢"}</h2>
        <div className="recommend-row">
          {products.slice(0, 4).map((product) => <ProductCard compact key={product.id} product={product} onAdd={onAdd} />)}
        </div>
      </section>
    </>
  );
};

export default CartEmptyPage;
