import type React from "react";
import { useEffect, useState } from "react";
import { Heart, MessageSquare, PackageCheck, RotateCcw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { moneyFromCent } from "@/api/client";
import type { ProductDetailResponse } from "@/api/client";
import type { Product } from "@/shared/types/domain";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

type DetailTabKey = "details" | "specifications" | "reviews" | "service";

const detailTabs: Array<{ key: DetailTabKey; label: string }> = [
  { key: "details", label: "商品详情" },
  { key: "specifications", label: "规格参数" },
  { key: "reviews", label: "用户评价" },
  { key: "service", label: "售后保障" }
];

export const ProductDetailPage: React.FC<{
  product: Product;
  detail?: ProductDetailResponse | null;
  onAdd: (product: Product, quantity?: number) => void;
  onBuy: () => void;
}> = ({ product, detail, onAdd, onBuy }) => {
  const [color, setColor] = useState("曜石黑");
  const [selectedSkuId, setSelectedSkuId] = useState<number | undefined>(detail?.skus?.[0]?.id ?? product.skuId);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("details");
  const skus = detail?.skus ?? [];
  const selectedSku = skus.find((sku) => sku.id === selectedSkuId) ?? skus[0];
  const productDescription = detail?.description || product.description || `${product.name}，具体信息以页面展示和实际商品为准。`;
  const displayProduct: Product = {
    ...product,
    skuId: selectedSku?.id ?? product.skuId,
    price: selectedSku ? moneyFromCent(selectedSku.price) : product.price
  };

  useEffect(() => {
    setSelectedSkuId(detail?.skus?.[0]?.id ?? product.skuId);
  }, [detail, product.skuId]);

  useEffect(() => {
    setActiveTab("details");
  }, [product.id]);

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
        <p>{productDescription}</p>
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
              <div><span>品牌</span><strong>{product.brand}</strong></div>
              <div><span>分类</span><strong>{product.category}</strong></div>
            </div>
          </div>
        ) : null}

        {activeTab === "specifications" ? (
          <div className="detail-copy">
            <h2>规格参数</h2>
            <div className="detail-parameter-list">
              <div><span>商品编号</span><strong>{detail?.id ?? product.apiId ?? product.id}</strong></div>
              <div><span>品牌</span><strong>{product.brand}</strong></div>
              <div><span>商品分类</span><strong>{product.category}</strong></div>
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

        {activeTab === "reviews" ? (
          <div className="detail-review-empty">
            <MessageSquare size={44} />
            <h2>暂无用户评价</h2>
            <p>当前商品暂无可展示的评价，购买完成后可在订单中心发表评价。</p>
          </div>
        ) : null}

        {activeTab === "service" ? (
          <div className="detail-copy">
            <h2>售后保障</h2>
            <div className="detail-service-list">
              <div><RotateCcw size={22} /><strong>无忧退换</strong><span>符合退换条件的商品可按商城规则申请售后。</span></div>
              <div><ShieldCheck size={22} /><strong>质量保障</strong><span>如遇商品质量问题，可提交凭证申请处理。</span></div>
              <div><Truck size={22} /><strong>物流跟踪</strong><span>订单发货后可在订单详情中查看物流进度。</span></div>
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
