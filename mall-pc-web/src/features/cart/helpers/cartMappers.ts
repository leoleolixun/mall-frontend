import { moneyFromCent } from "@/api/client";
import type { CartItemResponse } from "@/api/client";
import type { CartLine } from "@/shared/types/domain";

export const mapCartLine = (item: CartItemResponse): CartLine => ({
  id: String(item.sku_id),
  skuId: item.sku_id,
  productId: item.product_id,
  name: item.product_name || `SKU ${item.sku_id}`,
  spec: item.sku_name || "默认规格",
  price: moneyFromCent(item.price),
  quantity: item.quantity,
  available: item.available,
  message: item.message
});

