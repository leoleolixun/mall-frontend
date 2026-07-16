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
  merchant_name: string;
  merchant_logo: string;
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
  merchant_name: string;
  merchant_logo: string;
  category_id: number;
  name: string;
  cover: string;
  description: string;
  skus: SKUResponse[];
}

export interface CouponResponse {
  id: number;
  merchant_id: number;
  name: string;
  threshold_amount: number;
  discount_amount: number;
  total_quantity: number;
  claimed_quantity: number;
  used_quantity: number;
  per_user_limit: number;
  status: number;
  status_text: string;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
  claimed?: boolean;
}

export interface UserCouponResponse {
  id: number;
  status: number;
  status_text: string;
  claimed_at: string;
  used_at?: string | null;
  order_id: number;
  coupon: CouponResponse;
}

export interface RefundResponse {
  refund_no: string;
  pay_channel: string;
  amount: number;
  status: number;
  status_text: string;
  transaction_id: string;
  failure_reason: string;
  last_error: string;
  retry_count: number;
  last_attempt_at?: string | null;
  next_retry_at?: string | null;
  refunded_at?: string | null;
}

export interface AfterSaleResponse {
  id: number;
  after_sale_no: string;
  order_id: number;
  order_no: string;
  order_item_id: number;
  product_name: string;
  sku_name: string;
  sku_image: string;
  user_id: number;
  merchant_id: number;
  type: string;
  type_text: string;
  status: number;
  status_text: string;
  reason: string;
  description: string;
  images: string[];
  refund_amount: number;
  reject_reason: string;
  reviewed_at?: string | null;
  cancelled_at?: string | null;
  refunded_at?: string | null;
  created_at: string;
  updated_at: string;
  refund?: RefundResponse;
}

export interface CartItemResponse {
  merchant_id: number;
  merchant_name: string;
  merchant_logo: string;
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
  discount_amount: number;
  payable_amount: number;
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
  user_coupon_id: number;
}

export interface OrderResponse {
  id: number;
  trade_id?: number | null;
  order_no: string;
  user_id: number;
  merchant_id: number;
  merchant_name: string;
  status: number;
  status_text: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  goods_amount: number;
  freight_amount: number;
  discount_amount: number;
  payable_amount: number;
  user_coupon_id: number;
  remark: string;
  paid_at?: string | null;
  cancelled_at?: string | null;
  completed_at?: string | null;
  items: OrderItemResponse[];
  shipment?: ShipmentResponse | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantCouponSelection {
  merchant_id: number;
  user_coupon_id: number;
}

export interface TradeMerchantGroupResponse {
  merchant_id: number;
  merchant_name: string;
  merchant_logo: string;
  items: OrderItemResponse[];
  goods_amount: number;
  freight_amount: number;
  discount_amount: number;
  payable_amount: number;
  user_coupon_id: number;
}

export interface TradePreviewResponse {
  idempotency_token: string;
  address: AddressResponse;
  merchant_groups: TradeMerchantGroupResponse[];
  goods_amount: number;
  freight_amount: number;
  discount_amount: number;
  payable_amount: number;
}

export interface TradeResponse {
  id: number;
  trade_no: string;
  user_id: number;
  status: number;
  status_text: string;
  goods_amount: number;
  freight_amount: number;
  discount_amount: number;
  payable_amount: number;
  paid_at?: string | null;
  closed_at?: string | null;
  orders: OrderResponse[];
  created_at: string;
  updated_at: string;
}

export interface ShipmentResponse {
  id: number;
  order_id: number;
  delivery_type: string;
  logistics_company: string;
  tracking_no: string;
  shipped_at: string;
  estimated_arrival_at?: string | null;
  received_at?: string | null;
}

export interface LogisticsTraceResponse {
  time: string;
  content: string;
}

export interface LogisticsResponse {
  order_id: number;
  delivery_type: string;
  logistics_company: string;
  tracking_no: string;
  shipped_at: string;
  estimated_arrival_at?: string | null;
  received_at?: string | null;
  traces: LogisticsTraceResponse[];
}

export interface CreateAfterSaleRequest {
  order_id: number;
  order_item_id: number;
  type: "refund_only" | "return_refund";
  reason: string;
  description: string;
  images: string[];
}

export type PayChannel = "alipay";
export type PayScene = "page";

export interface PaymentPayParams {
  code_url?: string;
  expires_in?: number;
  method?: "redirect" | "qr_code" | string;
  mode?: "qr_code" | string;
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
  trade_id?: number | null;
  trade_no?: string;
  order_id?: number | null;
  order_no?: string;
  user_id: number;
  merchant_id?: number | null;
  pay_channel: PayChannel;
  pay_scene: PayScene;
  status: number;
  status_text: string;
  amount: number;
  allocations?: Array<{
    order_id: number;
    merchant_id: number;
    amount: number;
  }>;
  transaction_id: string;
  failure_reason: string;
  pay_params?: PaymentPayParams;
  paid_at?: string | null;
  closed_at?: string | null;
}

const API_BASE = "/api/v1";
const AUTH_STORAGE_KEY = "mall_pc_auth";
const AUTH_CHANGE_EVENT = "mall-pc-auth-change";
const AUTH_EXPIRED_EVENT = "mall-pc-auth-expired";

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
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  },
  clear(): void {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  },
  expire(): void {
    this.clear();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  },
  subscribe(listener: (auth: AuthResponse | null) => void): () => void {
    const handleChange = (): void => listener(authStorage.read());
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === AUTH_STORAGE_KEY) {
        handleChange();
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  },
  subscribeExpired(listener: () => void): () => void {
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  }
};

export class ApiError extends Error {
  status: number;
  code: number;

  constructor(message: string, status: number, code: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

let refreshPromise: Promise<AuthResponse> | null = null;

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.code !== 0) {
    throw new ApiError(payload?.message || "请求失败", response.status, payload?.code ?? response.status);
  }

  return payload.data as T;
};

const send = async <T>(path: string, options: RequestInit, accessToken?: string): Promise<T> => {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  return parseResponse<T>(response);
};

export const refreshAuth = (): Promise<AuthResponse> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const auth = authStorage.read();
  if (!auth?.refresh_token) {
    return Promise.reject(new ApiError("登录状态已过期，请重新登录", 401, 401));
  }

  refreshPromise = send<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: auth.refresh_token })
  }).then((nextAuth) => {
    authStorage.write(nextAuth);
    return nextAuth;
  }).catch((error: unknown) => {
    authStorage.expire();
    throw error;
  }).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const request = async <T>(path: string, options: RequestInit = {}, retryUnauthorized = true): Promise<T> => {
  const auth = authStorage.read();
  try {
    return await send<T>(path, options, auth?.access_token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !retryUnauthorized || !auth) {
      throw error;
    }

    if (!auth.refresh_token) {
      authStorage.expire();
      throw error;
    }

    try {
      const nextAuth = await refreshAuth();
      return await send<T>(path, options, nextAuth.access_token);
    } catch (retryError) {
      if (authStorage.read()) {
        authStorage.expire();
      }
      throw retryError;
    }
  }
};
