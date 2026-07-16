import { moneyFromCent } from "@/api/client";
import type { CategoryResponse, ProductListItemResponse } from "@/api/client";
import type { Product } from "@/shared/types/domain";

export const mapProduct = (item: ProductListItemResponse, categories: CategoryResponse[]): Product => {
  const category = categories.find((current) => current.id === item.category_id);

  return {
    id: String(item.id),
    apiId: item.id,
    merchantId: item.merchant_id,
    merchantName: item.merchant_name,
    merchantLogo: item.merchant_logo,
    name: item.name,
    price: moneyFromCent(item.min_price),
    category: category?.name ?? `分类 ${item.category_id}`,
    categoryId: item.category_id,
    brand: "",
    badge: "",
    sales: "",
    cover: item.cover
  };
};
