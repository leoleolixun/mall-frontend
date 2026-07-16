export type PageKey =
  | "home"
  | "product-list"
  | "product-detail"
  | "cart"
  | "cart-empty"
  | "auth"
  | "checkout"
  | "payment"
  | "payment-result"
  | "payment-failed";

export interface Product {
  id: string;
  apiId?: number;
  merchantId?: number;
  merchantName?: string;
  merchantLogo?: string;
  skuId?: number;
  skuName?: string;
  name: string;
  price: number;
  category: string;
  categoryId?: number;
  brand: string;
  badge: string;
  sales: string;
  cover?: string;
  description?: string;
}

export interface CartLine {
  id: string;
  merchantId?: number;
  merchantName?: string;
  merchantLogo?: string;
  skuId?: number;
  productId?: number;
  cover?: string;
  name: string;
  spec: string;
  price: number;
  quantity: number;
  available?: boolean;
  message?: string;
}

export interface Review {
  id: string;
  user: string;
  sku: string;
  content: string;
  date: string;
}
