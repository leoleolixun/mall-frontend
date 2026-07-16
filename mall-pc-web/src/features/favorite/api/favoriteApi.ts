import { request } from "@/api/client";
import type { PageResponse, ProductListItemResponse } from "@/api/client";

export const favoriteApi = {
  add(productId: number): Promise<void> {
    return request<void>("/favorites/products", {
      method: "POST",
      body: JSON.stringify({ product_id: productId })
    });
  },
  list(page = 1, pageSize = 50): Promise<PageResponse<ProductListItemResponse>> {
    const search = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    return request<PageResponse<ProductListItemResponse>>(`/favorites/products?${search.toString()}`);
  },
  remove(productId: number): Promise<void> {
    return request<void>(`/favorites/products/${productId}`, { method: "DELETE" });
  }
};
