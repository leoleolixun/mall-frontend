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

export interface MerchantAccount {
  id: number;
  merchant_id: number;
  username: string;
  nickname: string;
  role: string;
  role_name: string;
  status: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MerchantAccountCreateRequest {
  username: string;
  password: string;
  nickname: string;
  role: string;
  status?: number;
}

export interface MerchantAccountUpdateRequest {
  nickname: string;
  role: string;
  status: number;
}

export interface MerchantRole {
  role: string;
  name: string;
  description: string;
  permissions: string[];
  member_count: number;
}

export interface MerchantCustomerOverview {
  total_customers: number;
  repeat_customers: number;
  repeat_rate_bps: number;
  new_customers_30d: number;
  active_customers_30d: number;
  total_paid_amount: number;
  average_paid_amount: number;
  generated_at: string;
}

export interface MerchantCustomer {
  user_id: number;
  nickname: string;
  avatar: string;
  mobile_masked: string;
  user_status: number;
  paid_orders: number;
  total_paid_amount: number;
  first_paid_at: string;
  last_paid_at: string;
  registered_at: string;
  is_repeat: boolean;
}

export interface MerchantCustomerOrder {
  id: number;
  order_no: string;
  status: number;
  status_text: string;
  payable_amount: number;
  paid_at?: string;
  created_at: string;
}

export interface MerchantCustomerDetail {
  customer: MerchantCustomer;
  recent_orders: MerchantCustomerOrder[];
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

export interface MerchantCategoryRequest {
  parent_id: number;
  name: string;
  sort: number;
  status?: number;
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

export interface MerchantSkuRequest {
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

export interface MerchantProductRequest {
  category_id: number;
  name: string;
  cover: string;
  description: string;
  status?: number;
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
  discount_amount: number;
  payable_amount: number;
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
  shipment?: MerchantShipment;
}

export interface MerchantShipment {
  id: number;
  order_id: number;
  delivery_type: string;
  logistics_company: string;
  tracking_no: string;
  shipped_at: string;
  estimated_arrival_at?: string;
  received_at?: string;
}

export interface MerchantInventoryLog {
  id: number;
  merchant_id: number;
  product_id: number;
  sku_id: number;
  product_name: string;
  sku_name: string;
  change_type: string;
  quantity: number;
  before_stock: number;
  after_stock: number;
  reference_type: string;
  reference_id: number;
  operator_type: string;
  operator_id: number;
  remark: string;
  created_at: string;
}

export interface MerchantRefund {
  refund_no: string;
  pay_channel: string;
  amount: number;
  status: number;
  status_text: string;
  transaction_id: string;
  failure_reason: string;
  last_error: string;
  retry_count: number;
  last_attempt_at?: string;
  next_retry_at?: string;
  refunded_at?: string;
}

export interface MerchantAfterSale {
  id: number;
  after_sale_no: string;
  order_id: number;
  order_no: string;
  order_item_id: number;
  product_name: string;
  sku_name: string;
  sku_image: string;
  user_id: number;
  type: string;
  type_text: string;
  status: number;
  status_text: string;
  reason: string;
  description: string;
  images: string[];
  refund_amount: number;
  reject_reason: string;
  reviewed_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
  refund?: MerchantRefund;
}

export interface MerchantCoupon {
  id: number;
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
}

export interface MerchantCouponRequest {
  name: string;
  threshold_amount: number;
  discount_amount: number;
  total_quantity: number;
  per_user_limit: number;
  status: number;
  start_at: string;
  end_at: string;
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

export interface MerchantSettlementEntry {
  id: number;
  entry_no: string;
  merchant_id: number;
  order_id?: number;
  refund_id?: number;
  entry_type: string;
  amount: number;
  available_at: string;
  settlement_id?: number;
  created_at: string;
}

export interface MerchantSettlement {
  id: number;
  settlement_no: string;
  merchant_id: number;
  period_start: string;
  period_end: string;
  gross_amount: number;
  commission_amount: number;
  refund_amount: number;
  net_amount: number;
  status: number;
  status_text: string;
  confirmed_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  entries?: MerchantSettlementEntry[];
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

const merchantAuthExpiredEvent = "mall:merchant-auth-expired";

const expireMerchantAuth = () => {
  clearMerchantAuth();
  window.dispatchEvent(new Event(merchantAuthExpiredEvent));
};

export const subscribeMerchantAuthExpired = (listener: () => void) => {
  window.addEventListener(merchantAuthExpiredEvent, listener);
  return () => window.removeEventListener(merchantAuthExpiredEvent, listener);
};

const getAccessToken = () => window.localStorage.getItem(accessTokenKey);
const getRefreshToken = () => window.localStorage.getItem(refreshTokenKey);

const buildPath = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
  const url = new URL(path, window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  return url.pathname + url.search;
};

let refreshAccessTokenRequest: Promise<boolean> | undefined;

const performAccessTokenRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${merchantApiBaseUrl}/merchant/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const payload = await response.json().catch(() => undefined) as ApiResponse<MerchantAuthResponse> | undefined;
  if (!response.ok || !payload || payload.code !== 0 || !payload.data) {
    expireMerchantAuth();
    return false;
  }
  storeMerchantAuth(payload.data);
  return true;
};

const refreshAccessToken = () => {
  if (!refreshAccessTokenRequest) {
    refreshAccessTokenRequest = performAccessTokenRefresh().finally(() => {
      refreshAccessTokenRequest = undefined;
    });
  }
  return refreshAccessTokenRequest;
};

async function apiRequest<T>(path: string, options: RequestInit = {}, retryOnUnauthorized = true): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

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
    const retryOptions = path.endsWith("/auth/logout")
      ? { ...options, body: JSON.stringify({ refresh_token: getRefreshToken() ?? "" }) }
      : options;
    return apiRequest<T>(path, retryOptions, false);
  }
  if (!response.ok || !payload || payload.code !== 0) {
    if (
      !path.includes("/auth/login")
      && !path.includes("/auth/refresh")
      && (response.status === 401 || payload?.code === 401)
    ) {
      expireMerchantAuth();
    }
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

  createCategory(payload: MerchantCategoryRequest) {
    return apiRequest<MerchantCategory>("/merchant/categories", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateCategory(id: number, payload: MerchantCategoryRequest) {
    return apiRequest<MerchantCategory>(`/merchant/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },

  deleteCategory(id: number) {
    return apiRequest<Record<string, never>>(`/merchant/categories/${id}`, { method: "DELETE" });
  },

  orders(params: { page?: number; pageSize?: number; status?: number; keyword?: string } = {}) {
    return apiRequest<PageResponse<MerchantOrder>>(buildPath("/merchant/orders", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      status: params.status ?? 0,
      keyword: params.keyword
    }));
  },

  orderDetail(id: number) {
    return apiRequest<MerchantOrder>(`/merchant/orders/${id}`);
  },

  shipOrder(id: number, payload: { delivery_type: string; logistics_company: string; tracking_no: string; estimated_arrival_at?: string }) {
    return apiRequest<MerchantOrder>(`/merchant/orders/${id}/ship`, { method: "POST", body: JSON.stringify(payload) });
  },

  inventoryAlerts(params: { page?: number; pageSize?: number; keyword?: string } = {}) {
    return apiRequest<PageResponse<MerchantInventoryAlert>>(buildPath("/merchant/inventory-alerts", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      keyword: params.keyword
    }));
  },

  inventoryLogs(params: { page?: number; pageSize?: number; productId?: number; skuId?: number; changeType?: string } = {}) {
    return apiRequest<PageResponse<MerchantInventoryLog>>(buildPath("/merchant/inventory-logs", { page: params.page ?? 1, page_size: params.pageSize ?? 20, product_id: params.productId, sku_id: params.skuId, change_type: params.changeType }));
  },

  adjustStock(skuId: number, payload: { stock?: number; low_stock_threshold?: number; remark: string }) {
    return apiRequest<{ sku_id: number; stock: number }>(`/merchant/inventory/skus/${skuId}/stock`, { method: "PUT", body: JSON.stringify(payload) });
  },

  createProduct(payload: MerchantProductRequest) {
    return apiRequest<MerchantProduct>("/merchant/products", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  productDetail(id: number) { return apiRequest<MerchantProduct>(`/merchant/products/${id}`); },
  updateProduct(id: number, payload: MerchantProductRequest) { return apiRequest<MerchantProduct>(`/merchant/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }); },
  deleteProduct(id: number) { return apiRequest<Record<string, never>>(`/merchant/products/${id}`, { method: "DELETE" }); },
  setProductOnSale(id: number) { return apiRequest<MerchantProduct>(`/merchant/products/${id}/on-sale`, { method: "POST" }); },
  setProductOffSale(id: number) { return apiRequest<MerchantProduct>(`/merchant/products/${id}/off-sale`, { method: "POST" }); },
  createSku(productId: number, payload: MerchantSkuRequest) { return apiRequest<MerchantSku>(`/merchant/products/${productId}/skus`, { method: "POST", body: JSON.stringify(payload) }); },
  updateSku(productId: number, skuId: number, payload: MerchantSkuRequest) { return apiRequest<MerchantSku>(`/merchant/products/${productId}/skus/${skuId}`, { method: "PUT", body: JSON.stringify(payload) }); },
  deleteSku(productId: number, skuId: number) { return apiRequest<Record<string, never>>(`/merchant/products/${productId}/skus/${skuId}`, { method: "DELETE" }); },

  uploadImage(file: File, scene = "product") {
    const form = new FormData(); form.append("file", file); form.append("scene", scene);
    return apiRequest<{ url: string; key: string; size: number; content_type: string }>("/merchant/uploads", { method: "POST", body: form });
  },

  afterSales(params: { page?: number; pageSize?: number; status?: number } = {}) {
    return apiRequest<PageResponse<MerchantAfterSale>>(buildPath("/merchant/after-sales", { page: params.page ?? 1, page_size: params.pageSize ?? 20, status: params.status ?? 0 }));
  },
  approveAfterSale(id: number) { return apiRequest<MerchantAfterSale>(`/merchant/after-sales/${id}/approve`, { method: "POST" }); },
  syncAfterSaleRefund(id: number) { return apiRequest<MerchantAfterSale>(`/merchant/after-sales/${id}/refund/sync`, { method: "POST" }); },
  rejectAfterSale(id: number, reason: string) { return apiRequest<MerchantAfterSale>(`/merchant/after-sales/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }); },

  coupons(params: { page?: number; pageSize?: number; status?: number } = {}) {
    return apiRequest<PageResponse<MerchantCoupon>>(buildPath("/merchant/coupons", { page: params.page ?? 1, page_size: params.pageSize ?? 20, status: params.status ?? -1 }));
  },
  createCoupon(payload: MerchantCouponRequest) { return apiRequest<MerchantCoupon>("/merchant/coupons", { method: "POST", body: JSON.stringify(payload) }); },
  updateCoupon(id: number, payload: MerchantCouponRequest) { return apiRequest<MerchantCoupon>(`/merchant/coupons/${id}`, { method: "PUT", body: JSON.stringify(payload) }); },

  settlementEntries(params: { page?: number; pageSize?: number; entryType?: string } = {}) {
    return apiRequest<PageResponse<MerchantSettlementEntry>>(buildPath("/merchant/settlement-entries", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      entry_type: params.entryType
    }));
  },

  settlements(params: { page?: number; pageSize?: number; status?: number } = {}) {
    return apiRequest<PageResponse<MerchantSettlement>>(buildPath("/merchant/settlements", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      status: params.status ?? 0
    }));
  },

  settlementDetail(id: number) {
    return apiRequest<MerchantSettlement>(`/merchant/settlements/${id}`);
  },

  accounts(params: { page?: number; pageSize?: number; keyword?: string; role?: string; status?: number } = {}) {
    return apiRequest<PageResponse<MerchantAccount>>(buildPath("/merchant/accounts", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      keyword: params.keyword,
      role: params.role,
      status: params.status
    }));
  },

  createAccount(payload: MerchantAccountCreateRequest) {
    return apiRequest<MerchantAccount>("/merchant/accounts", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateAccount(accountId: number, payload: MerchantAccountUpdateRequest) {
    return apiRequest<MerchantAccount>(`/merchant/accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  resetAccountPassword(accountId: number, password: string) {
    return apiRequest<Record<string, never>>(`/merchant/accounts/${accountId}/password`, {
      method: "PUT",
      body: JSON.stringify({ password })
    });
  },

  roles() {
    return apiRequest<MerchantRole[]>("/merchant/roles");
  },

  customerOverview() {
    return apiRequest<MerchantCustomerOverview>("/merchant/customers/overview");
  },

  customers(params: { page?: number; pageSize?: number; keyword?: string; repeatOnly?: boolean } = {}) {
    return apiRequest<PageResponse<MerchantCustomer>>(buildPath("/merchant/customers", {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      keyword: params.keyword,
      repeat_only: params.repeatOnly === undefined ? undefined : String(params.repeatOnly)
    }));
  },

  customerDetail(userId: number) {
    return apiRequest<MerchantCustomerDetail>(`/merchant/customers/${userId}`);
  }
};
