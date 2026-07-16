import type React from "react";
import { useEffect } from "react";
import { createRootRoute, createRoute, createRouter, useParams } from "@tanstack/react-router";

import { MallAppProvider, useMallApp } from "@/app/context/MallAppContext";
import { MainLayout } from "@/app/layouts/MainLayout";
import { AccountPage, type AccountView } from "@/pages/account/AccountPage";
import { AfterSaleDetailPage } from "@/pages/account/AfterSaleDetailPage";
import { OrderDetailPage } from "@/pages/account/OrderDetailPage";
import { usePaymentResult } from "@/features/payment/hooks/usePaymentResult";
import { AuthPage } from "@/pages/auth/AuthPage";
import { CartEmptyPage } from "@/pages/cart/CartEmptyPage";
import { CartPage } from "@/pages/cart/CartPage";
import { ProductDetailPage } from "@/pages/catalog/ProductDetailPage";
import { ProductListPage } from "@/pages/catalog/ProductListPage";
import { CheckoutPage } from "@/pages/checkout/CheckoutPage";
import { PaymentPage } from "@/pages/checkout/PaymentPage";
import { PaymentResultPage } from "@/pages/checkout/PaymentResultPage";
import { HomePage } from "@/pages/home/HomePage";

const RootLayout: React.FC = () => (
  <MallAppProvider>
    <MainLayout />
  </MallAppProvider>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth, navigateProtected } = useMallApp();

  useEffect(() => {
    if (!auth) {
      navigateProtected(`${window.location.pathname}${window.location.search}`);
    }
  }, [auth, navigateProtected]);

  return auth ? children : null;
};

const ProductRouteState: React.FC<{
  error?: string;
  loading?: boolean;
  onBack: () => void;
  onRetry: () => void;
}> = ({ error, loading = false, onBack, onRetry }) => (
  <section className="panel list-empty catalog-state">
    <h2>{loading ? "正在加载商品详情" : "商品详情加载失败"}</h2>
    <p>{loading ? "请稍候..." : error || "暂时无法获取该商品"}</p>
    {!loading ? (
      <div className="catalog-state-actions">
        <button className="primary-button" onClick={onRetry}>重新加载</button>
        <button className="plain-button" onClick={onBack}>返回商品列表</button>
      </div>
    ) : null}
  </section>
);

const HomeRoute: React.FC = () => {
  const { catalog, catalogError, catalogLoading, navigateToPage, openProduct, reloadCatalog, setGlobalSearch } = useMallApp();
  return (
    <HomePage
      catalog={catalog}
      catalogError={catalogError}
      catalogLoading={catalogLoading}
      onCategory={(category) => {
        setGlobalSearch(category);
        navigateToPage("product-list");
      }}
      onOpen={openProduct}
      onList={() => navigateToPage("product-list")}
      onRetryCatalog={reloadCatalog}
    />
  );
};

const ProductListRoute: React.FC = () => {
  const { addToCart, categories, globalSearch, openProduct } = useMallApp();
  return (
    <ProductListPage
      categories={categories}
      globalSearch={globalSearch}
      onAdd={addToCart}
      onOpen={openProduct}
    />
  );
};

const ProductDetailRoute: React.FC = () => {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const { addToCart, ensureProductForRoute, favoriteLoading, favorites, navigateProtected, navigateToPage, productDetail, productError, productLoading, selectedProduct, toggleFavorite } = useMallApp();

  useEffect(() => {
    ensureProductForRoute(productId);
  }, [ensureProductForRoute, productId]);

  if (productLoading) {
    return <ProductRouteState loading onBack={() => navigateToPage("product-list")} onRetry={() => ensureProductForRoute(productId)} />;
  }
  if (productError || !selectedProduct || !productDetail) {
    return <ProductRouteState error={productError} onBack={() => navigateToPage("product-list")} onRetry={() => ensureProductForRoute(productId)} />;
  }

  return (
    <ProductDetailPage
      product={selectedProduct}
      detail={productDetail}
      favorite={Boolean(selectedProduct.apiId && favorites.some((item) => item.apiId === selectedProduct.apiId))}
      favoriteLoading={favoriteLoading}
      onAdd={addToCart}
      onBuy={() => navigateProtected("/checkout")}
      onToggleFavorite={() => selectedProduct.apiId ? toggleFavorite(selectedProduct.apiId) : Promise.resolve(false)}
    />
  );
};

const CartRoute: React.FC = () => {
  const { auth, cart, cartError, cartLoading, changeCartQuantity, navigateProtected, navigateToPage, reloadCart } = useMallApp();
  if (auth && cartLoading) {
    return <section className="panel catalog-state"><h2>正在加载购物车</h2><p>请稍候...</p></section>;
  }
  if (auth && cartError) {
    return (
      <section className="panel catalog-state error">
        <h2>购物车加载失败</h2>
        <p>{cartError}</p>
        <button className="primary-button" onClick={reloadCart} type="button">重新加载</button>
      </section>
    );
  }
  return cart.length > 0
    ? (
      <CartPage
        lines={cart}
        onQuantityChange={changeCartQuantity}
        onCheckout={() => navigateProtected("/checkout")}
        onContinue={() => navigateToPage("product-list")}
      />
    )
    : (
      <CartEmptyPage
        isLoggedIn={Boolean(auth)}
        onContinue={() => navigateToPage("product-list")}
        onLogin={() => navigateProtected("/cart")}
      />
    );
};

const AuthRoute: React.FC = () => {
  const { handleLogin, handleRegister } = useMallApp();
  return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
};

const AccountRoute: React.FC<{ view?: AccountView }> = ({ view = "overview" }) => {
  const {
    addressError,
    addressLoading,
    addresses,
    afterSaleError,
    afterSaleLoading,
    afterSales,
    auth,
    availableCoupons,
    cancelAfterSale,
    cart,
    claimCoupon,
    couponError,
    couponLoading,
    createAddress,
    deleteAddress,
    favoriteError,
    favoriteLoading,
    favorites,
    handleLogin,
    handleRegister,
    lastOrder,
    navigateProtected,
    navigateToPage,
    openOrderPayment,
    openProduct,
    orderError,
    orderLoading,
    orders,
    reloadOrders,
    reloadAddresses,
    setDefaultAddress,
    setSelectedMerchantCoupon,
    toggleFavorite,
    updateAddress,
    updateProfile,
    userCoupons
  } = useMallApp();

  useEffect(() => {
    if (!auth) {
      const accountPathByView: Record<AccountView, string> = {
        overview: "/account",
        profile: "/account/profile",
        orders: "/account/orders",
        addresses: "/account/addresses",
        coupons: "/account/coupons",
        favorites: "/account/favorites",
        afterSales: "/account/after-sales"
      };
      navigateProtected(accountPathByView[view]);
    }
  }, [auth, navigateProtected, view]);

  if (!auth) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <AccountPage
      addressListError={addressError}
      addressLoading={addressLoading}
      addresses={addresses}
      afterSaleError={afterSaleError}
      afterSaleLoading={afterSaleLoading}
      afterSales={afterSales}
      availableCoupons={availableCoupons}
      couponError={couponError}
      couponLoading={couponLoading}
      favoriteError={favoriteError}
      favoriteLoading={favoriteLoading}
      favorites={favorites}
      lastOrder={lastOrder}
      orderError={orderError}
      orderLoading={orderLoading}
      orders={orders}
      onAfterSaleCancel={cancelAfterSale}
      onAddressCreate={createAddress}
      onAddressDelete={deleteAddress}
      onAddressSetDefault={setDefaultAddress}
      onAddressUpdate={updateAddress}
      onAddressesReload={reloadAddresses}
      onCouponClaim={claimCoupon}
      onCouponUse={(id) => {
        const coupon = userCoupons.find((item) => item.id === id);
        if (coupon) setSelectedMerchantCoupon(coupon.coupon.merchant_id, id);
        if (cart.length > 0) {
          navigateProtected("/checkout");
        } else {
          navigateToPage("product-list");
        }
      }}
      onFavoriteToggle={toggleFavorite}
      onOrderPay={openOrderPayment}
      onOrdersReload={reloadOrders}
      onProductOpen={openProduct}
      onProfileUpdate={updateProfile}
      user={auth.user}
      userCoupons={userCoupons}
      view={view}
    />
  );
};

const OrderDetailRoute: React.FC = () => {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const {
    cancelOrder,
    confirmOrder,
    createAfterSale,
    getOrderDetail,
    getOrderLogistics,
    navigateProtected,
    openOrderPayment
  } = useMallApp();

  return (
    <OrderDetailPage
      orderId={Number(orderId)}
      onAfterSaleCreate={createAfterSale}
      onBack={() => navigateProtected("/account/orders")}
      onCancel={cancelOrder}
      onConfirm={confirmOrder}
      onLoad={getOrderDetail}
      onLoadLogistics={getOrderLogistics}
      onPay={openOrderPayment}
    />
  );
};

const AfterSaleDetailRoute: React.FC = () => {
  const { afterSaleId } = useParams({ strict: false }) as { afterSaleId: string };
  const { cancelAfterSale, getAfterSaleDetail, navigateProtected } = useMallApp();

  return (
    <AfterSaleDetailPage
      afterSaleId={Number(afterSaleId)}
      onBack={() => navigateProtected("/account/after-sales")}
      onCancel={cancelAfterSale}
      onLoad={getAfterSaleDetail}
    />
  );
};

const CheckoutRoute: React.FC = () => {
  const {
    addresses,
    cart,
    navigateProtected,
    orderPreview,
    orderSubmitting,
    selectedAddressId,
    selectedUserCouponIds,
    setSelectedAddressId,
    setSelectedMerchantCoupon,
    userCoupons,
    submitOrder
  } = useMallApp();

  return (
    <CheckoutPage
      lines={cart}
      addresses={addresses}
      userCoupons={userCoupons}
      selectedAddressId={selectedAddressId}
      selectedUserCouponIds={selectedUserCouponIds}
      preview={orderPreview}
      submitting={orderSubmitting}
      onAddressSelect={setSelectedAddressId}
      onCouponSelect={setSelectedMerchantCoupon}
      onManageAddresses={() => navigateProtected("/account/addresses")}
      onPay={submitOrder}
    />
  );
};

const PaymentResultRoute: React.FC = () => {
  const { navigateProtected, navigateToPage } = useMallApp();
  const result = usePaymentResult();
  return (
    <PaymentResultPage
      checking={result.checking}
      error={result.error}
      payment={result.payment}
      onContinueShopping={() => navigateToPage("product-list")}
      onRetry={result.retry}
      onViewOrders={() => navigateProtected("/account/orders")}
    />
  );
};

const PaymentFailedRoute: React.FC = () => {
  const { navigateProtected, navigateToPage } = useMallApp();
  return (
    <PaymentResultPage
      checking={false}
      error="支付渠道返回失败，请返回订单中心重新发起支付"
      failed
      payment={null}
      onContinueShopping={() => navigateToPage("product-list")}
      onRetry={() => navigateProtected("/account/orders")}
      onViewOrders={() => navigateProtected("/account/orders")}
    />
  );
};

const PaymentRoute: React.FC = () => {
  const { checkPaymentStatus, createPayment, currentPayment, lastOrder, lastTrade, navigateProtected } = useMallApp();
  return (
    <PaymentPage
      order={lastOrder}
      trade={lastTrade}
      payment={currentPayment}
      onBackCheckout={() => navigateProtected(lastTrade ? "/account/orders" : "/checkout")}
      onCheckPaymentStatus={checkPaymentStatus}
      onCreatePayment={createPayment}
    />
  );
};

const rootRoute = createRootRoute({
  component: RootLayout
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: ProductListRoute
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$productId",
  component: ProductDetailRoute
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartRoute
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: AuthRoute
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: AccountRoute
});

const accountOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/orders",
  component: () => <AccountRoute view="orders" />
});

const accountOrderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/orders/$orderId",
  component: () => <ProtectedRoute><OrderDetailRoute /></ProtectedRoute>
});

const accountAddressesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/addresses",
  component: () => <AccountRoute view="addresses" />
});

const accountProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/profile",
  component: () => <AccountRoute view="profile" />
});

const accountCouponsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/coupons",
  component: () => <AccountRoute view="coupons" />
});

const accountFavoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/favorites",
  component: () => <AccountRoute view="favorites" />
});

const accountAfterSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/after-sales",
  component: () => <AccountRoute view="afterSales" />
});

const accountAfterSaleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/after-sales/$afterSaleId",
  component: () => <ProtectedRoute><AfterSaleDetailRoute /></ProtectedRoute>
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: () => <ProtectedRoute><CheckoutRoute /></ProtectedRoute>
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: () => <ProtectedRoute><PaymentRoute /></ProtectedRoute>
});

const paymentResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment/result",
  component: () => <ProtectedRoute><PaymentResultRoute /></ProtectedRoute>
});

const paymentFailedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment/failed",
  component: () => <ProtectedRoute><PaymentFailedRoute /></ProtectedRoute>
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  cartRoute,
  authRoute,
  accountRoute,
  accountProfileRoute,
  accountOrdersRoute,
  accountOrderDetailRoute,
  accountAddressesRoute,
  accountCouponsRoute,
  accountFavoritesRoute,
  accountAfterSalesRoute,
  accountAfterSaleDetailRoute,
  checkoutRoute,
  paymentRoute,
  paymentResultRoute,
  paymentFailedRoute
]);

export const router = createRouter({
  routeTree
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
