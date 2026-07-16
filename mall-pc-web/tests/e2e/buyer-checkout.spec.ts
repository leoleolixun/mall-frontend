import { expect, test, type Page, type Route } from "@playwright/test";

const user = {
  id: 21,
  nickname: "测试买家",
  avatar: "",
  mobile: "13800000000",
  gender: "unknown",
  birthday: "",
  bio: ""
};

const product = {
  id: 101,
  merchant_id: 1,
  category_id: 10,
  name: "契约测试耳机",
  cover: "",
  min_price: 29900
};

const sku = { id: 1001, name: "黑色", image: "", price: 29900, stock: 8 };
const secondProduct = {
  id: 102,
  merchant_id: 2,
  category_id: 10,
  name: "契约测试键盘",
  cover: "",
  min_price: 19900
};
const secondSku = { id: 1002, name: "标准版", image: "", price: 19900, stock: 6 };
const address = {
  id: 4,
  receiver_name: "测试买家",
  receiver_phone: "13800000000",
  province: "上海市",
  city: "上海市",
  district: "浦东新区",
  detail: "测试路 1 号",
  is_default: true
};

const orderItems = [{
  id: 401,
  product_id: product.id,
  sku_id: sku.id,
  product_name: product.name,
  sku_name: sku.name,
  sku_image: "",
  price: sku.price,
  quantity: 1,
  subtotal: sku.price,
  discount_amount: 0,
  payable_amount: sku.price
}];

const secondOrderItems = [{
  id: 402,
  product_id: secondProduct.id,
  sku_id: secondSku.id,
  product_name: secondProduct.name,
  sku_name: secondSku.name,
  sku_image: "",
  price: secondSku.price,
  quantity: 1,
  subtotal: secondSku.price,
  discount_amount: 1000,
  payable_amount: secondSku.price - 1000
}];

const order = (merchantId: 1 | 2) => ({
  id: merchantId === 1 ? 901 : 902,
  trade_id: 801,
  order_no: merchantId === 1 ? "O202607160901" : "O202607160902",
  user_id: user.id,
  merchant_id: merchantId,
  merchant_name: merchantId === 1 ? "契约测试商户" : "第二契约商户",
  status: 1,
  status_text: "待支付",
  receiver_name: address.receiver_name,
  receiver_phone: address.receiver_phone,
  receiver_address: `${address.province}${address.city}${address.district}${address.detail}`,
  goods_amount: merchantId === 1 ? sku.price : secondSku.price,
  freight_amount: 0,
  discount_amount: 1000,
  payable_amount: (merchantId === 1 ? sku.price : secondSku.price) - 1000,
  user_coupon_id: merchantId === 1 ? 301 : 302,
  remark: "PC 端下单",
  paid_at: null,
  cancelled_at: null,
  completed_at: null,
  items: merchantId === 1 ? orderItems.map((item) => ({ ...item, discount_amount: 1000, payable_amount: item.subtotal - 1000 })) : secondOrderItems,
  shipment: null,
  created_at: "2026-07-16T11:59:00+08:00",
  updated_at: "2026-07-16T12:00:00+08:00"
});

const installApiFixture = async (page: Page) => {
  let quantity = 0;
  let created = false;
  let previewCount = 0;
  const requests: Array<{ method: string; path: string; body?: unknown }> = [];
  const unknown: string[] = [];

  const fulfill = (route: Route, data: unknown, status = 200) => route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ code: status < 400 ? 0 : 40400, message: status < 400 ? "ok" : "fixture route not found", data })
  });

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/v1/, "");
    const method = request.method();
    const body = request.postDataJSON?.();
    requests.push({ method, path, body });

    if (method === "GET" && path === "/categories") return fulfill(route, [{ id: 10, name: "数码家电", sort: 100 }]);
    if (method === "GET" && path === "/products") return fulfill(route, { list: [product], page: 1, page_size: Number(url.searchParams.get("page_size") || 50), total: 1 });
    if (method === "GET" && path === "/products/101") return fulfill(route, { ...product, description: "端到端测试商品", skus: [sku] });
    if (method === "POST" && path === "/auth/login/password") return fulfill(route, { access_token: "access-test", refresh_token: "refresh-test", user });
    if (method === "GET" && path === "/me") return fulfill(route, user);
    if (method === "GET" && path === "/addresses") return fulfill(route, [address]);
    if (method === "GET" && path === "/coupons") return fulfill(route, []);
    if (method === "GET" && path === "/me/coupons") return fulfill(route, [
      { id: 301, status: 1, status_text: "未使用", coupon: { id: 201, merchant_id: 1, name: "耳机券", threshold_amount: 0, discount_amount: 1000 } },
      { id: 302, status: 1, status_text: "未使用", coupon: { id: 202, merchant_id: 2, name: "键盘券", threshold_amount: 0, discount_amount: 1000 } }
    ]);
    if (method === "GET" && path === "/favorites/products") return fulfill(route, { list: [], page: 1, page_size: 50, total: 0 });
    if (method === "GET" && path === "/after-sales") return fulfill(route, { list: [], page: 1, page_size: 50, total: 0 });
    if (method === "GET" && path === "/orders") return fulfill(route, { list: created ? [order(1), order(2)] : [], page: 1, page_size: 20, total: created ? 2 : 0 });
    if (method === "GET" && path === "/orders/901") return fulfill(route, order(1));
    if (method === "POST" && path === "/cart/items") {
      quantity += Number((body as { quantity?: number })?.quantity || 0);
      return fulfill(route, {});
    }
    if (method === "GET" && path === "/cart/items") {
      return fulfill(route, quantity > 0 ? [
        {
          merchant_id: 1,
          merchant_name: "契约测试商户",
          merchant_logo: "",
          product_id: product.id,
          sku_id: sku.id,
          product_name: product.name,
          sku_name: sku.name,
          sku_image: "",
          price: sku.price,
          quantity,
          subtotal: sku.price * quantity,
          stock: sku.stock,
          available: true,
          message: ""
        },
        {
          merchant_id: 2,
          merchant_name: "第二契约商户",
          merchant_logo: "",
          product_id: secondProduct.id,
          sku_id: secondSku.id,
          product_name: secondProduct.name,
          sku_name: secondSku.name,
          sku_image: "",
          price: secondSku.price,
          quantity: 1,
          subtotal: secondSku.price,
          stock: secondSku.stock,
          available: true,
          message: ""
        }
      ] : []);
    }
    if (method === "POST" && path === "/trades/preview") {
      previewCount += 1;
      const selections = new Map(((body as { merchant_coupons?: Array<{ merchant_id: number; user_coupon_id: number }> })?.merchant_coupons ?? [])
        .map((item) => [item.merchant_id, item.user_coupon_id]));
      const firstDiscount = selections.has(1) ? 1000 : 0;
      const secondDiscount = selections.has(2) ? 1000 : 0;
      return fulfill(route, {
      idempotency_token: `preview-token-${previewCount}`,
      address,
      merchant_groups: [
        { merchant_id: 1, merchant_name: "契约测试商户", merchant_logo: "", items: orderItems, goods_amount: sku.price, freight_amount: 0, discount_amount: firstDiscount, payable_amount: sku.price - firstDiscount, user_coupon_id: selections.get(1) ?? 0 },
        { merchant_id: 2, merchant_name: "第二契约商户", merchant_logo: "", items: secondOrderItems, goods_amount: secondSku.price, freight_amount: 0, discount_amount: secondDiscount, payable_amount: secondSku.price - secondDiscount, user_coupon_id: selections.get(2) ?? 0 }
      ],
      goods_amount: sku.price + secondSku.price,
      freight_amount: 0,
      discount_amount: firstDiscount + secondDiscount,
      payable_amount: sku.price + secondSku.price - firstDiscount - secondDiscount
    });
    }
    if (method === "POST" && path === "/trades") {
      created = true;
      quantity = 0;
      return fulfill(route, {
        id: 801,
        trade_no: "T202607160801",
        user_id: user.id,
        status: 1,
        status_text: "待支付",
        goods_amount: sku.price + secondSku.price,
        freight_amount: 0,
        discount_amount: 2000,
        payable_amount: sku.price + secondSku.price - 2000,
        orders: [order(1), order(2)],
        created_at: "2026-07-16T11:59:00+08:00",
        updated_at: "2026-07-16T11:59:00+08:00"
      });
    }
    if (method === "POST" && path === "/payments") {
      return fulfill(route, {
        id: 1001,
        payment_no: "P202607160001",
        trade_id: 801,
        trade_no: "T202607160801",
        user_id: user.id,
        pay_channel: "alipay",
        pay_scene: "page",
        status: 1,
        status_text: "待支付",
        amount: sku.price + secondSku.price - 2000,
        allocations: [
          { order_id: 901, merchant_id: 1, amount: sku.price - 1000 },
          { order_id: 902, merchant_id: 2, amount: secondSku.price - 1000 }
        ],
        transaction_id: "",
        failure_reason: "",
        pay_params: { provider: "alipay", scene: "page" },
        paid_at: null,
        closed_at: null
      });
    }

    unknown.push(`${method} ${path}`);
    return fulfill(route, {}, 404);
  });

  return { requests, unknown };
};

test("买家完成登录、跨商户购物车和原子创建交易", async ({ page }) => {
  const fixture = await installApiFixture(page);

  await page.goto("/login");
  await page.getByPlaceholder("请输入用户名").fill("buyer_fixture");
  await page.getByPlaceholder("请输入密码").fill("test-password");
  await page.locator("form").getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("button", { name: /测试买家/ })).toBeVisible();

  await page.getByRole("button", { name: "分类", exact: true }).click();
  await expect(page.getByText(product.name, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "加购" }).click();
  await expect(page.getByRole("status")).toContainText("已加入购物车");
  await page.locator(".cart-entry").click();
  await expect(page.getByRole("heading", { name: "购物车" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "契约测试商户" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "第二契约商户" })).toBeVisible();
  await page.getByRole("button", { name: "去结算" }).click();

  const couponSelects = page.getByLabel("店铺优惠券");
  await expect(couponSelects).toHaveCount(2);
  await couponSelects.nth(0).selectOption("301");
  await couponSelects.nth(1).selectOption("302");
  const submitTrade = page.getByRole("button", { name: "提交交易", exact: true });
  await expect(submitTrade).toBeEnabled();
  await submitTrade.click();

  await expect(page).toHaveURL(/\/payment$/);
  await expect(page.getByRole("heading", { name: "交易支付" })).toBeVisible();
  await expect(page.getByText("T202607160801", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "去支付", exact: true }).click();
  await expect(page.getByRole("heading", { name: "支付单已创建" })).toBeVisible();

  const previews = fixture.requests.filter((request) => request.method === "POST" && request.path === "/trades/preview");
  const createRequest = fixture.requests.find((request) => request.method === "POST" && request.path === "/trades");
  const paymentRequest = fixture.requests.find((request) => request.method === "POST" && request.path === "/payments");
  const createIndex = fixture.requests.findIndex((request) => request.method === "POST" && request.path === "/trades");
  const previewsBeforeCreate = fixture.requests.slice(0, createIndex)
    .filter((request) => request.method === "POST" && request.path === "/trades/preview");
  expect(previews.length).toBeGreaterThanOrEqual(4);
  expect(createRequest?.body).toEqual(expect.objectContaining({
    idempotency_token: `preview-token-${previewsBeforeCreate.length}`,
    merchant_coupons: [
      { merchant_id: 1, user_coupon_id: 301 },
      { merchant_id: 2, user_coupon_id: 302 }
    ]
  }));
  expect(paymentRequest?.body).toEqual({ trade_id: 801, pay_channel: "alipay", pay_scene: "page" });
  expect(fixture.requests.some((request) => request.path === "/orders/preview" || request.path === "/orders" && request.method === "POST")).toBe(false);
  expect(fixture.unknown).toEqual([]);
});
