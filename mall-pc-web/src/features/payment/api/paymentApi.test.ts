import { beforeEach, describe, expect, it } from "vitest";

import { paymentApi } from "./paymentApi";

describe("pending payment storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("只清除当前支付单，避免旧页面误删新支付单", () => {
    paymentApi.pendingStorage.write("P-NEW");
    paymentApi.pendingStorage.clear("P-OLD");
    expect(paymentApi.pendingStorage.read()).toBe("P-NEW");

    paymentApi.pendingStorage.clear("P-NEW");
    expect(paymentApi.pendingStorage.read()).toBe("");
  });
});
