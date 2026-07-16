import http from "node:http";

const port = Number(process.env.PORT || 8080);
const requests = [];
let currentRole = "owner";

const permissionSets = {
  owner: ["dashboard:read", "order:read", "order:ship", "catalog:read", "catalog:write", "inventory:read", "inventory:write", "upload:write", "account:read", "account:write", "customer:read", "after_sale:read", "after_sale:write", "marketing:read", "marketing:write", "settlement:read"],
  admin: ["dashboard:read", "order:read", "order:ship", "catalog:read", "catalog:write", "inventory:read", "inventory:write", "upload:write", "account:read", "account:write", "customer:read", "after_sale:read", "after_sale:write", "marketing:read", "marketing:write", "settlement:read"],
  operator: ["dashboard:read", "order:read", "order:ship", "catalog:read", "catalog:write", "inventory:read", "inventory:write", "upload:write", "customer:read", "after_sale:read", "after_sale:write", "marketing:read", "marketing:write"],
  sales: ["dashboard:read", "order:read", "catalog:read", "customer:read", "after_sale:read", "marketing:read", "marketing:write"],
  warehouse: ["order:read", "order:ship", "catalog:read", "inventory:read", "inventory:write", "after_sale:read"]
};

const roles = Object.entries(permissionSets).map(([role, permissions], index) => ({
  role,
  name: { owner: "店主", admin: "管理员", operator: "运营人员", sales: "销售人员", warehouse: "库管人员" }[role],
  description: "本地契约测试角色",
  permissions,
  member_count: index + 1
}));

const user = () => ({
  id: 11,
  merchant_id: 1,
  merchant_name: "契约测试商户",
  username: `${currentRole}_fixture`,
  nickname: `${roles.find((item) => item.role === currentRole)?.name}测试账号`,
  role: currentRole,
  permissions: permissionSets[currentRole]
});

const product = {
  id: 101,
  merchant_id: 1,
  category_id: 10,
  name: "契约测试耳机",
  cover: "https://example.com/product.jpg",
  description: "用于管理端浏览器验收",
  status: 1,
  skus: [
    { id: 1001, merchant_id: 1, product_id: 101, name: "黑色", image: "", price: 29900, stock: 8, low_stock_threshold: 10, status: 1 },
    { id: 1002, merchant_id: 1, product_id: 101, name: "白色", image: "", price: 30900, stock: 20, low_stock_threshold: 5, status: 1 }
  ],
  created_at: "2026-07-10T08:00:00+08:00",
  updated_at: "2026-07-16T08:00:00+08:00"
};

const order = {
  id: 301,
  order_no: "O202607160001",
  user_id: 21,
  merchant_id: 1,
  merchant_name: "契约测试商户",
  status: 2,
  status_text: "待发货",
  receiver_name: "测试买家",
  receiver_phone: "13800000000",
  receiver_address: "上海市浦东新区测试路 1 号",
  goods_amount: 29900,
  freight_amount: 0,
  discount_amount: 1000,
  payable_amount: 28900,
  remark: "浏览器验收订单",
  paid_at: "2026-07-16T09:00:00+08:00",
  items: [{ id: 401, product_id: 101, sku_id: 1001, product_name: "契约测试耳机", sku_name: "黑色", sku_image: "", price: 29900, quantity: 1, subtotal: 29900, discount_amount: 1000, payable_amount: 28900 }],
  created_at: "2026-07-16T08:55:00+08:00",
  updated_at: "2026-07-16T09:00:00+08:00"
};

const afterSales = [
  {
    id: 501, after_sale_no: "AS202607160001", order_id: 301, order_no: order.order_no, order_item_id: 401,
    product_name: "契约测试耳机", sku_name: "黑色", sku_image: "", user_id: 21, merchant_id: 1,
    type: "refund_only", type_text: "仅退款", status: 1, status_text: "待商家审核", reason: "商品有瑕疵",
    description: "外壳有划痕", images: ["https://example.com/evidence.jpg"], refund_amount: 28900, reject_reason: "",
    created_at: "2026-07-16T10:00:00+08:00", updated_at: "2026-07-16T10:00:00+08:00"
  },
  {
    id: 502, after_sale_no: "AS202607160002", order_id: 301, order_no: order.order_no, order_item_id: 401,
    product_name: "契约测试耳机", sku_name: "黑色", sku_image: "", user_id: 21, merchant_id: 1,
    type: "refund_only", type_text: "仅退款", status: 2, status_text: "退款处理中", reason: "少发配件", description: "",
    images: [], refund_amount: 28900, reject_reason: "", created_at: "2026-07-16T11:00:00+08:00", updated_at: "2026-07-16T11:00:00+08:00",
    refund: { refund_no: "R202607160001", pay_channel: "alipay", amount: 28900, status: 4, status_text: "退款结果确认中", transaction_id: "", failure_reason: "", last_error: "网关结果未知", retry_count: 1 }
  }
];

const settlementEntries = [
  { id: 901, entry_no: "SALE-301", merchant_id: 1, order_id: 301, entry_type: "sale", amount: 28900, available_at: "2026-07-17T09:00:00+08:00", settlement_id: 1001, created_at: "2026-07-16T09:00:00+08:00" },
  { id: 902, entry_no: "COMMISSION-301", merchant_id: 1, order_id: 301, entry_type: "commission", amount: -1445, available_at: "2026-07-17T09:00:00+08:00", settlement_id: 1001, created_at: "2026-07-16T09:00:00+08:00" },
  { id: 903, entry_no: "REFUND-701", merchant_id: 1, order_id: 301, refund_id: 701, entry_type: "refund", amount: -2890, available_at: "2026-07-18T09:00:00+08:00", created_at: "2026-07-17T09:00:00+08:00" }
];

const settlement = {
  id: 1001,
  settlement_no: "S202607160001",
  merchant_id: 1,
  period_start: "2026-07-01T00:00:00+08:00",
  period_end: "2026-07-16T23:59:59+08:00",
  gross_amount: 28900,
  commission_amount: 1445,
  refund_amount: 0,
  net_amount: 27455,
  status: 1,
  status_text: "待确认",
  created_at: "2026-07-16T23:59:59+08:00",
  updated_at: "2026-07-16T23:59:59+08:00"
};

const page = (list, url) => ({
  list,
  page: Number(url.searchParams.get("page") || 1),
  page_size: Number(url.searchParams.get("page_size") || 20),
  total: list.length
});

const readBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text || !request.headers["content-type"]?.includes("application/json")) return text;
  try { return JSON.parse(text); } catch { return text; }
};

const success = (response, data = {}) => {
  response.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  response.end(JSON.stringify({ code: 0, message: "ok", data }));
};

const notFound = (response) => {
  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ code: 40400, message: "fixture route not found" }));
};

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" });
    response.end();
    return;
  }
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
  const path = url.pathname.replace(/^\/api\/v1/, "");
  const body = await readBody(request);
  requests.push({ method: request.method, path, query: Object.fromEntries(url.searchParams), body });

  if (path === "/__requests") return success(response, requests);
  if (path === "/__reset" && request.method === "POST") { requests.length = 0; return success(response); }
  if (path === "/merchant/auth/login" && request.method === "POST") {
    const requestedRole = String(body?.username || "").split("_")[0];
    currentRole = permissionSets[requestedRole] ? requestedRole : "owner";
    return success(response, { access_token: `access-${currentRole}`, refresh_token: `refresh-${currentRole}`, user: user() });
  }
  if (path === "/merchant/auth/refresh" && request.method === "POST") return success(response, { access_token: `access-${currentRole}`, refresh_token: `refresh-${currentRole}`, user: user() });
  if (path === "/merchant/auth/logout" && request.method === "POST") return success(response);
  if (path === "/merchant/me") return success(response, user());
  if (path === "/merchant/dashboard/overview") return success(response, { total_products: 1, on_sale_products: 1, low_stock_skus: 1, out_of_stock_skus: 0, pending_payment_orders: 2, pending_shipment_orders: 1, today_paid_orders: 3, today_paid_amount: 86700, total_paid_orders: 15, total_paid_amount: 433500, generated_at: "2026-07-16T12:00:00+08:00" });
  if (path === "/merchant/dashboard/analytics") return success(response, { start_date: "2026-07-07", end_date: "2026-07-16", sales_trend: [{ date: "2026-07-15", paid_orders: 2, paid_amount: 57800 }, { date: "2026-07-16", paid_orders: 3, paid_amount: 86700 }], top_products: [{ product_id: 101, product_name: product.name, paid_orders: 3, quantity: 3, sales_amount: 86700 }], generated_at: "2026-07-16T12:00:00+08:00" });
  if (path === "/merchant/categories" && request.method === "GET") return success(response, [{ id: 10, merchant_id: 1, parent_id: 0, name: "数码家电", sort: 100, status: 1 }]);
  if (path === "/merchant/categories" || /^\/merchant\/categories\/\d+$/.test(path)) return success(response, { id: 10, merchant_id: 1, parent_id: 0, name: body?.name || "数码家电", sort: 100, status: 1 });
  if (path === "/merchant/products" && request.method === "GET") return success(response, page([product], url));
  if (path === "/merchant/products" && request.method === "POST") return success(response, product);
  if (path === "/merchant/products/101" && request.method === "GET") return success(response, product);
  if (/^\/merchant\/products\/101(?:\/on-sale|\/off-sale)?$/.test(path)) return success(response, product);
  if (/^\/merchant\/products\/101\/skus(?:\/\d+)?$/.test(path)) return success(response, product.skus[0]);
  if (path === "/merchant/inventory-alerts") return success(response, page([{ merchant_id: 1, product_id: 101, sku_id: 1001, product_name: product.name, sku_name: "黑色", image: "", stock: 8, low_stock_threshold: 10, severity: "low_stock", updated_at: product.updated_at }], url));
  if (path === "/merchant/inventory-logs") return success(response, page([{ id: 601, merchant_id: 1, product_id: 101, sku_id: 1001, product_name: product.name, sku_name: "黑色", change_type: "merchant_adjustment", quantity: 3, before_stock: 5, after_stock: 8, reference_type: "sku", reference_id: 1001, operator_type: "merchant", operator_id: 11, remark: "采购入库", created_at: "2026-07-16T08:30:00+08:00" }], url));
  if (/^\/merchant\/inventory\/skus\/\d+\/stock$/.test(path)) return success(response, { sku_id: 1001, stock: body?.stock ?? 8, low_stock_threshold: body?.low_stock_threshold ?? 10 });
  if (path === "/merchant/orders") return success(response, page([order], url));
  if (path === "/merchant/orders/301" && request.method === "GET") return success(response, order);
  if (path === "/merchant/orders/301/ship" && request.method === "POST") return success(response, { ...order, status: 3, status_text: "已发货", shipment: { id: 701, order_id: 301, delivery_type: body.delivery_type, logistics_company: body.logistics_company || "商家配送", tracking_no: body.tracking_no || "", shipped_at: "2026-07-16T12:00:00+08:00" } });
  if (path === "/merchant/after-sales") return success(response, page(afterSales, url));
  if (/^\/merchant\/after-sales\/\d+\/(approve|reject)$/.test(path)) return success(response, afterSales[0]);
  if (/^\/merchant\/after-sales\/\d+\/refund\/sync$/.test(path)) return success(response, { ...afterSales[1], status: 3, status_text: "退款成功" });
  if (path === "/merchant/coupons" && request.method === "GET") return success(response, page([{ id: 801, name: "满 100 减 10", threshold_amount: 10000, discount_amount: 1000, total_quantity: 100, claimed_quantity: 20, used_quantity: 8, per_user_limit: 1, status: 1, status_text: "发放中", start_at: "2026-07-01T00:00:00+08:00", end_at: "2026-08-01T00:00:00+08:00" }], url));
  if (path === "/merchant/coupons" || /^\/merchant\/coupons\/\d+$/.test(path)) return success(response, { id: 801, ...body, claimed_quantity: 20, used_quantity: 8, status_text: "发放中" });
  if (path === "/merchant/settlement-entries") {
    const entryType = url.searchParams.get("entry_type");
    return success(response, page(entryType ? settlementEntries.filter((item) => item.entry_type === entryType) : settlementEntries, url));
  }
  if (path === "/merchant/settlements") {
    const status = Number(url.searchParams.get("status") || 0);
    return success(response, page(status > 0 && settlement.status !== status ? [] : [settlement], url));
  }
  if (path === "/merchant/settlements/1001") return success(response, { ...settlement, entries: settlementEntries.filter((item) => item.settlement_id === settlement.id) });
  if (path === "/merchant/accounts") return success(response, page([{ id: 11, merchant_id: 1, username: "owner_fixture", nickname: "店主测试账号", role: "owner", role_name: "店主", status: 1, last_login_at: "2026-07-16T08:00:00+08:00", created_at: "2026-07-01T08:00:00+08:00", updated_at: "2026-07-16T08:00:00+08:00" }], url));
  if (path === "/merchant/roles") return success(response, roles);
  if (path === "/merchant/accounts" || /^\/merchant\/accounts\/\d+(?:\/password)?$/.test(path)) return success(response, {});
  if (path === "/merchant/customers/overview") return success(response, { total_customers: 1, repeat_customers: 1, repeat_rate_bps: 10000, new_customers_30d: 1, active_customers_30d: 1, total_paid_amount: 57800, average_paid_amount: 57800, generated_at: "2026-07-16T12:00:00+08:00" });
  if (path === "/merchant/customers") return success(response, page([{ user_id: 21, nickname: "测试买家", avatar: "", mobile_masked: "138****0000", user_status: 1, paid_orders: 2, total_paid_amount: 57800, first_paid_at: "2026-07-10T08:00:00+08:00", last_paid_at: "2026-07-16T09:00:00+08:00", registered_at: "2026-07-01T08:00:00+08:00", is_repeat: true }], url));
  if (path === "/merchant/customers/21") return success(response, { customer: { user_id: 21, nickname: "测试买家", avatar: "", mobile_masked: "138****0000", user_status: 1, paid_orders: 2, total_paid_amount: 57800, first_paid_at: "2026-07-10T08:00:00+08:00", last_paid_at: "2026-07-16T09:00:00+08:00", registered_at: "2026-07-01T08:00:00+08:00", is_repeat: true }, recent_orders: [order] });
  return notFound(response);
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`merchant fixture listening on http://127.0.0.1:${port}\n`);
});
