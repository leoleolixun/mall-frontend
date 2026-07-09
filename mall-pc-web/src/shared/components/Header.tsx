import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, MapPin, Package, Search, ShieldCheck, ShoppingCart, UserRound } from "lucide-react";
import type { PageKey } from "@/shared/types/domain";

export const Header: React.FC<{
  active: string;
  cartCount: number;
  isLoggedIn: boolean;
  userName?: string;
  onAccount: () => void;
  onAddresses: () => void;
  onCart: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onMessages: () => void;
  onNavigate: (page: PageKey) => void;
  onOrders: () => void;
  onSecurity: () => void;
  onSearch: (value: string) => void;
}> = ({
  active,
  cartCount,
  isLoggedIn,
  userName,
  onAccount,
  onAddresses,
  onCart,
  onLogin,
  onLogout,
  onMessages,
  onNavigate,
  onOrders,
  onSecurity,
  onSearch
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleUserButtonClick = (): void => {
    if (!isLoggedIn) {
      onLogin();
      return;
    }
    setMenuOpen((current) => !current);
  };

  const runMenuAction = (action: () => void): void => {
    setMenuOpen(false);
    action();
  };

  return (
    <header className="site-header">
      <button className="brand-button" onClick={() => onNavigate("product-list")}>
        <span>Mall</span>
      </button>
      <nav className="top-nav" aria-label="主导航">
        <button className={active === "首页" ? "active" : ""} onClick={() => onNavigate("home")}>首页</button>
        <button className={active === "分类" ? "active" : ""} onClick={() => onNavigate("product-list")}>分类</button>
        <button className={active === "新品" ? "active" : ""} onClick={() => onNavigate("presale")}>新品</button>
        <button className={active === "热卖" ? "active" : ""} onClick={() => onNavigate("bundle")}>热卖</button>
        <button className={active === "个人中心" ? "active" : ""} onClick={() => isLoggedIn ? onAccount() : onNavigate("auth")}>个人中心</button>
      </nav>
      <label className="search-box">
        <Search size={16} />
        <input placeholder="搜索商品 / 品牌 / 分类" onChange={(event) => onSearch(event.target.value)} />
      </label>
      <div className="user-menu" ref={userMenuRef}>
        <button
          className="plain-button user-menu-trigger"
          onClick={handleUserButtonClick}
          aria-expanded={menuOpen}
          aria-haspopup={isLoggedIn ? "menu" : undefined}
        >
          <UserRound size={16} />
          <span>{userName || "登录"}</span>
          {isLoggedIn ? <ChevronDown size={14} /> : null}
        </button>
        {isLoggedIn && menuOpen ? (
          <div className="user-menu-panel" role="menu">
            <button type="button" role="menuitem" onClick={() => runMenuAction(onAccount)}>
              <UserRound size={15} />
              个人中心
            </button>
            <button type="button" role="menuitem" onClick={() => runMenuAction(onOrders)}>
              <Package size={15} />
              我的订单
            </button>
            <button type="button" role="menuitem" onClick={() => runMenuAction(onAddresses)}>
              <MapPin size={15} />
              地址管理
            </button>
            <button type="button" role="menuitem" onClick={() => runMenuAction(onMessages)}>
              <Bell size={15} />
              消息中心
            </button>
            <button type="button" role="menuitem" onClick={() => runMenuAction(onSecurity)}>
              <ShieldCheck size={15} />
              账号安全
            </button>
            <span />
            <button type="button" role="menuitem" className="danger" onClick={() => runMenuAction(onLogout)}>
              <LogOut size={15} />
              退出登录
            </button>
          </div>
        ) : null}
      </div>
      <button className="primary-button cart-entry" onClick={onCart}>
        <ShoppingCart size={16} />
        购物车
        {cartCount > 0 ? <span>{cartCount}</span> : null}
      </button>
    </header>
  );
};

export default Header;
