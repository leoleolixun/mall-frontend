import type React from "react";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { moneyFromCent } from "@/api/client";
import type { ProductDetailResponse } from "@/api/client";
import type { Product } from "@/shared/types/domain";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

export const ProductDetailPage: React.FC<{
  product: Product;
  detail?: ProductDetailResponse | null;
  onAdd: (product: Product, quantity?: number) => void;
  onBuy: () => void;
  onReviews: () => void;
}> = ({ product, detail, onAdd, onBuy, onReviews }) => {
  const [color, setColor] = useState("曜石黑");
  const [selectedSkuId, setSelectedSkuId] = useState<number | undefined>(detail?.skus?.[0]?.id ?? product.skuId);
  const [quantity, setQuantity] = useState(1);
  const skus = detail?.skus ?? [];
  const selectedSku = skus.find((sku) => sku.id === selectedSkuId) ?? skus[0];
  const displayProduct: Product = {
    ...product,
    skuId: selectedSku?.id ?? product.skuId,
    price: selectedSku ? moneyFromCent(selectedSku.price) : product.price
  };

  useEffect(() => {
    setSelectedSkuId(detail?.skus?.[0]?.id ?? product.skuId);
  }, [detail, product.skuId]);

  return (
    <>
    <HeroTitle title={product.name} crumbs={`首页 / ${product.category} / ${product.name}`} />
    <div className="detail-layout">
      <section className="panel gallery-panel">
        <div className="main-image"><ProductVisual /></div>
        <div className="thumb-row">
          {[1, 2, 3, 4].map((item) => <button className={item === 1 ? "active" : ""} key={item}><ProductVisual compact /></button>)}
        </div>
      </section>
      <section className="panel purchase-panel">
        <span className="badge">30 天无忧退换</span>
        <h2>{product.name}</h2>
        <p>{detail?.description || product.description || "商品详情来自后端接口，可继续补充图文详情、参数表、评价摘要和售后政策。"}</p>
        <div className="price-band">
          <span>商城价</span>
          <strong>{formatPrice(displayProduct.price)}</strong>
          <em>库存 {selectedSku?.stock ?? "同步中"}</em>
        </div>
        <SpecSelector title="颜色" options={["曜石黑", "珍珠白", "海盐蓝"]} value={color} onChange={setColor} />
        <SpecSelector
          title="规格"
          options={skus.length > 0 ? skus.map((sku) => sku.name) : ["默认规格"]}
          value={selectedSku?.name ?? "默认规格"}
          onChange={(name) => setSelectedSkuId(skus.find((sku) => sku.name === name)?.id)}
        />
        <div className="quantity-row">
          <span>数量</span>
          <div className="stepper">
            <button onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
            <b>{quantity}</b>
            <button onClick={() => setQuantity((value) => value + 1)}>+</button>
          </div>
        </div>
        <p className="selection-note">已选：{color} / {selectedSku?.name ?? "默认规格"} / {quantity} 件</p>
        <div className="buy-actions">
          <button className="primary-button" onClick={() => onAdd(displayProduct, quantity)}><ShoppingCart size={17} />加入购物车</button>
          <button className="primary-button solid" onClick={() => { onAdd(displayProduct, quantity); onBuy(); }}>立即购买</button>
          <button className="plain-button"><Heart size={17} />收藏商品</button>
        </div>
      </section>
    </div>
    <section className="panel detail-tabs">
      <div className="chip-row">
        {["商品详情", "规格参数", "用户评价", "售后保障"].map((item, index) => (
          <Chip active={index === 0} key={item} onClick={item === "用户评价" ? onReviews : undefined}>{item}</Chip>
        ))}
      </div>
      <div className="detail-copy">
        <h2>核心卖点</h2>
        <p>{detail?.description || "页面区域预留用于承载图文详情、参数表、评价摘要和售后政策。"}</p>
      </div>
    </section>
    </>
  );
};

export const SpecSelector: React.FC<{ title: string; options: string[]; value?: string; onChange?: (value: string) => void }> = ({ title, options, value, onChange }) => (
  <div className="spec-row">
    <span>{title}</span>
    <div className="chip-row">
      {options.map((item, index) => <Chip active={(value ?? options[0]) === item || (!value && index === 0)} key={item} onClick={() => onChange?.(item)}>{item}</Chip>)}
    </div>
  </div>
);

export default ProductDetailPage;

