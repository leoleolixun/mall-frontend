import type React from "react";
import { useEffect, useState } from "react";
import { Heart, PackageCheck, RotateCcw, ShieldCheck, ShoppingCart } from "lucide-react";
import { moneyFromCent } from "@/api/client";
import type { ProductDetailResponse } from "@/api/client";
import type { Product } from "@/shared/types/domain";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

type DetailTabKey = "details" | "specifications" | "service";

const detailTabs: Array<{ key: DetailTabKey; label: string }> = [
  { key: "details", label: "商品详情" },
  { key: "specifications", label: "规格参数" },
  { key: "service", label: "售后保障" }
];

export const ProductDetailPage: React.FC<{
  product: Product;
  detail?: ProductDetailResponse | null;
  favorite: boolean;
  favoriteLoading: boolean;
  onAdd: (product: Product, quantity?: number) => Promise<boolean>;
  onBuy: () => void;
  onToggleFavorite: () => Promise<boolean>;
}> = ({ product, detail, favorite, favoriteLoading, onAdd, onBuy, onToggleFavorite }) => {
  const [selectedSkuId, setSelectedSkuId] = useState<number | undefined>(detail?.skus?.[0]?.id ?? product.skuId);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("details");
  const skus = detail?.skus ?? [];
  const selectedSku = skus.find((sku) => sku.id === selectedSkuId) ?? skus[0];
  const productImage = selectedSku?.image || detail?.cover || product.cover;
  const productDescription = detail?.description || product.description || `${product.name}，具体信息以页面展示和实际商品为准。`;
  const canPurchase = Boolean(selectedSku && selectedSku.stock >= quantity && quantity > 0);
  const displayProduct: Product = {
    ...product,
    skuId: selectedSku?.id ?? product.skuId,
    skuName: selectedSku?.name ?? product.skuName,
    price: selectedSku ? moneyFromCent(selectedSku.price) : product.price,
    cover: productImage
  };

  useEffect(() => {
    setSelectedSkuId(detail?.skus?.[0]?.id ?? product.skuId);
  }, [detail, product.skuId]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedSkuId]);

  useEffect(() => {
    setActiveTab("details");
  }, [product.id]);

  return (
    <>
    <HeroTitle title={product.name} crumbs={`首页 / ${product.category} / ${product.name}`} />
    <div className="detail-layout">
      <section className="panel gallery-panel">
        <div className="main-image"><ProductVisual alt={product.name} src={productImage} /></div>
        <div className="thumb-row">
          <button className="active"><ProductVisual alt={product.name} compact src={productImage} /></button>
        </div>
      </section>
      <section className="panel purchase-panel">
        <div className="purchase-title-row">
          <h2>{product.name}</h2>
          <button
            aria-pressed={favorite}
            className={favorite ? "favorite-button active" : "favorite-button"}
            disabled={favoriteLoading}
            onClick={() => void onToggleFavorite()}
            title={favorite ? "取消收藏" : "收藏商品"}
            type="button"
          >
            <Heart fill={favorite ? "currentColor" : "none"} size={17} />
            {favorite ? "已收藏" : "收藏"}
          </button>
        </div>
        <p>{productDescription}</p>
        <div className="price-band">
          <span>商城价</span>
          <strong>{formatPrice(displayProduct.price)}</strong>
          <em>库存 {selectedSku?.stock ?? "同步中"}</em>
        </div>
        <SpecSelector
          title="规格"
          options={skus.map((sku) => sku.name)}
          value={selectedSku?.name}
          onChange={(name) => setSelectedSkuId(skus.find((sku) => sku.name === name)?.id)}
        />
        <div className="quantity-row">
          <span>数量</span>
          <div className="stepper">
            <button onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
            <b>{quantity}</b>
            <button disabled={!selectedSku || quantity >= selectedSku.stock} onClick={() => setQuantity((value) => value + 1)}>+</button>
          </div>
        </div>
        <p className="selection-note">已选：{selectedSku?.name ?? "暂无可售规格"} / {quantity} 件</p>
        <div className="buy-actions">
          <button className="primary-button" disabled={!canPurchase} onClick={() => onAdd(displayProduct, quantity)}><ShoppingCart size={17} />加入购物车</button>
          <button className="primary-button solid" disabled={!canPurchase} onClick={() => void onAdd(displayProduct, quantity).then((added) => added && onBuy())}>立即购买</button>
        </div>
      </section>
    </div>
    <section className="panel detail-tabs">
      <div aria-label="商品信息" className="chip-row" role="tablist">
        {detailTabs.map((tab) => (
          <button
            aria-controls={`product-${tab.key}-panel`}
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? "chip active" : "chip"}
            id={`product-${tab.key}-tab`}
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`product-${activeTab}-tab`}
        className="detail-tab-panel"
        id={`product-${activeTab}-panel`}
        role="tabpanel"
      >
        {activeTab === "details" ? (
          <div className="detail-copy">
            <h2>商品介绍</h2>
            <p>{productDescription}</p>
            <div className="detail-facts">
              <div><span>商品名称</span><strong>{product.name}</strong></div>
              {product.brand ? <div><span>品牌</span><strong>{product.brand}</strong></div> : null}
              <div><span>分类</span><strong>{product.category}</strong></div>
              {product.merchantId ? <div><span>商户编号</span><strong>{product.merchantId}</strong></div> : null}
            </div>
          </div>
        ) : null}

        {activeTab === "specifications" ? (
          <div className="detail-copy">
            <h2>规格参数</h2>
            <div className="detail-parameter-list">
              <div><span>商品编号</span><strong>{detail?.id ?? product.apiId ?? product.id}</strong></div>
              <div><span>商品分类</span><strong>{product.category}</strong></div>
              {product.merchantId ? <div><span>商户编号</span><strong>{product.merchantId}</strong></div> : null}
            </div>
            <h3>可选规格</h3>
            {skus.length > 0 ? (
              <div className="detail-sku-table">
                <div className="detail-sku-header"><span>规格名称</span><span>价格</span><span>库存</span></div>
                {skus.map((sku) => (
                  <div className="detail-sku-row" key={sku.id}>
                    <strong>{sku.name}</strong>
                    <span>{formatPrice(moneyFromCent(sku.price))}</span>
                    <span>{sku.stock}</span>
                  </div>
                ))}
              </div>
            ) : <p>暂无可展示的规格参数。</p>}
          </div>
        ) : null}

        {activeTab === "service" ? (
          <div className="detail-copy">
            <h2>售后保障</h2>
            <div className="detail-service-list">
              <div><RotateCcw size={22} /><strong>无忧退换</strong><span>符合退换条件的商品可按商城规则申请售后。</span></div>
              <div><ShieldCheck size={22} /><strong>质量保障</strong><span>如遇商品质量问题，可提交凭证申请处理。</span></div>
              <div><PackageCheck size={22} /><strong>售后进度</strong><span>售后申请和处理结果可在个人中心持续跟踪。</span></div>
            </div>
          </div>
        ) : null}
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
