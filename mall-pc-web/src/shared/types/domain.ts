export type PageKey =
  | "home"
  | "product-list"
  | "product-detail"
  | "reviews"
  | "compare"
  | "presale"
  | "bundle"
  | "cart"
  | "cart-empty"
  | "auth"
  | "checkout"
  | "payment"
  | "pickup"
  | "payment-result"
  | "payment-failed";

export interface Product {
  id: string;
  apiId?: number;
  skuId?: number;
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
  skuId?: number;
  productId?: number;
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
