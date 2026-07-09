import type { OrderRequestItem } from "@/api/client";
import type { CartLine } from "@/shared/types/domain";

export const buildOrderItems = (lines: CartLine[]): OrderRequestItem[] => (
  lines
    .filter((line) => line.skuId && line.quantity > 0)
    .map((line) => ({ sku_id: line.skuId as number, quantity: line.quantity }))
);

