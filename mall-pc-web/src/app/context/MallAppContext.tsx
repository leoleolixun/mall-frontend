import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { moneyFromCent } from "@/api/client";
import type { AddressRequest, AddressResponse, AfterSaleResponse, AuthResponse, CategoryResponse, CouponResponse, CreateAfterSaleRequest, LogisticsResponse, MerchantCouponSelection, OrderResponse, PayChannel, PaymentResponse, PayScene, ProductDetailResponse, ProductListItemResponse, TradePreviewResponse, TradeResponse, UpdateProfileRequest, UserCouponResponse } from "@/api/client";
import { addressApi } from "@/features/address/api/addressApi";
import { afterSaleApi } from "@/features/after-sale/api/afterSaleApi";
import { authApi } from "@/features/auth/api/authApi";
import { cartApi } from "@/features/cart/api/cartApi";
import { mapCartLine } from "@/features/cart/helpers/cartMappers";
import { catalogApi } from "@/features/catalog/api/catalogApi";
import { mapProduct } from "@/features/catalog/helpers/catalogMappers";
import { couponApi } from "@/features/coupon/api/couponApi";
import { favoriteApi } from "@/features/favorite/api/favoriteApi";
import { orderApi } from "@/features/order/api/orderApi";
import { buildOrderItems } from "@/features/order/helpers/orderHelpers";
import { paymentApi } from "@/features/payment/api/paymentApi";
import { tradeApi } from "@/features/trade/api/tradeApi";
import type { CartLine, PageKey, Product } from "@/shared/types/domain";

export interface MallAppContextValue {
  addressError: string;
  addressLoading: boolean;
  addresses: AddressResponse[];
  afterSaleError: string;
  afterSaleLoading: boolean;
  afterSales: AfterSaleResponse[];
  auth: AuthResponse | null;
  availableCoupons: CouponResponse[];
  cart: CartLine[];
  cartCount: number;
  cartError: string;
  cartLoading: boolean;
  catalog: Product[];
  categories: CategoryResponse[];
  catalogError: string;
  catalogLoading: boolean;
  couponError: string;
  couponLoading: boolean;
  favoriteError: string;
  favoriteLoading: boolean;
  favorites: Product[];
  globalSearch: string;
  isLoggedIn: boolean;
  lastOrder: OrderResponse | null;
  lastTrade: TradeResponse | null;
  notice: string;
  orderError: string;
  orderLoading: boolean;
  orderSubmitting: boolean;
  orders: OrderResponse[];
  orderPreview: TradePreviewResponse | null;
  currentPayment: PaymentResponse | null;
  productDetail: ProductDetailResponse | null;
  productError: string;
  productLoading: boolean;
  selectedAddressId?: number;
  selectedProduct: Product | null;
  selectedUserCouponIds: Record<number, number | undefined>;
  userCoupons: UserCouponResponse[];
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  cancelAfterSale: (id: number) => Promise<boolean>;
  cancelOrder: (id: number) => Promise<boolean>;
  changeCartQuantity: (id: string, quantity: number) => Promise<void>;
  claimCoupon: (id: number) => Promise<boolean>;
  confirmOrder: (id: number) => Promise<OrderResponse | null>;
  createAfterSale: (payload: CreateAfterSaleRequest) => Promise<AfterSaleResponse | null>;
  createAddress: (payload: AddressRequest) => Promise<boolean>;
  checkPaymentStatus: () => Promise<void>;
  createPayment: (channel: PayChannel, scene?: PayScene) => Promise<PaymentResponse | null>;
  deleteAddress: (id: number) => Promise<boolean>;
  ensureProductForRoute: (productId: string) => void;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleRegister: (username: string, password: string, nickname: string) => Promise<void>;
  getAfterSaleDetail: (id: number) => Promise<AfterSaleResponse>;
  getOrderDetail: (id: number) => Promise<OrderResponse>;
  getOrderLogistics: (id: number) => Promise<LogisticsResponse>;
  navigateProtected: (to: string) => void;
  navigateToPage: (page: PageKey) => void;
  openOrderPayment: (order: OrderResponse) => void;
  openProduct: (product: Product) => void;
  reloadCatalog: () => void;
  reloadAddresses: () => void;
  reloadOrders: () => void;
  reloadCart: () => void;
  setDefaultAddress: (id: number) => Promise<boolean>;
  setGlobalSearch: (value: string) => void;
  setSelectedAddressId: (id: number) => void;
  setSelectedMerchantCoupon: (merchantId: number, id?: number) => void;
  submitOrder: () => Promise<void>;
  toggleFavorite: (productId: number) => Promise<boolean>;
  updateAddress: (id: number, payload: AddressRequest) => Promise<boolean>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<boolean>;
}

const MallAppContext = createContext<MallAppContextValue | null>(null);
const GUEST_CART_STORAGE_KEY = "mall_pc_guest_cart";

interface MallAppProviderProps {
  children: React.ReactNode;
}

const routeByPage: Partial<Record<PageKey, string>> = {
  auth: "/login",
  cart: "/cart",
  "cart-empty": "/cart",
  checkout: "/checkout",
  home: "/",
  payment: "/payment",
  "payment-failed": "/payment/failed",
  "payment-result": "/payment/result",
  "product-list": "/products"
};

const readGuestCart = (): CartLine[] => {
  const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("invalid guest cart");
    }

    const lines = parsed.filter((line): line is CartLine => {
      if (!line || typeof line !== "object") {
        return false;
      }
      const item = line as Partial<CartLine>;
      return typeof item.id === "string"
        && typeof item.skuId === "number"
        && item.skuId > 0
        && typeof item.name === "string"
        && typeof item.price === "number"
        && item.price >= 0
        && typeof item.quantity === "number"
        && Number.isInteger(item.quantity)
        && item.quantity > 0;
    });
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(lines));
    return lines;
  } catch {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    return [];
  }
};

const writeGuestCart = (lines: CartLine[]): void => {
  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(lines));
};

const clearGuestCart = (): void => {
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
};

export const MallAppProvider: React.FC<MallAppProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState("");
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogReloadKey, setCatalogReloadKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [auth, setAuth] = useState<AuthResponse | null>(() => authApi.storage.read());
  const [cart, setCart] = useState<CartLine[]>(() => authApi.storage.read() ? [] : readGuestCart());
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null);
  const [productError, setProductError] = useState("");
  const [productLoading, setProductLoading] = useState(true);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<CouponResponse[]>([]);
  const [userCoupons, setUserCoupons] = useState<UserCouponResponse[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [favoriteItems, setFavoriteItems] = useState<ProductListItemResponse[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [afterSales, setAfterSales] = useState<AfterSaleResponse[]>([]);
  const [afterSaleLoading, setAfterSaleLoading] = useState(false);
  const [afterSaleError, setAfterSaleError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>();
  const [selectedUserCouponIds, setSelectedUserCouponIds] = useState<Record<number, number | undefined>>({});
  const [orderPreview, setOrderPreview] = useState<TradePreviewResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null);
  const [lastTrade, setLastTrade] = useState<TradeResponse | null>(null);
  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState("/");
  const catalogRef = useRef<Product[]>([]);
  const productRequestRef = useRef(0);
  const orderSubmittingRef = useRef(false);
  const isLoggedIn = Boolean(auth?.access_token);
  const selectedMerchantCoupons = useMemo<MerchantCouponSelection[]>(() => Object.entries(selectedUserCouponIds)
    .map(([merchantId, userCouponId]) => ({
      merchant_id: Number(merchantId),
      user_coupon_id: Number(userCouponId)
    }))
    .filter((item) => item.merchant_id > 0 && item.user_coupon_id > 0)
    .sort((left, right) => left.merchant_id - right.merchant_id), [selectedUserCouponIds]);

  const setSelectedMerchantCoupon = useCallback((merchantId: number, id?: number): void => {
    if (merchantId <= 0) return;
    setSelectedUserCouponIds((current) => {
      const next = { ...current };
      if (id && id > 0) next[merchantId] = id;
      else delete next[merchantId];
      return next;
    });
  }, []);

  const reloadCatalog = useCallback((): void => {
    setCatalogReloadKey((current) => current + 1);
  }, []);

  useEffect(() => authApi.storage.subscribe(setAuth), []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(""), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!isLoggedIn) {
      writeGuestCart(cart);
    }
  }, [cart, isLoggedIn]);

  useEffect(() => {
    let alive = true;

    const loadCatalog = async (): Promise<void> => {
      setCatalogLoading(true);
      setCatalogError("");
      try {
        const [categoryList, page] = await Promise.all([
          catalogApi.categories().catch(() => []),
          catalogApi.products({ page: 1, pageSize: 50 })
        ]);
        if (!alive) {
          return;
        }
        const nextCatalog = page.list.map((item) => mapProduct(item, categoryList));
        setCategories(categoryList);
        catalogRef.current = nextCatalog;
        setCatalog(nextCatalog);
      } catch (error) {
        if (alive) {
          catalogRef.current = [];
          setCatalog([]);
          setCategories([]);
          setCatalogError(error instanceof Error ? error.message : "商品加载失败");
        }
      } finally {
        if (alive) {
          setCatalogLoading(false);
        }
      }
    };

    void loadCatalog();
    return () => {
      alive = false;
    };
  }, [catalogReloadKey]);

  const refreshCart = useCallback(async (showLoading = true): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    if (showLoading) {
      setCartLoading(true);
    }
    setCartError("");
    try {
      const items = await cartApi.items();
      setCart(items.map(mapCartLine));
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "购物车加载失败");
    } finally {
      if (showLoading) {
        setCartLoading(false);
      }
    }
  }, []);

  const reloadCart = useCallback((): void => {
    void refreshCart();
  }, [refreshCart]);

  const refreshAddresses = useCallback(async (showLoading = true): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    if (showLoading) {
      setAddressLoading(true);
    }
    setAddressError("");
    try {
      const list = await addressApi.list();
      setAddresses(list);
      setSelectedAddressId((current) => {
        if (current && list.some((address) => address.id === current)) {
          return current;
        }
        return list.find((address) => address.is_default)?.id ?? list[0]?.id;
      });
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "收货地址加载失败");
    } finally {
      if (showLoading) {
        setAddressLoading(false);
      }
    }
  }, []);

  const reloadAddresses = useCallback((): void => {
    void refreshAddresses();
  }, [refreshAddresses]);

  const refreshOrders = useCallback(async (showLoading = true): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    if (showLoading) {
      setOrderLoading(true);
    }
    setOrderError("");
    try {
      const page = await orderApi.list({ page: 1, pageSize: 20 });
      setOrders(page.list);
      setLastOrder((current) => {
        if (current) {
          return page.list.find((order) => order.id === current.id) ?? current;
        }
        return page.list.find((order) => order.status === 1) ?? page.list[0] ?? null;
      });
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "订单加载失败");
    } finally {
      if (showLoading) {
        setOrderLoading(false);
      }
    }
  }, []);

  const reloadOrders = useCallback((): void => {
    void refreshOrders();
  }, [refreshOrders]);

  const refreshCoupons = useCallback(async (showLoading = true): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    if (showLoading) {
      setCouponLoading(true);
    }
    setCouponError("");
    try {
      const [available, mine] = await Promise.all([
        couponApi.available(),
        couponApi.mine()
      ]);
      setAvailableCoupons(available);
      setUserCoupons(mine);
      setSelectedUserCouponIds((current) => Object.fromEntries(
        Object.entries(current).filter(([merchantId, couponId]) => mine.some((item) => item.id === couponId
          && item.status === 1
          && item.coupon.merchant_id === Number(merchantId)))
      ));
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : "优惠券加载失败");
    } finally {
      if (showLoading) {
        setCouponLoading(false);
      }
    }
  }, []);

  const refreshFavorites = useCallback(async (showLoading = true): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    if (showLoading) {
      setFavoriteLoading(true);
    }
    setFavoriteError("");
    try {
      const page = await favoriteApi.list();
      setFavoriteItems(page.list);
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "收藏商品加载失败");
    } finally {
      if (showLoading) {
        setFavoriteLoading(false);
      }
    }
  }, []);

  const refreshAfterSales = useCallback(async (showLoading = true): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    if (showLoading) {
      setAfterSaleLoading(true);
    }
    setAfterSaleError("");
    try {
      const page = await afterSaleApi.list();
      setAfterSales(page.list);
    } catch (error) {
      setAfterSaleError(error instanceof Error ? error.message : "售后记录加载失败");
    } finally {
      if (showLoading) {
        setAfterSaleLoading(false);
      }
    }
  }, []);

  const syncGuestCart = useCallback(async (lines: CartLine[]): Promise<void> => {
    const remoteLines = lines.filter((line) => line.skuId && line.quantity > 0);
    let remaining = [...remoteLines];
    for (const line of remoteLines) {
      await cartApi.addItem(line.skuId as number, line.quantity);
      remaining = remaining.filter((item) => item.id !== line.id);
      writeGuestCart(remaining);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setCart(readGuestCart());
      setCartError("");
      setCartLoading(false);
      setOrderPreview(null);
      setAddresses([]);
      setAddressError("");
      setAddressLoading(false);
      setAvailableCoupons([]);
      setUserCoupons([]);
      setCouponError("");
      setCouponLoading(false);
      setFavoriteItems([]);
      setFavoriteError("");
      setFavoriteLoading(false);
      setAfterSales([]);
      setAfterSaleError("");
      setAfterSaleLoading(false);
      setOrders([]);
      setOrderError("");
      setOrderLoading(false);
      setOrderSubmitting(false);
      orderSubmittingRef.current = false;
      setLastOrder(null);
      setLastTrade(null);
      setCurrentPayment(null);
      setSelectedAddressId(undefined);
      setSelectedUserCouponIds({});
      return;
    }

    void refreshCart();
    void refreshAddresses();
    void refreshOrders();
    void refreshCoupons();
    void refreshFavorites();
    void refreshAfterSales();
  }, [auth, refreshAddresses, refreshAfterSales, refreshCart, refreshCoupons, refreshFavorites, refreshOrders]);

  useEffect(() => {
    const items = buildOrderItems(cart);
    const hasUnavailableItem = cart.some((line) => line.available === false);
    if (!isLoggedIn || location.pathname !== "/checkout" || orderSubmittingRef.current || !selectedAddressId || items.length === 0 || hasUnavailableItem) {
      setOrderPreview(null);
      return;
    }

    let alive = true;
    setOrderPreview(null);
    void tradeApi.preview({
      address_id: selectedAddressId,
      merchant_coupons: selectedMerchantCoupons,
      items
    })
      .then((preview) => {
        if (alive) {
          setOrderPreview(preview);
        }
      })
      .catch((error: Error) => {
        if (alive) {
          setOrderPreview(null);
          setNotice(error.message);
        }
      });

    return () => {
      alive = false;
    };
  }, [cart, isLoggedIn, location.pathname, selectedAddressId, selectedMerchantCoupons]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const favorites = useMemo(() => favoriteItems.map((item) => (
    catalog.find((product) => product.apiId === item.id) ?? mapProduct(item, [])
  )), [catalog, favoriteItems]);

  const navigateToPath = useCallback((to: string): void => {
    void navigate({ to });
  }, [navigate]);

  useEffect(() => authApi.storage.subscribeExpired(() => {
    const currentPath = `${location.pathname}${window.location.search}`;
    setRedirectAfterLogin(currentPath === "/login" ? "/" : currentPath);
    setNotice("登录状态已过期，请重新登录");
    navigateToPath("/login");
  }), [location.pathname, navigateToPath]);

  const resolveProductSku = useCallback(async (product: Product): Promise<Product> => {
    if (product.skuId) {
      return product;
    }
    if (!product.apiId) {
      throw new Error("商品数据已失效，请刷新商品列表后重试");
    }

    const detail = await catalogApi.productDetail(product.apiId);
    const sku = detail.skus.find((item) => item.stock > 0);
    if (!sku) {
      throw new Error("商品暂无可售规格");
    }

    return {
      ...product,
      skuId: sku.id,
      skuName: sku.name,
      price: moneyFromCent(sku.price),
      cover: sku.image || detail.cover || product.cover
    };
  }, []);

  const addToCart = useCallback(async (product: Product, quantity = 1): Promise<boolean> => {
    try {
      const cartProduct = await resolveProductSku(product);

      if (isLoggedIn && cartProduct.skuId) {
        await cartApi.addItem(cartProduct.skuId, quantity);
        await refreshCart(false);
        setNotice("已加入购物车：" + cartProduct.name);
        return true;
      }

      setCart((current) => {
        const lineId = String(cartProduct.skuId ?? cartProduct.id);
        const existing = current.find((line) => line.id === lineId);
        if (existing) {
          return current.map((line) => line.id === lineId ? { ...line, quantity: line.quantity + quantity } : line);
        }

        return [
          ...current,
          {
            id: lineId,
            merchantId: cartProduct.merchantId,
            merchantName: cartProduct.merchantName || (cartProduct.merchantId ? `商户 ${cartProduct.merchantId}` : undefined),
            merchantLogo: cartProduct.merchantLogo,
            skuId: cartProduct.skuId,
            productId: cartProduct.apiId,
            cover: cartProduct.cover,
            name: cartProduct.name,
            spec: cartProduct.skuName || "默认规格",
            price: cartProduct.price,
            quantity
          }
        ];
      });
      setNotice("已加入购物车：" + cartProduct.name);
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "加入购物车失败");
      return false;
    }
  }, [isLoggedIn, refreshCart, resolveProductSku]);

  const changeCartQuantity = useCallback(async (id: string, quantity: number): Promise<void> => {
    const line = cart.find((item) => item.id === id);
    if (isLoggedIn && line?.skuId) {
      try {
        if (quantity <= 0) {
          await cartApi.deleteItem(line.skuId);
        } else {
          await cartApi.updateItem(line.skuId, quantity);
        }
        await refreshCart(false);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "更新购物车失败");
      }
      return;
    }

    setCart((current) => {
      if (quantity <= 0) {
        return current.filter((lineItem) => lineItem.id !== id);
      }
      return current.map((lineItem) => lineItem.id === id ? { ...lineItem, quantity } : lineItem);
    });
  }, [cart, isLoggedIn, refreshCart]);

  const openProduct = useCallback((product: Product): void => {
    if (!product.apiId) {
      setNotice("商品数据已失效，请刷新商品列表后重试");
      return;
    }
    const productId = String(product.apiId ?? product.id);
    setSelectedProduct(product);
    setProductDetail(null);
    setProductError("");
    setProductLoading(true);
    navigateToPath(`/products/${productId}`);
  }, [navigateToPath]);

  const ensureProductForRoute = useCallback((productId: string): void => {
    const requestId = ++productRequestRef.current;
    const matched = catalogRef.current.find((product) => String(product.apiId ?? product.id) === productId);
    setSelectedProduct(matched ?? null);
    setProductDetail(null);
    setProductError("");
    setProductLoading(true);

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId) || numericProductId <= 0) {
      setProductError("商品编号无效");
      setProductLoading(false);
      return;
    }

    void catalogApi.productDetail(numericProductId)
      .then((detail) => {
        if (productRequestRef.current !== requestId) {
          return;
        }
        setProductDetail(detail);
        setSelectedProduct((current) => ({
          id: String(detail.id),
          apiId: detail.id,
          merchantId: detail.merchant_id,
          merchantName: detail.merchant_name,
          merchantLogo: detail.merchant_logo,
          skuId: detail.skus[0]?.id,
          skuName: detail.skus[0]?.name,
          name: detail.name,
          price: detail.skus[0] ? moneyFromCent(detail.skus[0].price) : current?.price ?? 0,
          category: current?.category ?? `分类 ${detail.category_id}`,
          categoryId: detail.category_id,
          brand: current?.brand ?? "",
          badge: current?.badge ?? "",
          sales: current?.sales ?? "",
          cover: detail.cover,
          description: detail.description,
        }));
        setProductLoading(false);
      })
      .catch((error: Error) => {
        if (productRequestRef.current === requestId) {
          setProductError(error.message || "商品详情加载失败");
          setProductLoading(false);
        }
      });
  }, []);

  const navigateProtected = useCallback((to: string): void => {
    if (!isLoggedIn) {
      setRedirectAfterLogin(to);
      navigateToPath("/login");
      setNotice("请先登录后继续操作");
      return;
    }
    navigateToPath(to);
  }, [isLoggedIn, navigateToPath]);

  const claimCoupon = useCallback(async (id: number): Promise<boolean> => {
    try {
      await couponApi.claim(id);
      await refreshCoupons(false);
      setNotice("优惠券领取成功");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "优惠券领取失败");
      return false;
    }
  }, [refreshCoupons]);

  const toggleFavorite = useCallback(async (productId: number): Promise<boolean> => {
    if (!isLoggedIn) {
      navigateProtected(location.pathname);
      return false;
    }

    const favorite = favoriteItems.some((item) => item.id === productId);
    try {
      if (favorite) {
        await favoriteApi.remove(productId);
      } else {
        await favoriteApi.add(productId);
      }
      await refreshFavorites(false);
      setNotice(favorite ? "已取消收藏" : "已收藏商品");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : favorite ? "取消收藏失败" : "收藏商品失败");
      return false;
    }
  }, [favoriteItems, isLoggedIn, location.pathname, navigateProtected, refreshFavorites]);

  const cancelAfterSale = useCallback(async (id: number): Promise<boolean> => {
    try {
      await afterSaleApi.cancel(id);
      await refreshAfterSales(false);
      setNotice("售后申请已取消");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "取消售后申请失败");
      return false;
    }
  }, [refreshAfterSales]);

  const createAfterSale = useCallback(async (payload: CreateAfterSaleRequest): Promise<AfterSaleResponse | null> => {
    try {
      const result = await afterSaleApi.create(payload);
      await refreshAfterSales(false);
      setNotice("售后申请已提交");
      return result;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "提交售后申请失败");
      return null;
    }
  }, [refreshAfterSales]);

  const getAfterSaleDetail = useCallback((id: number): Promise<AfterSaleResponse> => afterSaleApi.detail(id), []);

  const getOrderDetail = useCallback((id: number): Promise<OrderResponse> => orderApi.detail(id), []);

  const getOrderLogistics = useCallback((id: number): Promise<LogisticsResponse> => orderApi.logistics(id), []);

  const cancelOrder = useCallback(async (id: number): Promise<boolean> => {
    try {
      const currentOrder = orders.find((order) => order.id === id)
        ?? (lastOrder?.id === id ? lastOrder : await orderApi.detail(id));
      if (currentOrder.trade_id) await tradeApi.cancel(currentOrder.trade_id);
      else await orderApi.cancel(id);
      await refreshOrders(false);
      setNotice(currentOrder.trade_id ? "交易及全部商户订单已取消" : "订单已取消");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "取消订单失败");
      return false;
    }
  }, [lastOrder, orders, refreshOrders]);

  const confirmOrder = useCallback(async (id: number): Promise<OrderResponse | null> => {
    try {
      const latest = await orderApi.confirm(id);
      setOrders((current) => current.map((order) => order.id === id ? latest : order));
      setLastOrder((current) => current?.id === id ? latest : current);
      setNotice("已确认收货");
      return latest;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "确认收货失败");
      return null;
    }
  }, []);

  const navigateToPage = useCallback((page: PageKey): void => {
    if (page === "product-detail") {
      if (selectedProduct) {
        openProduct(selectedProduct);
      } else {
        navigateToPath("/products");
      }
      return;
    }
    navigateToPath(routeByPage[page] ?? "/");
  }, [navigateToPath, openProduct, selectedProduct]);

  const handleLogin = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      const result = await authApi.login({ username, password });
      const guestCart = cart;
      authApi.storage.write(result);
      try {
        await syncGuestCart(guestCart);
      } catch {
        authApi.storage.clear();
        setAuth(null);
        setNotice("账号登录成功，但购物车同步失败，请重试登录");
        return;
      }
      clearGuestCart();
      setAuth(result);
      await refreshCart(false);
      setNotice("登录成功");
      navigateToPath(redirectAfterLogin);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "登录失败");
    }
  }, [cart, navigateToPath, redirectAfterLogin, refreshCart, syncGuestCart]);

  const handleRegister = useCallback(async (username: string, password: string, nickname: string): Promise<void> => {
    try {
      const result = await authApi.register({ username, password, nickname });
      const guestCart = cart;
      authApi.storage.write(result);
      try {
        await syncGuestCart(guestCart);
      } catch {
        authApi.storage.clear();
        setAuth(null);
        setNotice("账号创建成功，但购物车同步失败，请重新登录");
        return;
      }
      clearGuestCart();
      setAuth(result);
      await refreshCart(false);
      setNotice("注册成功");
      navigateToPath(redirectAfterLogin);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "注册失败");
    }
  }, [cart, navigateToPath, redirectAfterLogin, refreshCart, syncGuestCart]);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      if (auth?.refresh_token) {
        await authApi.logout();
      }
    } catch {
      // 本地退出不依赖后端退出结果。
    } finally {
      authApi.storage.clear();
      paymentApi.pendingStorage.clear();
      setAuth(null);
      setCart([]);
      clearGuestCart();
      setNotice("已退出登录");
      navigateToPath("/");
    }
  }, [auth?.refresh_token, navigateToPath]);

  const createAddress = useCallback(async (payload: AddressRequest): Promise<boolean> => {
    try {
      const created = await addressApi.create(payload);
      await refreshAddresses(false);
      setSelectedAddressId((current) => payload.is_default || !current ? created.id : current);
      setNotice("收货地址已新增");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "新增地址失败");
      return false;
    }
  }, [refreshAddresses]);

  const updateAddress = useCallback(async (id: number, payload: AddressRequest): Promise<boolean> => {
    try {
      const updated = await addressApi.update(id, payload);
      await refreshAddresses(false);
      setSelectedAddressId((current) => payload.is_default ? updated.id : current);
      setNotice("收货地址已更新");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "编辑地址失败");
      return false;
    }
  }, [refreshAddresses]);

  const deleteAddress = useCallback(async (id: number): Promise<boolean> => {
    try {
      await addressApi.delete(id);
      const list = await addressApi.list();
      setAddresses(list);
      setSelectedAddressId((current) => {
        if (current && current !== id) {
          return current;
        }
        return list.find((address) => address.is_default)?.id ?? list[0]?.id;
      });
      setNotice("收货地址已删除");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "删除地址失败");
      return false;
    }
  }, []);

  const setDefaultAddress = useCallback(async (id: number): Promise<boolean> => {
    try {
      await addressApi.setDefault(id);
      await refreshAddresses(false);
      setSelectedAddressId(id);
      setNotice("默认地址已更新");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "设置默认地址失败");
      return false;
    }
  }, [refreshAddresses]);

  const submitOrder = useCallback(async (): Promise<void> => {
    if (orderSubmittingRef.current) {
      return;
    }
    const items = buildOrderItems(cart);
    if (!selectedAddressId) {
      setNotice("请先选择收货地址");
      return;
    }
    if (items.length === 0) {
      setNotice("购物车没有可结算商品");
      return;
    }
    if (cart.some((line) => line.available === false)) {
      setNotice("购物车中存在不可结算商品，请先处理");
      return;
    }

    orderSubmittingRef.current = true;
    setOrderSubmitting(true);
    try {
      const preview = await tradeApi.preview({
        address_id: selectedAddressId,
        merchant_coupons: selectedMerchantCoupons,
        items
      });
      setOrderPreview(preview);
      const trade = await tradeApi.create({
        address_id: selectedAddressId,
        merchant_coupons: selectedMerchantCoupons,
        remark: "PC 端下单",
        idempotency_token: preview.idempotency_token,
        items
      });
      const firstOrder = trade.orders[0] ?? null;
      setLastTrade(trade);
      setLastOrder(firstOrder);
      setOrders((current) => [
        ...trade.orders,
        ...current.filter((item) => !trade.orders.some((created) => created.id === item.id))
      ]);
      setCurrentPayment(null);
      setOrderPreview(null);
      setSelectedUserCouponIds({});
      await Promise.all([refreshCart(false), refreshCoupons()]);
      navigateToPath("/payment");
      setNotice(`交易创建成功，共生成 ${trade.orders.length} 张商户订单，请完成合并支付`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "创建订单失败");
    } finally {
      orderSubmittingRef.current = false;
      setOrderSubmitting(false);
    }
  }, [cart, navigateToPath, refreshCart, refreshCoupons, selectedAddressId, selectedMerchantCoupons]);

  const openOrderPayment = useCallback((order: OrderResponse): void => {
    if (order.status !== 1) {
      setNotice("当前订单不需要支付");
      return;
    }
    void (async () => {
      try {
        if (order.trade_id) {
          const trade = await tradeApi.detail(order.trade_id);
          if (trade.status !== 1) {
            setNotice("当前交易不需要支付");
            return;
          }
          setLastTrade(trade);
          setLastOrder(trade.orders.find((item) => item.id === order.id) ?? order);
        } else {
          setLastTrade(null);
          setLastOrder(order);
        }
        setCurrentPayment(null);
        navigateToPath("/payment");
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "加载待支付交易失败");
      }
    })();
  }, [navigateToPath]);

  const createPayment = useCallback(async (channel: PayChannel, scene?: PayScene): Promise<PaymentResponse | null> => {
    if (!lastTrade && !lastOrder) {
      setNotice("暂无待支付交易");
      return null;
    }
    if (lastTrade && lastTrade.status !== 1) {
      setNotice("当前交易不需要支付");
      return null;
    }
    if (!lastTrade && lastOrder?.status !== 1) {
      setNotice("当前订单不需要支付");
      return null;
    }
    try {
      const payment = lastTrade
        ? await paymentApi.create({ trade_id: lastTrade.id, pay_channel: channel, pay_scene: scene })
        : await paymentApi.create({ order_id: lastOrder!.id, pay_channel: channel, pay_scene: scene });
      setCurrentPayment(payment);
      paymentApi.pendingStorage.write(payment.payment_no);
      setNotice("支付单已创建");
      return payment;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "创建支付单失败");
      return null;
    }
  }, [lastOrder, lastTrade]);

  const checkPaymentStatus = useCallback(async (): Promise<void> => {
    if (!lastTrade && !lastOrder) {
      setNotice("暂无待支付交易");
      return;
    }
    if (!currentPayment) {
      setNotice("请先创建支付单");
      return;
    }

    try {
      const detail = await paymentApi.detail(currentPayment.payment_no);
      const latestPayment = detail.status === 1 && detail.pay_channel === "alipay"
        ? await paymentApi.sync(detail.payment_no)
        : detail;
      setCurrentPayment(latestPayment);
      if (latestPayment.status === 2) {
        const tradeID = latestPayment.trade_id ?? lastTrade?.id;
        if (tradeID) {
          const latestTrade = await tradeApi.detail(tradeID);
          setLastTrade(latestTrade);
          const nextOrder = latestTrade.orders.find((order) => order.id === lastOrder?.id) ?? latestTrade.orders[0] ?? null;
          setLastOrder(nextOrder);
          setOrders((current) => [
            ...latestTrade.orders,
            ...current.filter((item) => !latestTrade.orders.some((updated) => updated.id === item.id))
          ]);
        } else if (lastOrder) {
          const latestOrder = await orderApi.detail(lastOrder.id);
          setLastOrder(latestOrder);
          setOrders((current) => current.map((order) => order.id === lastOrder.id ? latestOrder : order));
        }
        navigateToPath("/payment/result");
        setNotice("支付成功");
        return;
      }
      setNotice(`当前支付状态：${latestPayment.status_text}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "查询支付状态失败");
    }
  }, [currentPayment, lastOrder, lastTrade, navigateToPath]);

  const updateProfile = useCallback(async (payload: UpdateProfileRequest): Promise<boolean> => {
    if (!auth) {
      setNotice("请先登录后继续操作");
      return false;
    }

    try {
      const user = await authApi.updateProfile(payload);
      const nextAuth = { ...auth, user };
      authApi.storage.write(nextAuth);
      setAuth(nextAuth);
      setNotice("个人资料已保存");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "保存个人资料失败");
      return false;
    }
  }, [auth]);

  const value = useMemo<MallAppContextValue>(() => ({
    addressError,
    addressLoading,
    addresses,
    afterSaleError,
    afterSaleLoading,
    afterSales,
    auth,
    availableCoupons,
    cart,
    cartCount,
    cartError,
    cartLoading,
    catalog,
    categories,
    catalogError,
    catalogLoading,
    couponError,
    couponLoading,
    favoriteError,
    favoriteLoading,
    favorites,
    globalSearch,
    isLoggedIn,
    lastOrder,
    lastTrade,
    notice,
    orderError,
    orderLoading,
    orderSubmitting,
    orders,
    orderPreview,
    currentPayment,
    productDetail,
    productError,
    productLoading,
    selectedAddressId,
    selectedProduct,
    selectedUserCouponIds,
    userCoupons,
    addToCart,
    cancelAfterSale,
    cancelOrder,
    changeCartQuantity,
    claimCoupon,
    confirmOrder,
    createAfterSale,
    createAddress,
    checkPaymentStatus,
    createPayment,
    deleteAddress,
    ensureProductForRoute,
    handleLogin,
    handleLogout,
    handleRegister,
    getAfterSaleDetail,
    getOrderDetail,
    getOrderLogistics,
    navigateProtected,
    navigateToPage,
    openOrderPayment,
    openProduct,
    reloadCatalog,
    reloadAddresses,
    reloadOrders,
    reloadCart,
    setDefaultAddress,
    setGlobalSearch,
    setSelectedAddressId,
    setSelectedMerchantCoupon,
    submitOrder,
    toggleFavorite,
    updateAddress,
    updateProfile
  }), [
    addressError,
    addressLoading,
    addresses,
    afterSaleError,
    afterSaleLoading,
    afterSales,
    auth,
    availableCoupons,
    cart,
    cartCount,
    cartError,
    cartLoading,
    catalog,
    categories,
    catalogError,
    catalogLoading,
    couponError,
    couponLoading,
    favoriteError,
    favoriteLoading,
    favorites,
    globalSearch,
    isLoggedIn,
    lastOrder,
    lastTrade,
    notice,
    orderError,
    orderLoading,
    orderSubmitting,
    orders,
    orderPreview,
    currentPayment,
    productDetail,
    productError,
    productLoading,
    selectedAddressId,
    selectedProduct,
    selectedUserCouponIds,
    userCoupons,
    addToCart,
    cancelAfterSale,
    cancelOrder,
    changeCartQuantity,
    claimCoupon,
    confirmOrder,
    createAfterSale,
    createAddress,
    checkPaymentStatus,
    createPayment,
    deleteAddress,
    ensureProductForRoute,
    handleLogin,
    handleLogout,
    handleRegister,
    getAfterSaleDetail,
    getOrderDetail,
    getOrderLogistics,
    navigateProtected,
    navigateToPage,
    openOrderPayment,
    openProduct,
    reloadCatalog,
    reloadAddresses,
    reloadOrders,
    reloadCart,
    setDefaultAddress,
    setSelectedMerchantCoupon,
    submitOrder,
    toggleFavorite,
    updateAddress,
    updateProfile
  ]);

  return (
    <MallAppContext.Provider value={value}>
      {children}
    </MallAppContext.Provider>
  );
};

export const useMallApp = (): MallAppContextValue => {
  const context = useContext(MallAppContext);
  if (!context) {
    throw new Error("useMallApp must be used within MallAppProvider");
  }
  return context;
};
