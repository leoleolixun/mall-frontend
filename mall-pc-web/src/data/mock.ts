import type { CartLine, Product, Review } from "../types";

export const products: Product[] = [
  { id: "p1", name: "洁面乳套装", price: 128, category: "美妆", brand: "Mall Lab", badge: "套装优惠", sales: "月销 2.1k" },
  { id: "p2", name: "蓝牙耳机 Pro", price: 299, category: "数码", brand: "Acousto", badge: "热卖", sales: "月销 8.9k" },
  { id: "p3", name: "轻薄羽绒服", price: 499, category: "服饰", brand: "Northline", badge: "新品", sales: "月销 956" },
  { id: "p4", name: "儿童保温杯", price: 89, category: "母婴", brand: "BearKid", badge: "包邮", sales: "月销 1.4k" },
  { id: "p5", name: "智能台灯", price: 159, category: "家居", brand: "Lighto", badge: "护眼", sales: "月销 3.2k" },
  { id: "p6", name: "家用吹风机", price: 219, category: "家电", brand: "Breeze", badge: "限时价", sales: "月销 2.7k" },
  { id: "p7", name: "纯棉四件套", price: 269, category: "家居", brand: "Cotton+Life", badge: "精选", sales: "月销 1.2k" },
  { id: "p8", name: "即食燕麦片", price: 49, category: "食品", brand: "Daily Oat", badge: "复购高", sales: "月销 4.5k" }
];

export const cartLines: CartLine[] = [
  { id: "c1", name: "蓝牙耳机 Pro", spec: "曜石黑 / 标准版", price: 299, quantity: 1 },
  { id: "c2", name: "氨基酸洁面乳", spec: "套装 / 2 支装", price: 128, quantity: 2 },
  { id: "c3", name: "儿童保温杯", spec: "粉色 / 480ml", price: 89, quantity: 1 }
];

export const reviews: Review[] = [
  { id: "r1", user: "李先生", sku: "曜石黑", content: "音质比预期好，降噪通勤够用，长时间佩戴也不会明显压耳。", date: "2026-07-04" },
  { id: "r2", user: "王女士", sku: "珍珠白", content: "包装很好，发货速度也很快，连接手机和电脑都很稳定。", date: "2026-07-03" },
  { id: "r3", user: "张先生", sku: "海盐蓝", content: "游戏模式延迟比较低，续航一周通勤没有压力。", date: "2026-07-01" }
];

export const bundleItems = [
  ["蓝牙耳机 Pro", "必选", "¥299", true],
  ["耳机保护套", "可选", "¥39", true],
  ["快充头", "可选", "¥59", true],
  ["收纳包", "可选", "¥29", true],
  ["清洁套装", "可选", "¥19", false],
  ["延保服务", "可选", "¥49", false]
] as const;
