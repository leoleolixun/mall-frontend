import type React from "react";
import { useEffect } from "react";
import { createRootRoute, createRoute, createRouter, useParams } from "@tanstack/react-router";

import { MallAppProvider, useMallApp } from "@/app/context/MallAppContext";
import { MainLayout } from "@/app/layouts/MainLayout";
import { AccountPage, type AccountView } from "@/pages/account/AccountPage";
import { usePaymentResult } from "@/features/payment/hooks/usePaymentResult";
import { AuthPage } from "@/pages/auth/AuthPage";
import { CartEmptyPage } from "@/pages/cart/CartEmptyPage";
import { CartPage } from "@/pages/cart/CartPage";
import { BundlePage } from "@/pages/catalog/BundlePage";
import { ComparePage } from "@/pages/catalog/ComparePage";
import { PresalePage } from "@/pages/catalog/PresalePage";
import { ProductDetailPage } from "@/pages/catalog/ProductDetailPage";
import { ProductListPage } from "@/pages/catalog/ProductListPage";
import { ReviewsPage } from "@/pages/catalog/ReviewsPage";
import { CheckoutPage } from "@/pages/checkout/CheckoutPage";
import { PaymentPage } from "@/pages/checkout/PaymentPage";
import { PaymentResultPage } from "@/pages/checkout/PaymentResultPage";
import { PickupPage } from "@/pages/checkout/PickupPage";
import { HomePage } from "@/pages/home/HomePage";

const RootLayout: React.FC = () => (
  <MallAppProvider>
    <MainLayout />
  </MallAppProvider>
);

const HomeRoute: React.FC = () => {
  const { addToCart, catalog, navigateToPage, openProduct } = useMallApp();
  return (
    <HomePage
      catalog={catalog}
      onAdd={addToCart}
      onOpen={openProduct}
      onList={() => navigateToPage("product-list")}
      onPresale={() => navigateToPage("presale")}
      onBundle={() => navigateToPage("bundle")}
    />
  );
};

const ProductListRoute: React.FC = () => {
  const { addToCart, catalog, globalSearch, openProduct } = useMallApp();
  return <ProductListPage catalog={catalog} globalSearch={globalSearch} onAdd={addToCart} onOpen={openProduct} />;
};

const ProductDetailRoute: React.FC = () => {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const { addToCart, ensureProductForRoute, navigateProtected, openCurrentProductReviews, productDetail, selectedProduct } = useMallApp();

  useEffect(() => {
    ensureProductForRoute(productId);
  }, [ensureProductForRoute, productId]);

  return (
    <ProductDetailPage
      product={selectedProduct}
      detail={productDetail}
      onAdd={addToCart}
      onBuy={() => navigateProtected("/checkout")}
      onReviews={openCurrentProductReviews}
    />
  );
};

const ReviewsRoute: React.FC = () => {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const { addToCart, ensureProductForRoute, openProduct, selectedProduct } = useMallApp();

  useEffect(() => {
    ensureProductForRoute(productId);
  }, [ensureProductForRoute, productId]);

  return <ReviewsPage onAdd={addToCart} onBack={() => openProduct(selectedProduct)} />;
};

const BundleRoute: React.FC = () => {
  const { addToCart, navigateProtected } = useMallApp();
  return <BundlePage onAdd={addToCart} onBuy={() => navigateProtected("/checkout")} />;
};

const CartRoute: React.FC = () => {
  const { addToCart, auth, cart, changeCartQuantity, navigateProtected, navigateToPage } = useMallApp();
  return cart.length > 0
    ? (
      <CartPage
        lines={cart}
        onQuantityChange={changeCartQuantity}
        onCheckout={() => navigateProtected("/checkout")}
        onContinue={() => navigateToPage("product-list")}
        onAdd={addToCart}
      />
    )
    : (
      <CartEmptyPage
        isLoggedIn={Boolean(auth)}
        onContinue={() => navigateToPage("product-list")}
        onLogin={() => navigateProtected("/cart")}
        onAdd={addToCart}
      />
    );
};

const AuthRoute: React.FC = () => {
  const { handleLogin, handleRegister } = useMallApp();
  return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
};

const AccountRoute: React.FC<{ view?: AccountView }> = ({ view = "overview" }) => {
  const {
    addresses,
    auth,
    createAddress,
    deleteAddress,
    handleLogin,
    handleRegister,
    lastOrder,
    navigateProtected,
    openOrderPayment,
    orders,
    setDefaultAddress,
    updateAddress,
    updateProfile
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
        history: "/account/history",
        reviews: "/account/reviews",
        points: "/account/points",
        security: "/account/security",
        privacy: "/account/privacy",
        messages: "/account/messages",
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
      addresses={addresses}
      lastOrder={lastOrder}
      orders={orders}
      onAddressCreate={createAddress}
      onAddressDelete={deleteAddress}
      onAddressSetDefault={setDefaultAddress}
      onAddressUpdate={updateAddress}
      onOrderPay={openOrderPayment}
      onProfileUpdate={updateProfile}
      user={auth.user}
      view={view}
    />
  );
};

const CheckoutRoute: React.FC = () => {
  const {
    addresses,
    cart,
    createDefaultAddress,
    navigateProtected,
    orderPreview,
    selectedAddressId,
    setSelectedAddressId,
    submitOrder
  } = useMallApp();

  return (
    <CheckoutPage
      lines={cart}
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      preview={orderPreview}
      onAddressSelect={setSelectedAddressId}
      onCreateDefaultAddress={createDefaultAddress}
      onPay={submitOrder}
      onPickup={() => navigateProtected("/pickup")}
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
  const { checkPaymentStatus, createPayment, currentPayment, lastOrder, navigateProtected } = useMallApp();
  return (
    <PaymentPage
      order={lastOrder}
      payment={currentPayment}
      onBackCheckout={() => navigateProtected("/checkout")}
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

const reviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$productId/reviews",
  component: ReviewsRoute
});

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compare",
  component: ComparePage
});

const presaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/presale",
  component: PresalePage
});

const bundleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bundle",
  component: BundleRoute
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

const accountHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/history",
  component: () => <AccountRoute view="history" />
});

const accountReviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/reviews",
  component: () => <AccountRoute view="reviews" />
});

const accountPointsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/points",
  component: () => <AccountRoute view="points" />
});

const accountSecurityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/security",
  component: () => <AccountRoute view="security" />
});

const accountPrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/privacy",
  component: () => <AccountRoute view="privacy" />
});

const accountMessagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/messages",
  component: () => <AccountRoute view="messages" />
});

const accountAfterSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/after-sales",
  component: () => <AccountRoute view="afterSales" />
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutRoute
});

const pickupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pickup",
  component: PickupPage
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: PaymentRoute
});

const paymentResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment/result",
  component: PaymentResultRoute
});

const paymentFailedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment/failed",
  component: PaymentFailedRoute
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  reviewsRoute,
  compareRoute,
  presaleRoute,
  bundleRoute,
  cartRoute,
  authRoute,
  accountRoute,
  accountProfileRoute,
  accountOrdersRoute,
  accountAddressesRoute,
  accountCouponsRoute,
  accountFavoritesRoute,
  accountHistoryRoute,
  accountReviewsRoute,
  accountPointsRoute,
  accountSecurityRoute,
  accountPrivacyRoute,
  accountMessagesRoute,
  accountAfterSalesRoute,
  checkoutRoute,
  pickupRoute,
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
