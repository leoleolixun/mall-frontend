import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ListPageData } from "../../types";
import { createMerchantListQuery, MerchantListPage } from "./MerchantListPage";

const page: ListPageData = {
  kind: "list",
  id: "products",
  groupId: "group02",
  title: "商品列表",
  eyebrow: "商品",
  description: "测试商品列表",
  filters: [],
  actions: [{ label: "新增商品", variant: "primary" }],
  metrics: [{ label: "商品总数", value: "41", delta: "接口同步", tone: "blue" }],
  columns: [
    { key: "name", label: "商品" },
    { key: "status", label: "状态" },
    { key: "action", label: "操作" }
  ],
  rows: [{ id: "101", cells: { name: "测试耳机", status: "在售", action: "编辑" } }],
  page: 2,
  pageSize: 20,
  total: 41
};

const renderPage = (overrides: Partial<ListPageData> = {}) => {
  const callbacks = {
    onQueryChange: vi.fn(),
    onSearch: vi.fn(),
    onReset: vi.fn(),
    onRefresh: vi.fn(),
    onPageChange: vi.fn(),
    onRowAction: vi.fn(),
    onToolbarAction: vi.fn()
  };
  const TestHarness = () => {
    const [query, setQuery] = useState({ ...createMerchantListQuery(), page: 2 });
    return (
      <MerchantListPage
        page={{ ...page, ...overrides }}
        query={query}
        loading={false}
        {...callbacks}
        onQueryChange={(patch) => {
          callbacks.onQueryChange(patch);
          setQuery((current) => ({ ...current, ...patch }));
        }}
      />
    );
  };
  render(<TestHarness />);
  return callbacks;
};

describe("MerchantListPage", () => {
  it("提交筛选、刷新并执行真实行操作", async () => {
    const user = userEvent.setup();
    const callbacks = renderPage();

    await user.type(screen.getByRole("textbox", { name: "商品搜索" }), "耳机");
    expect(callbacks.onQueryChange).toHaveBeenLastCalledWith({ keyword: "耳机" });
    await user.click(screen.getByRole("button", { name: "查询" }));
    await user.click(screen.getByRole("button", { name: "刷新列表" }));
    await user.click(screen.getByRole("button", { name: "编辑" }));

    expect(callbacks.onSearch).toHaveBeenCalledOnce();
    expect(callbacks.onRefresh).toHaveBeenCalledOnce();
    expect(callbacks.onRowAction).toHaveBeenCalledWith(page.rows[0]);
  });

  it("使用服务端分页信息切换页面", async () => {
    const user = userEvent.setup();
    const callbacks = renderPage();

    expect(screen.getByText("第 2 / 3 页，共 41 条")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "上一页" }));
    await user.click(screen.getByRole("button", { name: "下一页" }));

    expect(callbacks.onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(callbacks.onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("空列表显示可恢复的空状态而不是伪造数据", () => {
    renderPage({ rows: [], total: 0, page: 1, emptyText: "没有匹配商品" });
    expect(screen.getByText("没有匹配商品")).toBeInTheDocument();
    expect(screen.queryByText("测试耳机")).not.toBeInTheDocument();
  });
});
