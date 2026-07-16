import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import type { CategoryResponse } from "@/api/client";
import { catalogApi } from "@/features/catalog/api/catalogApi";
import { mapProduct } from "@/features/catalog/helpers/catalogMappers";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductCard } from "@/shared/components/ProductCard";
import type { Product } from "@/shared/types/domain";

const PAGE_SIZE = 12;

interface ProductListPageProps {
  categories: CategoryResponse[];
  globalSearch: string;
  onAdd: (product: Product) => void;
  onOpen: (product: Product) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({ categories, globalSearch, onAdd, onOpen }) => {
  const [categoryId, setCategoryId] = useState(0);
  const [sort, setSort] = useState<"综合" | "价格">("综合");
  const [localSearch, setLocalSearch] = useState(globalSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLocalSearch(globalSearch);
    setPage(1);
  }, [globalSearch]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      void catalogApi.products({
        page,
        pageSize: PAGE_SIZE,
        categoryId: categoryId || undefined,
        keyword: localSearch.trim() || undefined
      }).then((result) => {
        if (!active) {
          return;
        }
        const resultPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
        if (page > resultPages) {
          setPage(resultPages);
          return;
        }
        setProducts(result.list.map((item) => mapProduct(item, categories)));
        setTotal(result.total);
      }).catch((requestError: Error) => {
        if (active) {
          setProducts([]);
          setTotal(0);
          setError(requestError.message || "商品加载失败");
        }
      }).finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [categories, categoryId, localSearch, page, reloadKey]);

  const sortedProducts = useMemo(() => sort === "价格"
    ? [...products].sort((left, right) => left.price - right.price)
    : products, [products, sort]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const selectCategory = (id: number): void => {
    setCategoryId(id);
    setPage(1);
  };

  const updateSearch = (value: string): void => {
    setLocalSearch(value);
    setPage(1);
  };

  return (
    <section className="list-screen">
      <HeroTitle title="全部商品" subtitle="浏览当前已上架商品。" />
      <div className="list-layout">
        <aside className="panel filter-panel">
          <h2>筛选条件</h2>
          <div className="filter-group">
            <h3>分类</h3>
            <div>
              <Chip active={categoryId === 0} onClick={() => selectCategory(0)}>全部</Chip>
              {categories.map((category) => (
                <Chip active={categoryId === category.id} key={category.id} onClick={() => selectCategory(category.id)}>
                  {category.name}
                </Chip>
              ))}
            </div>
          </div>
        </aside>
        <section className="content-stack">
          <div className="panel list-toolbar">
            <div className="chip-row">
              {(["综合", "价格"] as const).map((item) => <Chip active={sort === item} key={item} onClick={() => setSort(item)}>{item}</Chip>)}
            </div>
            <label className="inline-search">
              <Search size={15} />
              <input placeholder="搜索商品" value={localSearch} onChange={(event) => updateSearch(event.target.value)} />
            </label>
          </div>
          {loading ? (
            <div className="panel list-empty catalog-state">
              <h2>正在加载商品</h2>
              <p>请稍候...</p>
            </div>
          ) : error ? (
            <div className="panel list-empty catalog-state error">
              <h2>商品加载失败</h2>
              <p>{error}</p>
              <button className="primary-button" onClick={() => setReloadKey((current) => current + 1)} type="button">重新加载</button>
            </div>
          ) : sortedProducts.length > 0 ? (
            <>
              <div className="product-grid">
                {sortedProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} />)}
              </div>
              <nav aria-label="商品分页" className="catalog-pagination">
                <button aria-label="上一页" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} title="上一页" type="button">
                  <ChevronLeft size={17} />
                </button>
                <span>第 {page} / {totalPages} 页，共 {total} 件商品</span>
                <button aria-label="下一页" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} title="下一页" type="button">
                  <ChevronRight size={17} />
                </button>
              </nav>
            </>
          ) : (
            <div className="panel list-empty">
              <h2>没有找到相关商品</h2>
              <p>可以更换关键词或切回全部分类。</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default ProductListPage;
