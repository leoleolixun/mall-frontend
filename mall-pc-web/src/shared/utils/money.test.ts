import { describe, expect, it } from "vitest";

import { moneyFromCent } from "@/api/client";
import { mapCartLine } from "@/features/cart/helpers/cartMappers";
import { formatPrice } from "./money";

describe("money conversion", () => {
  it("只在 API 边界把分转换为元", () => {
    expect(moneyFromCent(1234)).toBe(12.34);
    expect(moneyFromCent(1)).toBe(0.01);
    expect(formatPrice(moneyFromCent(1234))).toMatch(/12\.34/);
  });

  it("购物车映射保持数量和可用状态", () => {
    expect(mapCartLine({
      merchant_id: 1,
      merchant_name: "测试商户",
      merchant_logo: "merchant.jpg",
      product_id: 10,
      sku_id: 20,
      product_name: "测试商品",
      sku_name: "黑色",
      sku_image: "image.jpg",
      price: 29900,
      stock: 8,
      quantity: 2,
      subtotal: 59800,
      available: true,
      message: ""
    })).toEqual({
      id: "20",
      merchantId: 1,
      merchantName: "测试商户",
      merchantLogo: "merchant.jpg",
      skuId: 20,
      productId: 10,
      cover: "image.jpg",
      name: "测试商品",
      spec: "黑色",
      price: 299,
      quantity: 2,
      available: true,
      message: ""
    });
  });
});
