import { request } from "@/api/client";
import type { CategoryResponse, PageResponse, ProductDetailResponse, ProductListItemResponse } from "@/api/client";

export const catalogApi = {
  categories(): Promise<CategoryResponse[]> {
    return request<CategoryResponse[]>("/categories");
  },
  productDetail(productId: number): Promise<ProductDetailResponse> {
    return request<ProductDetailResponse>(`/products/${productId}`);
  },
  products(params: { page?: number; pageSize?: number; categoryId?: number; keyword?: string } = {}): Promise<PageResponse<ProductListItemResponse>> {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("page_size", String(params.pageSize ?? 50));
    if (params.categoryId) {
      search.set("category_id", String(params.categoryId));
    }
    if (params.keyword?.trim()) {
      search.set("keyword", params.keyword.trim());
    }

    return request<PageResponse<ProductListItemResponse>>(`/products?${search.toString()}`);
  }
};
