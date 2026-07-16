const cnyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const formatPrice = (value: number): string => cnyFormatter.format(Number.isFinite(value) ? value : 0);
