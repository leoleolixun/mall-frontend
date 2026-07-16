import type React from "react";
import { ShoppingCart } from "lucide-react";
import { Outlet, useLocation } from "@tanstack/react-router";

import { useMallApp } from "@/app/context/MallAppContext";
import { Header, Shell } from "@/shared/components";

const getActiveHeader = (pathname: string): string => {
  if (pathname === "/login" || pathname.startsWith("/account")) {
    return "个人中心";
  }
  if (pathname === "/") {
    return "首页";
  }
  if (pathname.startsWith("/products")) {
    return "分类";
  }
  return "首页";
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const {
    auth,
    cartCount,
    isLoggedIn,
    notice,
    handleLogout,
    navigateProtected,
    navigateToPage,
    setGlobalSearch
  } = useMallApp();
  const isFramelessContentPage = location.pathname === "/" || location.pathname === "/products";

  return (
    <Shell>
      <Header
        active={getActiveHeader(location.pathname)}
        cartCount={cartCount}
        isLoggedIn={isLoggedIn}
        userName={auth?.user.nickname}
        onAccount={() => navigateProtected("/account")}
        onAddresses={() => navigateProtected("/account/addresses")}
        onCart={() => navigateToPage("cart")}
        onLogin={() => navigateToPage("auth")}
        onLogout={() => void handleLogout()}
        onNavigate={navigateToPage}
        onOrders={() => navigateProtected("/account/orders")}
        onSearch={(value) => {
          setGlobalSearch(value);
          navigateToPage("product-list");
        }}
      />
      <div className="page-canvas">
        <div className={isFramelessContentPage ? undefined : "standard-screen"}>
          <Outlet />
        </div>
      </div>
      <button className="floating-cart" onClick={() => navigateToPage("cart")} aria-label="打开购物车">
        <ShoppingCart size={20} />
        {cartCount > 0 ? <span>{cartCount}</span> : null}
      </button>
      {notice ? <div className="toast" role="status" aria-live="polite">{notice}</div> : null}
    </Shell>
  );
};

export default MainLayout;
