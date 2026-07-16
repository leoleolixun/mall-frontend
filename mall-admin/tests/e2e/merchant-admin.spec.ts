import { expect, test, type Page } from "@playwright/test";

const loginAs = async (page: Page, role: "owner" | "sales" | "warehouse", initialPage: string) => {
  await page.goto(`?page=${initialPage}`);
  const dialog = page.getByRole("dialog", { name: "账号与接口" });
  await dialog.getByPlaceholder("商户账号").fill(`${role}_fixture`);
  await dialog.getByPlaceholder("商户密码").fill("test-password");
  await dialog.getByRole("button", { name: "登录并同步" }).click();
  await expect(dialog).toBeHidden();
  const roleName = { owner: "店主", sales: "销售人员", warehouse: "库管人员" }[role];
  await expect(page.getByText(`${roleName}测试账号`, { exact: true }).first()).toBeVisible();
};

test("店主可以查看并编辑真实商品数据", async ({ page }) => {
  await loginAs(page, "owner", "products");

  await expect(page.getByRole("heading", { level: 1, name: "商品列表" })).toBeVisible();
  await expect(page.getByText("契约测试耳机", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "编辑", exact: true }).click();
  await expect(page.getByRole("dialog", { name: /编辑商品/ })).toBeVisible();
  await expect(page.getByText("SKU 列表")).toBeVisible();
});

test("库管可以调整库存并为待发货订单填写配送信息", async ({ page, request }) => {
  await request.post("http://127.0.0.1:18080/api/v1/__reset");
  await loginAs(page, "warehouse", "inventory");

  await page.getByRole("button", { name: "补货" }).click();
  const stockDialog = page.getByRole("dialog", { name: /调整库存/ });
  await stockDialog.getByLabel("调整后库存").fill("12");
  await stockDialog.getByLabel("库存预警线").fill("5");
  await stockDialog.getByLabel("调整原因").fill("Playwright 验收入库");
  await stockDialog.getByRole("button", { name: "提交保存" }).click();
  await expect(page.getByRole("status").filter({ hasText: "操作成功" })).toBeVisible();

  await page.getByRole("button", { name: "订单履约" }).click();
  await page.getByRole("button", { name: "订单列表" }).click();
  await page.getByRole("button", { name: "详情" }).click();
  await page.getByRole("button", { name: "填写物流并发货" }).click();
  const shipDialog = page.getByRole("dialog", { name: "填写物流并发货" });
  await shipDialog.getByLabel("配送方式").selectOption("self_delivery");
  await shipDialog.getByRole("button", { name: "提交保存" }).click();
  await expect(page.getByRole("status").filter({ hasText: "操作成功" })).toBeVisible();

  const payloads = await request.get("http://127.0.0.1:18080/api/v1/__requests");
  const body = await payloads.json();
  expect(body.data).toEqual(expect.arrayContaining([
    expect.objectContaining({ method: "POST", path: "/merchant/orders/301/ship", body: expect.objectContaining({ delivery_type: "self_delivery" }) })
  ]));
});

test("销售只能查看订单，不能发货或编辑商品", async ({ page }) => {
  await loginAs(page, "sales", "order-list");

  await page.getByRole("button", { name: "详情" }).click();
  await expect(page.getByRole("heading", { name: "订单详情" })).toBeVisible();
  await expect(page.getByRole("button", { name: "填写物流并发货" })).toHaveCount(0);

  await page.getByRole("button", { name: "商品中心" }).click();
  await page.getByRole("button", { name: "商品列表" }).click();
  await expect(page.getByRole("button", { name: "新增商品" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "编辑", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "财务结算" })).toHaveCount(0);
});

test("店主可以只读查看结算单、账本和结算明细", async ({ page, request }) => {
  await request.post("http://127.0.0.1:18080/api/v1/__reset");
  await loginAs(page, "owner", "merchant-settlements");

  await expect(page.getByRole("heading", { level: 1, name: "商户结算" })).toBeVisible();
  await expect(page.getByText("S202607160001", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "明细" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "结算单详情" })).toBeVisible();
  await expect(page.getByText("SALE-301", { exact: true })).toBeVisible();
  await expect(page.getByText("COMMISSION-301", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "财务结算" }).click();
  await page.getByRole("button", { name: "结算账本" }).click();
  await expect(page.getByText("REFUND-701", { exact: true })).toBeVisible();
  await page.getByLabel("流水类型").selectOption("refund");
  await page.getByRole("button", { name: "查询" }).click();
  await expect(page.getByText("REFUND-701", { exact: true })).toBeVisible();
  await expect(page.getByText("SALE-301", { exact: true })).toHaveCount(0);

  const payloads = await request.get("http://127.0.0.1:18080/api/v1/__requests");
  const body = await payloads.json();
  expect(body.data).toEqual(expect.arrayContaining([
    expect.objectContaining({ method: "GET", path: "/merchant/settlements/1001" }),
    expect.objectContaining({ method: "GET", path: "/merchant/settlement-entries", query: expect.objectContaining({ entry_type: "refund" }) })
  ]));
});
