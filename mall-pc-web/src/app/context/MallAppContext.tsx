import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { moneyFromCent } from "@/api/client";
import type { AddressRequest, AddressResponse, AuthResponse, OrderPreviewResponse, OrderResponse, PayChannel, PaymentResponse, PayScene, ProductDetailResponse, UpdateProfileRequest } from "@/api/client";
import { products } from "@/data/mock";
import { addressApi } from "@/features/address/api/addressApi";
import { defaultAddressPayload } from "@/features/address/constants/defaultAddress";
import { authApi } from "@/features/auth/api/authApi";
import { cartApi } from "@/features/cart/api/cartApi";
import { mapCartLine } from "@/features/cart/helpers/cartMappers";
import { catalogApi } from "@/features/catalog/api/catalogApi";
import { mapProduct } from "@/features/catalog/helpers/catalogMappers";
import { orderApi } from "@/features/order/api/orderApi";
import { buildOrderItems } from "@/features/order/helpers/orderHelpers";
import { paymentApi } from "@/features/payment/api/paymentApi";
import type { CartLine, PageKey, Product } from "@/shared/types/domain";

export interface MallAppContextValue {
  addresses: AddressResponse[];
  auth: AuthResponse | null;
  cart: CartLine[];
  cartCount: number;
  catalog: Product[];
  globalSearch: string;
  isLoggedIn: boolean;
  lastOrder: OrderResponse | null;
  notice: string;
  orders: OrderResponse[];
  orderPreview: OrderPreviewResponse | null;
  currentPayment: PaymentResponse | null;
  productDetail: ProductDetailResponse | null;
  selectedAddressId?: number;
  selectedProduct: Product;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  changeCartQuantity: (id: string, quantity: number) => Promise<void>;
  createAddress: (payload: AddressRequest) => Promise<boolean>;
  createDefaultAddress: () => Promise<void>;
  checkPaymentStatus: () => Promise<void>;
  createPayment: (channel: PayChannel, scene?: PayScene) => Promise<PaymentResponse | null>;
  deleteAddress: (id: number) => Promise<boolean>;
  ensureProductForRoute: (productId: string) => void;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleRegister: (username: string, password: string, nickname: string) => Promise<void>;
  navigateProtected: (to: string) => void;
  navigateToPage: (page: PageKey) => void;
  openCurrentProductReviews: () => void;
  openOrderPayment: (order: OrderResponse) => void;
  openProduct: (product: Product) => void;
  setDefaultAddress: (id: number) => Promise<boolean>;
  setGlobalSearch: (value: string) => void;
  setSelectedAddressId: (id: number) => void;
  simulatePaymentComplete: () => Promise<void>;
  submitOrder: () => Promise<void>;
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
  bundle: "/bundle",
  cart: "/cart",
  "cart-empty": "/cart",
  checkout: "/checkout",
  compare: "/compare",
  home: "/",
  payment: "/payment",
  "payment-failed": "/payment/failed",
  "payment-result": "/payment/result",
  pickup: "/pickup",
  presale: "/presale",
  "product-list": "/products"
};

const readGuestCart = (): CartLine[] => {
  const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as CartLine[];
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
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [notice, setNotice] = useState("");
  const [auth, setAuth] = useState<AuthResponse | null>(() => authApi.storage.read());
  const [cart, setCart] = useState<CartLine[]>(() => authApi.storage.read() ? [] : readGuestCart());
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[1]);
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>();
  const [orderPreview, setOrderPreview] = useState<OrderPreviewResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null);
  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState("/");
  const isLoggedIn = Boolean(auth?.access_token);

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
      try {
        const categoryList = await catalogApi.categories();
        const page = await catalogApi.products({ page: 1, pageSize: 50 });
        if (!alive) {
          return;
        }
        setCatalog(page.list.map((item) => mapProduct(item, categoryList)));
      } catch {
        if (alive) {
          setCatalog(products);
        }
      }
    };

    void loadCatalog();
    return () => {
      alive = false;
    };
  }, []);

  const refreshCart = useCallback(async (): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    const items = await cartApi.items();
    setCart(items.map(mapCartLine));
  }, []);

  const refreshAddresses = useCallback(async (): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    const list = await addressApi.list();
    setAddresses(list);
    setSelectedAddressId((current) => current ?? list.find((address) => address.is_default)?.id ?? list[0]?.id);
  }, []);

  const refreshOrders = useCallback(async (): Promise<void> => {
    if (!authApi.storage.read()?.access_token) {
      return;
    }

    const page = await orderApi.list({ page: 1, pageSize: 20 });
    setOrders(page.list);
    setLastOrder((current) => current ?? page.list.find((order) => order.status === 1) ?? page.list[0] ?? null);
  }, []);

  const syncGuestCart = useCallback(async (lines: CartLine[]): Promise<void> => {
    const remoteLines = lines.filter((line) => line.skuId && line.quantity > 0);
    for (const line of remoteLines) {
      await cartApi.addItem(line.skuId as number, line.quantity);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setOrderPreview(null);
      setAddresses([]);
      setOrders([]);
      setLastOrder(null);
      setCurrentPayment(null);
      setSelectedAddressId(undefined);
      return;
    }

    void refreshCart().catch((error: Error) => setNotice(error.message));
    void refreshAddresses().catch((error: Error) => setNotice(error.message));
    void refreshOrders().catch((error: Error) => setNotice(error.message));
  }, [auth, refreshAddresses, refreshCart, refreshOrders]);

  useEffect(() => {
    const items = buildOrderItems(cart);
    if (!isLoggedIn || location.pathname !== "/checkout" || !selectedAddressId || items.length === 0) {
      setOrderPreview(null);
      return;
    }

    let alive = true;
    void orderApi.preview({ address_id: selectedAddressId, items })
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
  }, [cart, isLoggedIn, location.pathname, selectedAddressId]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);

  const navigateToPath = useCallback((to: string): void => {
    void navigate({ to });
  }, [navigate]);

  const resolveProductSku = useCallback(async (product: Product): Promise<Product> => {
    if (product.skuId || !product.apiId) {
      return product;
    }

    const detail = await catalogApi.productDetail(product.apiId);
    const sku = detail.skus[0];
    if (!sku) {
      throw new Error("商品暂无可售规格");
    }

    return {
      ...product,
      skuId: sku.id,
      price: moneyFromCent(sku.price)
    };
  }, []);

  const addToCart = useCallback(async (product: Product, quantity = 1): Promise<void> => {
    try {
      const cartProduct = await resolveProductSku(product);

      if (isLoggedIn && cartProduct.skuId) {
        await cartApi.addItem(cartProduct.skuId, quantity);
        await refreshCart();
        setNotice("已加入购物车：" + cartProduct.name);
        return;
      }

      setCart((current) => {
        const existing = current.find((line) => line.id === cartProduct.id);
        if (existing) {
          return current.map((line) => line.id === cartProduct.id ? { ...line, quantity: line.quantity + quantity } : line);
        }

        return [
          ...current,
          {
            id: cartProduct.id,
            skuId: cartProduct.skuId,
            productId: cartProduct.apiId,
            name: cartProduct.name,
            spec: cartProduct.skuId ? "后端默认规格" : cartProduct.category,
            price: cartProduct.price,
            quantity
          }
        ];
      });
      setNotice("已加入购物车：" + cartProduct.name);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "加入购物车失败");
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
        await refreshCart();
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
    const productId = String(product.apiId ?? product.id);
    setSelectedProduct(product);
    setProductDetail(null);
    navigateToPath(`/products/${productId}`);
    if (product.apiId) {
      void catalogApi.productDetail(product.apiId)
        .then(setProductDetail)
        .catch((error: Error) => setNotice(error.message));
    }
  }, [navigateToPath]);

  const ensureProductForRoute = useCallback((productId: string): void => {
    const matched = catalog.find((product) => String(product.apiId ?? product.id) === productId);
    if (matched && matched.id !== selectedProduct.id) {
      setSelectedProduct(matched);
    }

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId) || numericProductId <= 0) {
      return;
    }

    void catalogApi.productDetail(numericProductId)
      .then((detail) => {
        setProductDetail(detail);
        setSelectedProduct((current) => ({
          ...current,
          apiId: detail.id,
          categoryId: detail.category_id,
          description: detail.description,
          id: String(detail.id),
          name: detail.name,
          price: detail.skus[0] ? moneyFromCent(detail.skus[0].price) : current.price
        }));
      })
      .catch((error: Error) => setNotice(error.message));
  }, [catalog, selectedProduct.id]);

  const navigateProtected = useCallback((to: string): void => {
    if (!isLoggedIn) {
      setRedirectAfterLogin(to);
      navigateToPath("/login");
      setNotice("请先登录后继续操作");
      return;
    }
    navigateToPath(to);
  }, [isLoggedIn, navigateToPath]);

  const navigateToPage = useCallback((page: PageKey): void => {
    if (page === "product-detail") {
      openProduct(selectedProduct);
      return;
    }
    if (page === "reviews") {
      const productId = String(selectedProduct.apiId ?? selectedProduct.id);
      navigateToPath(`/products/${productId}/reviews`);
      return;
    }

    navigateToPath(routeByPage[page] ?? "/");
  }, [navigateToPath, openProduct, selectedProduct]);

  const openCurrentProductReviews = useCallback((): void => {
    const productId = String(selectedProduct.apiId ?? selectedProduct.id);
    navigateToPath(`/products/${productId}/reviews`);
  }, [navigateToPath, selectedProduct]);

  const handleLogin = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      const result = await authApi.login({ username, password });
      const guestCart = cart;
      authApi.storage.write(result);
      await syncGuestCart(guestCart);
      clearGuestCart();
      setAuth(result);
      await refreshCart();
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
      await syncGuestCart(guestCart);
      clearGuestCart();
      setAuth(result);
      await refreshCart();
      setNotice("注册成功");
      navigateToPath(redirectAfterLogin);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "注册失败");
    }
  }, [cart, navigateToPath, redirectAfterLogin, refreshCart, syncGuestCart]);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      if (auth?.refresh_token) {
        await authApi.logout(auth.refresh_token);
      }
    } catch {
      // 本地退出不依赖后端退出结果。
    } finally {
      authApi.storage.clear();
      setAuth(null);
      setCart([]);
      clearGuestCart();
      setNotice("已退出登录");
      navigateToPath("/");
    }
  }, [auth?.refresh_token, navigateToPath]);

  const createDefaultAddress = useCallback(async (): Promise<void> => {
    try {
      const created = await addressApi.create(defaultAddressPayload);
      setAddresses((current) => [created, ...current.filter((address) => address.id !== created.id)]);
      setSelectedAddressId(created.id);
      setNotice("已创建默认收货地址");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "创建地址失败");
    }
  }, []);

  const createAddress = useCallback(async (payload: AddressRequest): Promise<boolean> => {
    try {
      const created = await addressApi.create(payload);
      await refreshAddresses();
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
      await refreshAddresses();
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
      await refreshAddresses();
      setSelectedAddressId(id);
      setNotice("默认地址已更新");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "设置默认地址失败");
      return false;
    }
  }, [refreshAddresses]);

  const submitOrder = useCallback(async (): Promise<void> => {
    const items = buildOrderItems(cart);
    if (!selectedAddressId) {
      setNotice("请先选择收货地址");
      return;
    }
    if (items.length === 0) {
      setNotice("购物车没有可结算商品");
      return;
    }

    try {
      const preview = await orderApi.preview({ address_id: selectedAddressId, items });
      setOrderPreview(preview);
      const order = await orderApi.create({
        address_id: selectedAddressId,
        remark: "PC 端下单",
        idempotency_token: preview.idempotency_token,
        items
      });
      setLastOrder(order);
      setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]);
      setCurrentPayment(null);
      setOrderPreview(null);
      await refreshCart();
      navigateToPath("/payment");
      setNotice("订单创建成功，请选择支付方式");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "创建订单失败");
    }
  }, [cart, navigateToPath, refreshCart, selectedAddressId]);

  const openOrderPayment = useCallback((order: OrderResponse): void => {
    if (order.status !== 1) {
      setNotice("当前订单不需要支付");
      return;
    }
    setLastOrder(order);
    setCurrentPayment(null);
    navigateToPath("/payment");
  }, [navigateToPath]);

  const createPayment = useCallback(async (channel: PayChannel, scene?: PayScene): Promise<PaymentResponse | null> => {
    if (!lastOrder) {
      setNotice("暂无待支付订单");
      return null;
    }
    if (channel === "stripe") {
      setNotice("Stripe 支付暂未接入");
      return null;
    }

    try {
      const payment = await paymentApi.create({
        order_id: lastOrder.id,
        pay_channel: channel,
        pay_scene: scene
      });
      setCurrentPayment(payment);
      setNotice("支付单已创建");
      return payment;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "创建支付单失败");
      return null;
    }
  }, [lastOrder]);

  const checkPaymentStatus = useCallback(async (): Promise<void> => {
    if (!lastOrder) {
      setNotice("暂无待支付订单");
      return;
    }
    if (!currentPayment) {
      setNotice("请先创建支付单");
      return;
    }

    try {
      const latestPayment = await paymentApi.detail(currentPayment.payment_no);
      setCurrentPayment(latestPayment);
      if (latestPayment.status === 2) {
        setLastOrder({
          ...lastOrder,
          status: 2,
          status_text: "已支付"
        });
        setOrders((current) => current.map((order) => order.id === lastOrder.id ? { ...order, status: 2, status_text: "已支付" } : order));
        navigateToPath("/payment/result");
        setNotice("支付成功");
        return;
      }
      setNotice(`当前支付状态：${latestPayment.status_text}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "查询支付状态失败");
    }
  }, [currentPayment, lastOrder, navigateToPath]);

  const simulatePaymentComplete = useCallback(async (): Promise<void> => {
    if (!lastOrder) {
      setNotice("暂无待支付订单");
      return;
    }
    if (!currentPayment) {
      setNotice("请先创建支付单");
      return;
    }

    try {
      const paidPayment = await paymentApi.mockComplete(currentPayment.payment_no);
      const paidOrder = {
        ...lastOrder,
        status: 2,
        status_text: "已支付"
      };
      setLastOrder(paidOrder);
      setOrders((current) => current.map((order) => order.id === paidOrder.id ? paidOrder : order));
      setCurrentPayment(paidPayment);
      navigateToPath("/payment/result");
      setNotice("支付成功");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "支付确认失败");
    }
  }, [currentPayment, lastOrder, navigateToPath]);

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
    addresses,
    auth,
    cart,
    cartCount,
    catalog,
    globalSearch,
    isLoggedIn,
    lastOrder,
    notice,
    orders,
    orderPreview,
    currentPayment,
    productDetail,
    selectedAddressId,
    selectedProduct,
    addToCart,
    changeCartQuantity,
    createAddress,
    createDefaultAddress,
    checkPaymentStatus,
    createPayment,
    deleteAddress,
    ensureProductForRoute,
    handleLogin,
    handleLogout,
    handleRegister,
    navigateProtected,
    navigateToPage,
    openCurrentProductReviews,
    openOrderPayment,
    openProduct,
    setDefaultAddress,
    setGlobalSearch,
    setSelectedAddressId,
    simulatePaymentComplete,
    submitOrder,
    updateAddress,
    updateProfile
  }), [
    addresses,
    auth,
    cart,
    cartCount,
    catalog,
    globalSearch,
    isLoggedIn,
    lastOrder,
    notice,
    orders,
    orderPreview,
    currentPayment,
    productDetail,
    selectedAddressId,
    selectedProduct,
    addToCart,
    changeCartQuantity,
    createAddress,
    createDefaultAddress,
    checkPaymentStatus,
    createPayment,
    deleteAddress,
    ensureProductForRoute,
    handleLogin,
    handleLogout,
    handleRegister,
    navigateProtected,
    navigateToPage,
    openCurrentProductReviews,
    openOrderPayment,
    openProduct,
    setDefaultAddress,
    simulatePaymentComplete,
    submitOrder,
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
