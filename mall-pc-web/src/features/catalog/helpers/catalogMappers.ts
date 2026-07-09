import { moneyFromCent } from "@/api/client";
import type { CategoryResponse, ProductListItemResponse } from "@/api/client";
import type { Product } from "@/shared/types/domain";

export const mapProduct = (item: ProductListItemResponse, categories: CategoryResponse[]): Product => {
  const category = categories.find((current) => current.id === item.category_id);

  return {
    id: String(item.id),
    apiId: item.id,
    name: item.name,
    price: moneyFromCent(item.min_price),
    category: category?.name ?? `分类 ${item.category_id}`,
    categoryId: item.category_id,
    brand: "默认商户",
    badge: item.min_price > 0 ? "接口商品" : "暂无价格",
    sales: "实时库存",
    cover: item.cover
  };
};

