import type React from "react";
import type { Product } from "@/shared/types/domain";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

interface HomePageProps {
  catalog: Product[];
  catalogError: string;
  catalogLoading: boolean;
  onCategory: (category: string) => void;
  onList: () => void;
  onOpen: (product: Product) => void;
  onRetryCatalog: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ catalog, catalogError, catalogLoading, onCategory, onList, onOpen, onRetryCatalog }) => {
  const categories = Array.from(new Set(catalog.map((product) => product.category))).slice(0, 8);
  const featuredProduct = catalog[0];

  return (
    <section className="home-screen">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>在线商城</h1>
          <p>浏览当前已上架商品，登录后可同步购物车、管理收货地址并完成订单支付。</p>
          <div>
            <button className="primary-button solid" onClick={onList}>浏览商品</button>
          </div>
        </div>
        <div className="home-hero-visual">
          <ProductVisual alt={featuredProduct?.name ?? "商品展示"} src={featuredProduct?.cover} />
        </div>
      </section>

      <div className="home-main-layout">
        <aside className="panel home-category-panel">
          <h2>商品分类</h2>
          {catalogLoading ? <p className="home-category-status">正在加载分类...</p> : null}
          {!catalogLoading && catalogError ? <p className="home-category-status">分类暂时无法加载</p> : null}
          {!catalogLoading && !catalogError && categories.length === 0 ? <p className="home-category-status">暂无商品分类</p> : null}
          {categories.map((item) => (
            <button className="home-category" key={item} onClick={() => onCategory(item)}>
              {item}
            </button>
          ))}
        </aside>

        <section className="home-content-stack">
          <section className="panel featured-panel">
            <div className="section-title-row">
              <h2>上架商品</h2>
              <button className="plain-button small" onClick={onList}>查看全部</button>
            </div>
            {catalogLoading ? (
              <div className="catalog-state compact">
                <strong>正在加载商品</strong>
                <span>请稍候...</span>
              </div>
            ) : catalogError ? (
              <div className="catalog-state compact error">
                <strong>商品加载失败</strong>
                <span>{catalogError}</span>
                <button className="primary-button small" onClick={onRetryCatalog}>重新加载</button>
              </div>
            ) : catalog.length === 0 ? (
              <div className="catalog-state compact">
                <strong>暂无上架商品</strong>
                <span>商品上架后会显示在这里。</span>
              </div>
            ) : (
              <div className="home-product-row">
                {catalog.slice(0, 4).map((product) => (
                  <article className="mini-product-card" key={product.id}>
                    <button className="visual-button" onClick={() => onOpen(product)}>
                      <ProductVisual alt={product.name} src={product.cover} />
                    </button>
                    <strong>{product.name}</strong>
                    <div>
                      <b>{formatPrice(product.price)}</b>
                      <button className="primary-button small" onClick={() => onOpen(product)}>查看</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </section>
  );
};

export default HomePage;
