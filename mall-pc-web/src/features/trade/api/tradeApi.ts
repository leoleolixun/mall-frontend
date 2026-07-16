import { request } from "@/api/client";
import type {
  MerchantCouponSelection,
  OrderRequestItem,
  PageResponse,
  TradePreviewResponse,
  TradeResponse
} from "@/api/client";

interface TradePreviewRequest {
  address_id: number;
  merchant_coupons: MerchantCouponSelection[];
  items: OrderRequestItem[];
}

interface CreateTradeRequest extends TradePreviewRequest {
  idempotency_token: string;
  remark: string;
}

export const tradeApi = {
  preview(payload: TradePreviewRequest): Promise<TradePreviewResponse> {
    return request<TradePreviewResponse>("/trades/preview", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  create(payload: CreateTradeRequest): Promise<TradeResponse> {
    return request<TradeResponse>("/trades", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  list(payload: { page?: number; pageSize?: number; status?: number } = {}): Promise<PageResponse<TradeResponse>> {
    const search = new URLSearchParams();
    search.set("page", String(payload.page ?? 1));
    search.set("page_size", String(payload.pageSize ?? 10));
    if (payload.status) search.set("status", String(payload.status));
    return request<PageResponse<TradeResponse>>(`/trades?${search.toString()}`);
  },
  detail(tradeId: number): Promise<TradeResponse> {
    return request<TradeResponse>(`/trades/${tradeId}`);
  },
  cancel(tradeId: number): Promise<TradeResponse> {
    return request<TradeResponse>(`/trades/${tradeId}/cancel`, { method: "POST" });
  }
};
