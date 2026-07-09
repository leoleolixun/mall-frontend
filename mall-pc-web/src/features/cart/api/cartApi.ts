import { request } from "@/api/client";
import type { CartItemResponse } from "@/api/client";

export const cartApi = {
  addItem(skuId: number, quantity: number): Promise<void> {
    return request<void>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ sku_id: skuId, quantity })
    });
  },
  deleteItem(skuId: number): Promise<void> {
    return request<void>(`/cart/items/${skuId}`, {
      method: "DELETE"
    });
  },
  items(): Promise<CartItemResponse[]> {
    return request<CartItemResponse[]>("/cart/items");
  },
  updateItem(skuId: number, quantity: number): Promise<void> {
    return request<void>(`/cart/items/${skuId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity })
    });
  }
};
