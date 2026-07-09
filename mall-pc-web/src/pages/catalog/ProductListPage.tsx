import type React from "react";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Product } from "@/shared/types/domain";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductCard } from "@/shared/components/ProductCard";

export const ProductListPage: React.FC<{
  catalog: Product[];
  globalSearch: string;
  onAdd: (product: Product) => void;
  onOpen: (product: Product) => void;
}> = ({ catalog, globalSearch, onAdd, onOpen }) => {
  const [category, setCategory] = useState("全部");
  const [sort, setSort] = useState("综合");
  const [localSearch, setLocalSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const keyword = `${globalSearch} ${localSearch}`.trim().toLowerCase();
    const result = catalog.filter((product) => {
      const matchCategory = category === "全部" || product.category === category;
      const matchKeyword = !keyword || [product.name, product.category, product.brand, product.badge].join(" ").toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });

    if (sort === "价格") {
      return [...result].sort((a, b) => a.price - b.price);
    }
    if (sort === "新品") {
      return [...result].sort((a, b) => b.id.localeCompare(a.id));
    }
    if (sort === "销量") {
      return [...result].sort((a, b) => b.sales.localeCompare(a.sales));
    }
    return result;
  }, [catalog, category, globalSearch, localSearch, sort]);

  return (
    <section className="list-screen">
      <HeroTitle title="全部商品" subtitle="分类筛选、排序、商品网格、分页。" />
      <div className="list-layout">
        <aside className="panel filter-panel">
          <h2>筛选条件</h2>
          {["分类", "品牌", "价格", "配送", "状态"].map((group) => (
            <div className="filter-group" key={group}>
              <h3>{group}</h3>
              <div>
                {(group === "分类" ? ["全部", ...Array.from(new Set(catalog.map((product) => product.category)))] : ["全部", "默认商户"]).map((value) => (
                  <Chip active={group === "分类" ? category === value : value === "全部"} key={value} onClick={() => group === "分类" && setCategory(value)}>
                    {value}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <section className="content-stack">
          <div className="panel list-toolbar">
            <div className="chip-row">
              {["综合", "销量", "新品", "价格"].map((item) => <Chip active={sort === item} key={item} onClick={() => setSort(item)}>{item}</Chip>)}
            </div>
            <label className="inline-search">
              <Search size={15} />
              <input placeholder="在结果中搜索" value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} />
            </label>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} />)}
            </div>
          ) : (
            <div className="panel list-empty">
              <h2>没有找到相关商品</h2>
              <p>可以换个关键词或切回全部分类。</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default ProductListPage;

