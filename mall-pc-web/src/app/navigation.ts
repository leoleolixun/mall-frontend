import type { PageKey } from "@/shared/types/domain";

export const productPages: Array<{ key: PageKey; label: string; desc: string }> = [
  { key: "product-list", label: "商品列表搜索", desc: "分类筛选、排序、商品网格、分页" },
  { key: "product-detail", label: "商品详情", desc: "主图、规格、价格、购买操作" },
  { key: "reviews", label: "商品评价列表", desc: "评分摘要、评价筛选、图文评价" },
  { key: "compare", label: "商品对比", desc: "同类商品参数和操作对比" },
  { key: "presale", label: "预售商品", desc: "定金、尾款、规则和流程" },
  { key: "bundle", label: "组合套餐", desc: "套餐选择、优惠和加购" }
];

