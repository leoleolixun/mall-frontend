import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock3,
  Edit3,
  Heart,
  Home,
  MapPin,
  Package,
  Plus,
  Ticket,
  Trash2,
  Truck,
  X
} from "lucide-react";

import type { AddressRequest, AddressResponse, AfterSaleResponse, AuthResponse, CouponResponse, OrderResponse, UpdateProfileRequest, UserCouponResponse } from "@/api/client";
import { moneyFromCent } from "@/api/client";
import { getCityOptions, getDistrictOptions, provinceOptions } from "@/features/address/helpers/areaOptions";
import { ProductVisual } from "@/shared/components/ProductVisual";
import type { Product } from "@/shared/types/domain";
import { formatPrice } from "@/shared/utils/money";

export type AccountView =
  | "overview"
  | "profile"
  | "orders"
  | "addresses"
  | "coupons"
  | "favorites"
  | "afterSales";

interface AccountPageProps {
  addressListError: string;
  addressLoading: boolean;
  addresses: AddressResponse[];
  afterSaleError: string;
  afterSaleLoading: boolean;
  afterSales: AfterSaleResponse[];
  availableCoupons: CouponResponse[];
  couponError: string;
  couponLoading: boolean;
  favoriteError: string;
  favoriteLoading: boolean;
  favorites: Product[];
  lastOrder: OrderResponse | null;
  orderError: string;
  orderLoading: boolean;
  orders: OrderResponse[];
  onAfterSaleCancel: (id: number) => Promise<boolean>;
  onAddressCreate: (payload: AddressRequest) => Promise<boolean>;
  onAddressDelete: (id: number) => Promise<boolean>;
  onAddressSetDefault: (id: number) => Promise<boolean>;
  onAddressUpdate: (id: number, payload: AddressRequest) => Promise<boolean>;
  onAddressesReload: () => void;
  onCouponClaim: (id: number) => Promise<boolean>;
  onCouponUse: (id: number) => void;
  onFavoriteToggle: (productId: number) => Promise<boolean>;
  onOrderPay: (order: OrderResponse) => void;
  onOrdersReload: () => void;
  onProductOpen: (product: Product) => void;
  onProfileUpdate: (payload: UpdateProfileRequest) => Promise<boolean>;
  user: AuthResponse["user"];
  userCoupons: UserCouponResponse[];
  view?: AccountView;
}

type ProfileForm = {
  avatar: string;
  bio: string;
  birthday: string;
  gender: "保密" | "男" | "女";
  mobile: string;
  nickname: string;
};

type AddressDialog = {
  address?: AddressResponse;
  mode: "create" | "edit";
};

const emptyAddressForm: AddressRequest = {
  city: "",
  detail: "",
  district: "",
  is_default: false,
  province: "",
  receiver_name: "",
  receiver_phone: ""
};

const addressToForm = (address: AddressResponse): AddressRequest => ({
  city: address.city,
  detail: address.detail,
  district: address.district,
  is_default: address.is_default,
  province: address.province,
  receiver_name: address.receiver_name,
  receiver_phone: address.receiver_phone
});

const validateAddressForm = (form: AddressRequest): string => {
  if (!form.receiver_name.trim()) {
    return "请填写收货人姓名";
  }
  if (!/^1\d{10}$/.test(form.receiver_phone.trim())) {
    return "请填写 11 位手机号";
  }
  if (!form.province.trim() || !form.city.trim() || !form.district.trim()) {
    return "请完整填写省、市、区";
  }
  if (!form.detail.trim()) {
    return "请填写详细地址";
  }
  return "";
};

const buildProfileForm = (user: AuthResponse["user"]): ProfileForm => ({
  avatar: user.avatar || "",
  bio: user.bio || "",
  birthday: user.birthday || "",
  gender: user.gender === "男" || user.gender === "女" || user.gender === "保密" ? user.gender : "保密",
  mobile: user.mobile || "",
  nickname: user.nickname || ""
});

const validateProfileForm = (form: ProfileForm): string => {
  if (!form.nickname.trim()) {
    return "请填写昵称";
  }
  if (form.mobile.trim() && !/^1\d{10}$/.test(form.mobile.trim())) {
    return "请填写 11 位手机号";
  }
  if (form.avatar.trim().length > 255) {
    return "头像地址不能超过 255 个字符";
  }
  return "";
};

const navGroups = [
  {
    title: "个人中心",
    items: [
      { label: "会员资产", to: "/account", view: "overview" },
      { label: "个人资料", to: "/account/profile", view: "profile" },
      { label: "我的订单", to: "/account/orders", view: "orders" },
      { label: "地址管理", to: "/account/addresses", view: "addresses" }
    ]
  },
  {
    title: "购物与售后",
    items: [
      { label: "优惠券", to: "/account/coupons", view: "coupons" },
      { label: "收藏商品", to: "/account/favorites", view: "favorites" },
      { label: "售后服务", to: "/account/after-sales", view: "afterSales" }
    ]
  }
] as const;

const pageMeta: Record<AccountView, { title: string; desc: string }> = {
  overview: { title: "会员资产", desc: "查看购物资产、最近订单、常用地址和会员服务。" },
  profile: { title: "个人资料", desc: "维护基础资料、头像、昵称和联系信息。" },
  orders: { title: "我的订单", desc: "跟踪全部订单状态，处理支付、配送、收货和售后。" },
  addresses: { title: "地址管理", desc: "管理收货地址，设置常用地址并用于订单结算。" },
  coupons: { title: "优惠券", desc: "查看可用、即将过期和已使用的优惠券。" },
  favorites: { title: "收藏商品", desc: "管理关注商品，方便后续比价和下单。" },
  afterSales: { title: "售后服务", desc: "查看退换货、退款、维修等售后进度。" }
};

const formatAddressText = (address: AddressResponse): string =>
  `${address.province}${address.city}${address.district}${address.detail}`;

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("zh-CN");
};

export const AccountPage: React.FC<AccountPageProps> = ({
  addressListError,
  addressLoading,
  addresses,
  afterSaleError,
  afterSaleLoading,
  afterSales,
  availableCoupons,
  couponError,
  couponLoading,
  favoriteError,
  favoriteLoading,
  favorites,
  lastOrder,
  orderError,
  orderLoading,
  orders,
  onAfterSaleCancel,
  onAddressCreate,
  onAddressDelete,
  onAddressSetDefault,
  onAddressUpdate,
  onAddressesReload,
  onCouponClaim,
  onCouponUse,
  onFavoriteToggle,
  onOrderPay,
  onOrdersReload,
  onProductOpen,
  onProfileUpdate,
  user,
  userCoupons,
  view = "overview"
}) => {
  const [addressDialog, setAddressDialog] = useState<AddressDialog | null>(null);
  const [addressForm, setAddressForm] = useState<AddressRequest>(emptyAddressForm);
  const [addressError, setAddressError] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState<ProfileForm>(() => buildProfileForm(user));
  const [profileSaving, setProfileSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const orderRows = useMemo(() => {
    const source = orders.length > 0 ? orders : lastOrder ? [lastOrder] : [];
    return source.map((order) => ({
      amount: formatPrice(moneyFromCent(order.payable_amount)),
      order,
      status: order.status_text,
      no: order.order_no
    }));
  }, [lastOrder, orders]);
  const defaultAddresses = addresses.slice(0, 3);
  const unusedCoupons = userCoupons.filter((item) => item.status === 1);
  const cityOptions = getCityOptions(addressForm.province);
  const districtOptions = getDistrictOptions(addressForm.province, addressForm.city);
  const accountName = user.nickname || user.mobile || `用户 ${user.id}`;
  const maskedMobile = user.mobile ? user.mobile.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2") : "未绑定";
  const initial = accountName.slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!profileEditing) {
      setProfileForm(buildProfileForm(user));
      setProfileError("");
    }
  }, [profileEditing, user]);

  const openCreateAddress = (): void => {
    setAddressDialog({ mode: "create" });
    setAddressForm({ ...emptyAddressForm, is_default: addresses.length === 0 });
    setAddressError("");
    setDeleteConfirmId(null);
  };

  const openEditAddress = (address: AddressResponse): void => {
    setAddressDialog({ address, mode: "edit" });
    setAddressForm(addressToForm(address));
    setAddressError("");
    setDeleteConfirmId(null);
  };

  const closeAddressDialog = (): void => {
    if (addressSaving) {
      return;
    }
    setAddressDialog(null);
    setAddressError("");
  };

  const updateAddressForm = (field: keyof AddressRequest, value: string | boolean): void => {
    setAddressForm((current) => ({ ...current, [field]: value }));
    setAddressError("");
  };

  const updateProvince = (province: string): void => {
    setAddressForm((current) => ({ ...current, city: "", district: "", province }));
    setAddressError("");
  };

  const updateCity = (city: string): void => {
    setAddressForm((current) => ({ ...current, city, district: "" }));
    setAddressError("");
  };

  const submitAddressForm = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const normalized: AddressRequest = {
      city: addressForm.city.trim(),
      detail: addressForm.detail.trim(),
      district: addressForm.district.trim(),
      is_default: addressForm.is_default,
      province: addressForm.province.trim(),
      receiver_name: addressForm.receiver_name.trim(),
      receiver_phone: addressForm.receiver_phone.trim()
    };
    const error = validateAddressForm(normalized);
    if (error) {
      setAddressError(error);
      return;
    }

    setAddressSaving(true);
    const ok = addressDialog?.mode === "edit" && addressDialog.address
      ? await onAddressUpdate(addressDialog.address.id, normalized)
      : await onAddressCreate(normalized);
    setAddressSaving(false);

    if (ok) {
      setAddressDialog(null);
    }
  };

  const handleDeleteAddress = async (address: AddressResponse): Promise<void> => {
    if (deleteConfirmId !== address.id) {
      setDeleteConfirmId(address.id);
      return;
    }

    setDeletingAddressId(address.id);
    const ok = await onAddressDelete(address.id);
    setDeletingAddressId(null);
    if (ok) {
      setDeleteConfirmId(null);
    }
  };

  const updateProfileForm = (field: keyof ProfileForm, value: string): void => {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileError("");
  };

  const cancelProfileEdit = (): void => {
    if (profileSaving) {
      return;
    }
    setProfileForm(buildProfileForm(user));
    setProfileError("");
    setProfileEditing(false);
  };

  const submitProfileForm = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const normalized: ProfileForm = {
      ...profileForm,
      avatar: profileForm.avatar.trim(),
      mobile: profileForm.mobile.trim(),
      nickname: profileForm.nickname.trim()
    };
    const error = validateProfileForm(normalized);
    if (error) {
      setProfileError(error);
      return;
    }

    setProfileSaving(true);
    const ok = await onProfileUpdate({
      avatar: normalized.avatar,
      bio: normalized.bio.trim(),
      birthday: normalized.birthday,
      gender: normalized.gender,
      mobile: normalized.mobile,
      nickname: normalized.nickname
    });
    setProfileSaving(false);
    if (ok) {
      setProfileEditing(false);
    }
  };

  const renderOverview = (): React.ReactNode => (
    <>
      <section className="panel account-hero-card">
        <div className="account-avatar">{initial}</div>
        <div className="account-hero-copy">
          <h1>{user.nickname || "商城会员"}</h1>
          <p>账号资料 · 手机号 {maskedMobile}</p>
        </div>
        <Link className="account-soft-link" to="/account/profile">完善资料</Link>
      </section>

      <section className="account-assets-grid" aria-label="会员资产">
        <Link className="panel account-asset-card" to="/account/coupons">
          <Ticket size={20} />
          <span>可用优惠券</span>
          <strong>{unusedCoupons.length} 张</strong>
        </Link>
        <Link className="panel account-asset-card" to="/account/favorites">
          <Heart size={20} />
          <span>收藏商品</span>
          <strong>{favorites.length} 件</strong>
        </Link>
        <Link className="panel account-asset-card" to="/account/orders">
          <Package size={20} />
          <span>全部订单</span>
          <strong>{orders.length} 笔</strong>
        </Link>
        <Link className="panel account-asset-card" to="/account/addresses">
          <MapPin size={20} />
          <span>收货地址</span>
          <strong>{addresses.length} 个</strong>
        </Link>
      </section>

      <div className="account-content-grid">
        {renderOrderPanel("最近订单", true)}
        {renderAddressPanel("常用地址", true)}
      </div>

      <section className="panel account-service-panel">
        <div className="account-section-title">
          <h2>会员服务</h2>
          <span>高频服务入口</span>
        </div>
        <div className="account-service-grid">
          <Link to="/account/orders"><Package size={18} /><span>订单同步</span><ChevronRight size={16} /></Link>
          <Link to="/account/addresses"><MapPin size={18} /><span>地址管理</span><ChevronRight size={16} /></Link>
          <Link to="/account/after-sales"><Truck size={18} /><span>售后服务</span><ChevronRight size={16} /></Link>
        </div>
      </section>
    </>
  );

  const renderOrderPanel = (title = "我的订单", compact = false): React.ReactNode => (
    <section className="panel account-orders-panel">
      <div className="account-section-title">
        <h2>{title}</h2>
        {compact ? <Link to="/account/orders">查看全部订单</Link> : <span>{orderRows.length} 笔订单</span>}
      </div>
      {orderLoading ? (
        <div className="account-resource-state"><Clock3 size={24} /><strong>正在加载订单</strong></div>
      ) : orderError ? (
        <div className="account-resource-state error">
          <strong>订单加载失败</strong>
          <p>{orderError}</p>
          <button className="plain-button small" onClick={onOrdersReload} type="button">重新加载</button>
        </div>
      ) : <table className="account-order-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>金额</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orderRows.length > 0 ? orderRows.map((row) => (
            <tr key={row.no}>
              <td>{row.no}</td>
              <td>{row.amount}</td>
              <td>{row.status}</td>
              <td>
                <div className="account-order-actions">
                  <Link params={{ orderId: String(row.order.id) }} to="/account/orders/$orderId">查看详情</Link>
                  {row.order.status === 1 ? <button onClick={() => onOrderPay(row.order)} type="button">去支付</button> : null}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4}>暂无订单</td>
            </tr>
          )}
        </tbody>
      </table>}
    </section>
  );

  const renderAddressPanel = (title = "地址管理", compact = false): React.ReactNode => (
    <section className="panel account-address-panel">
      <div className="account-section-title">
        <h2>{title}</h2>
        {compact ? (
          <Link to="/account/addresses">管理地址</Link>
        ) : (
          <button className="primary-button small" onClick={openCreateAddress} type="button">
            <Plus size={14} />
            新增地址
          </button>
        )}
      </div>
      {addressLoading ? (
        <div className="account-resource-state"><Clock3 size={24} /><strong>正在加载收货地址</strong></div>
      ) : addressListError ? (
        <div className="account-resource-state error">
          <strong>收货地址加载失败</strong>
          <p>{addressListError}</p>
          <button className="plain-button small" onClick={onAddressesReload} type="button">重新加载</button>
        </div>
      ) : compact ? renderCompactAddressList() : renderAddressManager()}
    </section>
  );

  const renderCompactAddressList = (): React.ReactNode => (
    <div className="account-address-list">
      {defaultAddresses.length > 0 ? defaultAddresses.map((address, index) => (
        <article className={address.is_default || index === 0 ? "account-address-card active" : "account-address-card"} key={address.id}>
          <MapPin size={16} />
          <span>{formatAddressText(address)}</span>
          {address.is_default || index === 0 ? <strong>默认</strong> : null}
        </article>
      )) : (
        <div className="account-address-empty compact">
          <Home size={28} />
          <strong>暂无收货地址</strong>
          <p>新增地址后可在结算时直接选择。</p>
        </div>
      )}
    </div>
  );

  const renderAddressManager = (): React.ReactNode => (
    <>
      {addresses.length === 0 ? (
        <div className="account-address-empty">
          <Home size={34} />
          <strong>暂无收货地址</strong>
          <p>新增地址后，下单结算时可以直接选择。</p>
          <button className="primary-button" onClick={openCreateAddress} type="button">新增收货地址</button>
        </div>
      ) : (
        <div className="account-address-manage-list">
          {addresses.map((address) => (
            <article className={address.is_default ? "account-address-manage-card active" : "account-address-manage-card"} key={address.id}>
              <div className="account-address-manage-head">
                <div>
                  <strong>{address.receiver_name}</strong>
                  <span>{address.receiver_phone}</span>
                </div>
                {address.is_default ? <em>默认地址</em> : null}
              </div>
              <p>{formatAddressText(address)}</p>
              <div className="account-address-actions">
                <button onClick={() => openEditAddress(address)} type="button">
                  <Edit3 size={14} />
                  编辑
                </button>
                <button
                  disabled={address.is_default}
                  onClick={() => void onAddressSetDefault(address.id)}
                  type="button"
                >
                  <Home size={14} />
                  {address.is_default ? "已默认" : "设为默认"}
                </button>
                <button
                  className={deleteConfirmId === address.id ? "danger active" : "danger"}
                  disabled={deletingAddressId === address.id}
                  onClick={() => void handleDeleteAddress(address)}
                  type="button"
                >
                  <Trash2 size={14} />
                  {deleteConfirmId === address.id ? "确认删除" : "删除"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {addressDialog ? renderAddressDialog(addressDialog) : null}
    </>
  );

  const renderAddressDialog = (dialog: AddressDialog): React.ReactNode => (
    <div className="account-address-dialog-backdrop" role="presentation">
      <form className="account-address-dialog" onSubmit={(event) => void submitAddressForm(event)}>
        <div className="account-address-dialog-head">
          <div>
            <h3>{dialog.mode === "edit" ? "编辑收货地址" : "新增收货地址"}</h3>
            <p>用于订单配送和售后联系，请确保信息准确。</p>
          </div>
          <button aria-label="关闭地址表单" onClick={closeAddressDialog} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="account-address-form-grid">
          <label>
            <span>收货人</span>
            <input
              onChange={(event) => updateAddressForm("receiver_name", event.target.value)}
              placeholder="请输入姓名"
              value={addressForm.receiver_name}
            />
          </label>
          <label>
            <span>手机号</span>
            <input
              onChange={(event) => updateAddressForm("receiver_phone", event.target.value)}
              placeholder="请输入 11 位手机号"
              value={addressForm.receiver_phone}
            />
          </label>
          <label>
            <span>省份</span>
            <select
              onChange={(event) => updateProvince(event.target.value)}
              value={addressForm.province}
            >
              <option value="">请选择省份</option>
              {provinceOptions.map((province) => (
                <option key={province.code} value={province.name}>{province.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>城市</span>
            <select
              disabled={!addressForm.province}
              onChange={(event) => updateCity(event.target.value)}
              value={addressForm.city}
            >
              <option value="">请选择城市</option>
              {cityOptions.map((city) => (
                <option key={city.code} value={city.name}>{city.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>区县</span>
            <select
              disabled={!addressForm.city}
              onChange={(event) => updateAddressForm("district", event.target.value)}
              value={addressForm.district}
            >
              <option value="">请选择区县</option>
              {districtOptions.map((district) => (
                <option key={district.code} value={district.name}>{district.name}</option>
              ))}
            </select>
          </label>
          <label className="wide">
            <span>详细地址</span>
            <textarea
              onChange={(event) => updateAddressForm("detail", event.target.value)}
              placeholder="街道、门牌号、楼层房间号"
              value={addressForm.detail}
            />
          </label>
        </div>

        <label className="account-address-default-check">
          <input
            checked={addressForm.is_default}
            onChange={(event) => updateAddressForm("is_default", event.target.checked)}
            type="checkbox"
          />
          <span>设为默认收货地址</span>
        </label>

        {addressError ? <div className="account-address-error">{addressError}</div> : null}

        <div className="account-address-dialog-actions">
          <button className="primary-button" disabled={addressSaving} type="submit">
            {addressSaving ? "保存中" : "保存地址"}
          </button>
          <button className="plain-button" disabled={addressSaving} onClick={closeAddressDialog} type="button">
            取消
          </button>
        </div>
      </form>
    </div>
  );

  const renderProfile = (): React.ReactNode => (
    <form className="panel account-form-panel" onSubmit={(event) => void submitProfileForm(event)}>
      <div className="account-profile-head">
        {profileForm.avatar ? (
          <img className="account-profile-avatar-image" src={profileForm.avatar} alt="会员头像" />
        ) : (
          <div className="account-avatar">{initial}</div>
        )}
        <div>
          <strong>{profileForm.nickname || accountName}</strong>
          <span>{profileEditing ? "正在编辑个人资料" : "基础资料用于会员中心展示"}</span>
        </div>
        {!profileEditing ? (
          <button className="plain-button small" onClick={() => setProfileEditing(true)} type="button">
            编辑资料
          </button>
        ) : null}
      </div>
      <div className="account-form-grid">
        <label>
          <span>昵称</span>
          <input
            onChange={(event) => updateProfileForm("nickname", event.target.value)}
            readOnly={!profileEditing}
            value={profileForm.nickname}
          />
        </label>
        <label>
          <span>会员账号</span>
          <input
            onChange={(event) => updateProfileForm("mobile", event.target.value)}
            placeholder="未绑定手机号"
            readOnly={!profileEditing}
            value={profileForm.mobile}
          />
        </label>
        <label>
          <span>头像地址</span>
          <input
            onChange={(event) => updateProfileForm("avatar", event.target.value)}
            placeholder="https://example.com/avatar.jpg"
            readOnly={!profileEditing}
            value={profileForm.avatar}
          />
        </label>
        <label>
          <span>性别</span>
          <select
            disabled={!profileEditing}
            onChange={(event) => updateProfileForm("gender", event.target.value)}
            value={profileForm.gender}
          >
            <option value="保密">保密</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </label>
        <label>
          <span>生日</span>
          <input
            onChange={(event) => updateProfileForm("birthday", event.target.value)}
            readOnly={!profileEditing}
            type="date"
            value={profileForm.birthday}
          />
        </label>
        <label className="wide">
          <span>个人简介</span>
          <textarea
            onChange={(event) => updateProfileForm("bio", event.target.value)}
            readOnly={!profileEditing}
            value={profileForm.bio}
          />
        </label>
      </div>
      <p className="account-form-tip">手机号会作为会员账号展示，昵称、头像、性别、生日和简介会同步保存到会员资料。</p>
      {profileError ? <div className="account-address-error">{profileError}</div> : null}
      <div className="account-form-actions">
        <button className="primary-button" disabled={!profileEditing || profileSaving} type="submit">
          {profileSaving ? "保存中" : "保存资料"}
        </button>
        <button className="plain-button" disabled={!profileEditing || profileSaving} onClick={cancelProfileEdit} type="button">
          取消修改
        </button>
      </div>
    </form>
  );

  const renderResourceState = (loading: boolean, error: string, emptyText: string): React.ReactNode => {
    if (loading) {
      return <section className="panel account-resource-state"><Clock3 size={24} /><strong>正在加载</strong></section>;
    }
    if (error) {
      return <section className="panel account-resource-state error"><strong>数据加载失败</strong><p>{error}</p></section>;
    }
    return <section className="panel account-resource-state"><strong>{emptyText}</strong></section>;
  };

  const runAction = async (id: number, action: () => Promise<boolean>): Promise<void> => {
    setActionId(id);
    await action();
    setActionId(null);
  };

  const renderCoupons = (): React.ReactNode => {
    if (couponLoading || couponError) {
      return renderResourceState(couponLoading, couponError, "暂无优惠券");
    }

    const ownedCouponIds = new Set(userCoupons.map((item) => item.coupon.id));
    const claimableCoupons = availableCoupons.filter((coupon) => !coupon.claimed && !ownedCouponIds.has(coupon.id));
    if (userCoupons.length === 0 && claimableCoupons.length === 0) {
      return renderResourceState(false, "", "暂无可领取或已领取的优惠券");
    }

    return (
      <div className="account-resource-sections">
        {userCoupons.length > 0 ? (
          <section className="account-resource-section">
            <div className="account-section-title"><h2>我的优惠券</h2><span>{userCoupons.length} 张</span></div>
            <div className="account-card-grid three">
              {userCoupons.map((item) => (
                <article className={item.status === 1 ? "panel account-coupon-card" : "panel account-coupon-card muted"} key={item.id}>
                  <strong>{formatPrice(moneyFromCent(item.coupon.discount_amount))}</strong>
                  <div>
                    <h3>{item.coupon.name}</h3>
                    <p>{item.coupon.threshold_amount > 0 ? `满 ${formatPrice(moneyFromCent(item.coupon.threshold_amount))} 可用` : "无门槛"}</p>
                    <span>{item.status_text} · {formatDate(item.coupon.end_at)} 到期</span>
                  </div>
                  <button disabled={item.status !== 1} onClick={() => onCouponUse(item.id)} type="button">
                    {item.status === 1 ? "去使用" : item.status_text}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {claimableCoupons.length > 0 ? (
          <section className="account-resource-section">
            <div className="account-section-title"><h2>可领取</h2><span>{claimableCoupons.length} 张</span></div>
            <div className="account-card-grid three">
              {claimableCoupons.map((coupon) => (
                <article className="panel account-coupon-card" key={coupon.id}>
                  <strong>{formatPrice(moneyFromCent(coupon.discount_amount))}</strong>
                  <div>
                    <h3>{coupon.name}</h3>
                    <p>{coupon.threshold_amount > 0 ? `满 ${formatPrice(moneyFromCent(coupon.threshold_amount))} 可用` : "无门槛"}</p>
                    <span>{formatDate(coupon.end_at)} 到期</span>
                  </div>
                  <button
                    disabled={actionId === coupon.id}
                    onClick={() => void runAction(coupon.id, () => onCouponClaim(coupon.id))}
                    type="button"
                  >
                    {actionId === coupon.id ? "领取中" : "立即领取"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  };

  const renderFavorites = (): React.ReactNode => {
    if (favoriteLoading || favoriteError || favorites.length === 0) {
      return renderResourceState(favoriteLoading, favoriteError, "暂无收藏商品");
    }

    return (
      <section className="account-card-grid three">
        {favorites.map((product) => (
          <article className="panel account-product-mini" key={product.id}>
            <button className="account-product-thumb" onClick={() => onProductOpen(product)} type="button">
              <ProductVisual alt={product.name} src={product.cover} />
            </button>
            <h3>{product.name}</h3>
            <strong>{formatPrice(product.price)}</strong>
            <div className="account-card-actions">
              <button className="primary-button small" onClick={() => onProductOpen(product)} type="button">查看商品</button>
              <button
                className="plain-button small danger"
                disabled={actionId === product.apiId}
                onClick={() => product.apiId && void runAction(product.apiId, () => onFavoriteToggle(product.apiId as number))}
                type="button"
              >
                {actionId === product.apiId ? "处理中" : "取消收藏"}
              </button>
            </div>
          </article>
        ))}
      </section>
    );
  };

  const renderAfterSales = (): React.ReactNode => {
    if (afterSaleLoading || afterSaleError || afterSales.length === 0) {
      return renderResourceState(afterSaleLoading, afterSaleError, "暂无售后记录");
    }

    return (
      <section className="account-card-grid two">
        {afterSales.map((item) => (
          <article className="panel account-after-card" key={item.id}>
            <div className="account-after-title">
              <Truck size={18} />
              <strong>{item.product_name}</strong>
              <span>{item.status_text}</span>
            </div>
            <p>{item.after_sale_no} · 订单 {item.order_no}</p>
            <div className="account-after-meta">
              <span>{item.type_text}</span>
              <span>{item.sku_name}</span>
              <span>申请退款 {formatPrice(moneyFromCent(item.refund_amount))}</span>
              <span>{formatDate(item.created_at)} 申请</span>
            </div>
            <p>{item.reason}{item.reject_reason ? ` · 驳回原因：${item.reject_reason}` : ""}</p>
            <div className="account-card-actions">
              <Link className="plain-button small" params={{ afterSaleId: String(item.id) }} to="/account/after-sales/$afterSaleId">查看详情</Link>
              {item.status === 1 ? (
                <button
                  className="plain-button small danger"
                  disabled={actionId === item.id}
                  onClick={() => void runAction(item.id, () => onAfterSaleCancel(item.id))}
                  type="button"
                >
                  {actionId === item.id ? "取消中" : "取消申请"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    );
  };

  const renderContent = (): React.ReactNode => {
    switch (view) {
      case "profile":
        return renderProfile();
      case "orders":
        return renderOrderPanel();
      case "addresses":
        return renderAddressPanel();
      case "coupons":
        return renderCoupons();
      case "favorites":
        return renderFavorites();
      case "afterSales":
        return renderAfterSales();
      default:
        return renderOverview();
    }
  };

  return (
    <section className="account-page">
      <aside className="panel account-sidebar">
        <h2>个人中心</h2>
        {navGroups.map((group) => (
          <nav aria-label={group.title} key={group.title}>
            <h3>{group.title}</h3>
            {group.items.map((item) => (
              <Link activeOptions={{ exact: true }} key={item.label} to={item.to}>
                <span>{item.label}</span>
                <ChevronRight size={14} />
              </Link>
            ))}
          </nav>
        ))}
      </aside>

      <div className="account-main">
        <header className="account-page-head">
          <div>
            <h1>{pageMeta[view].title}</h1>
            <p>{pageMeta[view].desc}</p>
          </div>
          <div className="account-head-meta">
            <span>{maskedMobile}</span>
          </div>
        </header>
        {renderContent()}
      </div>
    </section>
  );
};

export default AccountPage;
