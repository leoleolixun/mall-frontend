export const merchantApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(/\/$/, "");

const accessTokenKey = "mall_admin_merchant_access_token";
const refreshTokenKey = "mall_admin_merchant_refresh_token";

interface ApiResponse<T> {
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

export interface MerchantUser {
  id: number;
  merchant_id: number;
  merchant_name: string;
  username: string;
  nickname: string;
  role: string;
  permissions: string[];
}

export interface MerchantAuthResponse {
  access_token: string;
  refresh_token: string;
  user: MerchantUser;
}

export interface MerchantDashboardOverview {
  total_products: number;
  on_sale_products: number;
  low_stock_skus: number;
  out_of_stock_skus: number;
  pending_payment_orders: number;
  pending_shipment_orders: number;
  today_paid_orders: number;
  today_paid_amount: number;
  total_paid_orders: number;
  total_paid_amount: number;
  generated_at: string;
}

export interface MerchantSalesTrendItem {
  date: string;
  paid_orders: number;
  paid_amount: number;
}

export interface MerchantTopProduct {
  product_id: number;
  product_name: string;
  paid_orders: number;
  quantity: number;
  sales_amount: number;
}

export interface MerchantDashboardAnalytics {
  start_date: string;
  end_date: string;
  sales_trend: MerchantSalesTrendItem[];
  top_products: MerchantTopProduct[];
  generated_at: string;
}

export interface MerchantCategory {
  id: number;
  merchant_id: number;
  parent_id: number;
  name: string;
  sort: number;
  status: number;
}

export interface MerchantSku {
  id: number;
  merchant_id: number;
  product_id: number;
  name: string;
  image: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  status: number;
}

export interface MerchantProduct {
  id: number;
  merchant_id: number;
  category_id: number;
  name: string;
  cover: string;
  description: string;
  status: number;
  skus: MerchantSku[];
  created_at: string;
  updated_at: string;
}

export interface MerchantOrderItem {
  id: number;
  product_id: number;
  sku_id: number;
  product_name: string;
  sku_name: string;
  sku_image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface MerchantOrder {
  id: number;
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
  remark: string;
  paid_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  items: MerchantOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface MerchantInventoryAlert {
  merchant_id: number;
  product_id: number;
  sku_id: number;
  product_name: string;
  sku_name: string;
  image: string;
  stock: number;
  low_stock_threshold: number;
  severity: string;
  updated_at: string;
}

export interface StoredMerchantAuth {
  accessToken: string;
  refreshToken: string;
}

export const loadStoredMerchantAuth = (): StoredMerchantAuth | undefined => {
  const accessToken = window.localStorage.getItem(accessTokenKey);
  const refreshToken = window.localStorage.getItem(refreshTokenKey);
  if (!accessToken || !refreshToken) return undefined;
  return { accessToken, refreshToken };
};

export const storeMerchantAuth = (auth: MerchantAuthResponse) => {
  window.localStorage.setItem(accessTokenKey, auth.access_token);
  window.localStorage.setItem(refreshTokenKey, auth.refresh_token);
};

export const clearMerchantAuth = () => {
  window.localStorage.removeItem(accessTokenKey);
  window.localStorage.removeItem(refreshTokenKey);
};

const getAccessToken = () => window.localStorage.getItem(accessTokenKey);
const getRefreshToken = () => window.localStorage.getItem(refreshTokenKey);

const buildPath = (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(path, window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  return url.pathname + url.search;
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${merchantApiBaseUrl}/merchant/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const payload = await response.json().catch(() => undefined) as ApiResponse<MerchantAuthResponse> | undefined;
  if (!response.ok || !payload || payload.code !== 0 || !payload.data) {
    clearMerchantAuth();
    return false;
  }
  storeMerchantAuth(payload.data);
  return true;
};

async function apiRequest<T>(path: string, options: RequestInit = {}, retryOnUnauthorized = true): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${merchantApiBaseUrl}${path}`, {
    ...options,
    headers
  });
  const payload = await response.json().catch(() => undefined) as ApiResponse<T> | undefined;
  if (
    retryOnUnauthorized
    && !path.includes("/auth/login")
    && !path.includes("/auth/refresh")
    && (response.status === 401 || payload?.code === 401)
    && await refreshAccessToken()
  ) {
    return apiRequest<T>(path, options, false);
  }
  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(payload?.message || `接口请求失败：${response.status}`);
  }
  return payload.data as T;
}

export const merchantApi = {
  login(username: string, password: string) {
    return apiRequest<MerchantAuthResponse>("/merchant/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  },

  refresh(refreshToken: string) {
    return apiRequest<MerchantAuthResponse>("/merchant/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  },

  me() {
    return apiRequest<MerchantUser>("/merchant/me");
  },

  logout(refreshToken?: string) {
    return apiRequest<Record<string, never>>("/merchant/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken ?? "" })
    });
  },

  dashboardOverview() {
    return apiRequest<MerchantDashboardOverview>("/merchant/dashboard/overview");
  },

  dashboardAnalytics(days = 10, topLimit = 10) {
    return apiRequest<MerchantDashboardAnalytics>(buildPath("/merchant/dashboard/analytics", {
      days,
      top_limit: topLimit
    }));
  },

  products(params: { page?: number; pageSize?: number; keyword?: string; status?: number } = {}) {
    return apiRequest<PageResponse<MerchantProduct>>(buildPath("/merchant/products", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      keyword: params.keyword,
      status: params.status
    }));
  },

  categories() {
    return apiRequest<MerchantCategory[]>("/merchant/categories");
  },

  orders(params: { page?: number; pageSize?: number; status?: number } = {}) {
    return apiRequest<PageResponse<MerchantOrder>>(buildPath("/merchant/orders", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      status: params.status ?? 0
    }));
  },

  inventoryAlerts(params: { page?: number; pageSize?: number; keyword?: string } = {}) {
    return apiRequest<PageResponse<MerchantInventoryAlert>>(buildPath("/merchant/inventory-alerts", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      keyword: params.keyword
    }));
  }
};
