export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export interface PageResponse<T> {
  list: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface UserResponse {
  id: number;
  nickname: string;
  avatar: string;
  mobile: string;
  gender: string;
  birthday: string;
  bio: string;
}

export interface UpdateProfileRequest {
  nickname: string;
  avatar: string;
  mobile: string;
  gender: string;
  birthday: string;
  bio: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}

export interface CategoryResponse {
  id: number;
  name: string;
  sort: number;
}

export interface ProductListItemResponse {
  id: number;
  merchant_id: number;
  category_id: number;
  name: string;
  cover: string;
  min_price: number;
}

export interface SKUResponse {
  id: number;
  name: string;
  image: string;
  price: number;
  stock: number;
}

export interface ProductDetailResponse {
  id: number;
  merchant_id: number;
  category_id: number;
  name: string;
  cover: string;
  description: string;
  skus: SKUResponse[];
}

export interface CartItemResponse {
  product_id: number;
  sku_id: number;
  product_name: string;
  sku_name: string;
  sku_image: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
  available: boolean;
  message?: string;
}

export interface AddressResponse {
  id: number;
  receiver_name: string;
  receiver_phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: boolean;
}

export interface AddressRequest {
  receiver_name: string;
  receiver_phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: boolean;
}

export interface OrderRequestItem {
  sku_id: number;
  quantity: number;
}

export interface OrderItemResponse {
  id?: number;
  product_id: number;
  sku_id: number;
  product_name: string;
  sku_name: string;
  sku_image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderPreviewResponse {
  idempotency_token: string;
  merchant_id: number;
  merchant_name: string;
  address: AddressResponse;
  items: OrderItemResponse[];
  goods_amount: number;
  freight_amount: number;
  discount_amount: number;
  payable_amount: number;
}

export interface OrderResponse {
  id: number;
  order_no: string;
  status: number;
  status_text: string;
  payable_amount: number;
  items: OrderItemResponse[];
}

export type PayChannel = "wechat" | "alipay" | "mock" | "stripe";
export type PayScene = "mock" | "wechat" | "page" | "wap";

export interface PaymentPayParams {
  code_url?: string;
  expires_in?: number;
  method?: "redirect" | "qr_code" | string;
  mode?: "qr_code" | string;
  mock?: boolean;
  notify_url?: string;
  pay_url?: string;
  payment_no?: string;
  provider?: string;
  qr_code_url?: string;
  quit_url?: string;
  return_mode?: string;
  return_url?: string;
  scene?: string;
  sdk_request?: string;
  total_yuan?: string;
}

export interface PaymentResponse {
  id: number;
  payment_no: string;
  order_id: number;
  order_no: string;
  user_id: number;
  merchant_id: number;
  pay_channel: PayChannel;
  pay_scene: PayScene;
  status: number;
  status_text: string;
  amount: number;
  transaction_id: string;
  failure_reason: string;
  pay_params?: PaymentPayParams;
  paid_at?: string | null;
  closed_at?: string | null;
}

const API_BASE = "/api/v1";
const AUTH_STORAGE_KEY = "mall_pc_auth";

export const moneyFromCent = (value: number): number => Math.round(value) / 100;
export const moneyToCent = (value: number): number => Math.round(value * 100);

export const authStorage = {
  read(): AuthResponse | null {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },
  write(auth: AuthResponse): void {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  },
  clear(): void {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

class ApiError extends Error {
  status: number;
  code: number;

  constructor(message: string, status: number, code: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const auth = authStorage.read();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth?.access_token) {
    headers.set("Authorization", `Bearer ${auth.access_token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.code !== 0) {
    throw new ApiError(payload?.message || "请求失败", response.status, payload?.code ?? response.status);
  }

  return payload.data as T;
};
