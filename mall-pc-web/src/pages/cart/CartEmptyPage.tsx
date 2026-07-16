import type React from "react";
import { ShoppingCart } from "lucide-react";
import { HeroTitle } from "@/shared/components/HeroTitle";

interface CartEmptyPageProps {
  isLoggedIn: boolean;
  onContinue: () => void;
  onLogin: () => void;
}

export const CartEmptyPage: React.FC<CartEmptyPageProps> = ({ isLoggedIn, onContinue, onLogin }) => {
  const description = isLoggedIn
    ? "当前账号购物车暂无商品，去挑选喜欢的商品加入购物车。"
    : "登录后可同步购物车，也可以先浏览当前已上架商品。";

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
    </>
  );
};

export default CartEmptyPage;
