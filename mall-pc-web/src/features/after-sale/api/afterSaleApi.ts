import { request } from "@/api/client";
import type { AfterSaleResponse, CreateAfterSaleRequest, PageResponse } from "@/api/client";

export const afterSaleApi = {
  create(payload: CreateAfterSaleRequest): Promise<AfterSaleResponse> {
    return request<AfterSaleResponse>("/after-sales", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  detail(id: number): Promise<AfterSaleResponse> {
    return request<AfterSaleResponse>(`/after-sales/${id}`);
  },
  cancel(id: number): Promise<void> {
    return request<void>(`/after-sales/${id}/cancel`, { method: "POST" });
  },
  list(page = 1, pageSize = 50, status?: number): Promise<PageResponse<AfterSaleResponse>> {
    const search = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (status) {
      search.set("status", String(status));
    }
    return request<PageResponse<AfterSaleResponse>>(`/after-sales?${search.toString()}`);
  }
};
