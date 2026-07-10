import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Edit3,
  Eye,
  FileText,
  Heart,
  Home,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  ReceiptText,
  ShieldCheck,
  Star,
  Ticket,
  Trash2,
  Truck,
  WalletCards,
  X
} from "lucide-react";

import type { AddressRequest, AddressResponse, AuthResponse, OrderResponse, UpdateProfileRequest } from "@/api/client";
import { moneyFromCent } from "@/api/client";
import { getCityOptions, getDistrictOptions, provinceOptions } from "@/features/address/helpers/areaOptions";
import { formatPrice } from "@/shared/utils/money";

export type AccountView =
  | "overview"
  | "profile"
  | "orders"
  | "addresses"
  | "coupons"
  | "favorites"
  | "history"
  | "reviews"
  | "points"
  | "security"
  | "privacy"
  | "messages"
  | "afterSales";

interface AccountPageProps {
  addresses: AddressResponse[];
  lastOrder: OrderResponse | null;
  orders: OrderResponse[];
  onAddressCreate: (payload: AddressRequest) => Promise<boolean>;
  onAddressDelete: (id: number) => Promise<boolean>;
  onAddressSetDefault: (id: number) => Promise<boolean>;
  onAddressUpdate: (id: number, payload: AddressRequest) => Promise<boolean>;
  onOrderPay: (order: OrderResponse) => void;
  onProfileUpdate: (payload: UpdateProfileRequest) => Promise<boolean>;
  user: AuthResponse["user"];
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
    title: "我的资产",
    items: [
      { label: "优惠券", to: "/account/coupons", view: "coupons" },
      { label: "收藏商品", to: "/account/favorites", view: "favorites" },
      { label: "浏览足迹", to: "/account/history", view: "history" },
      { label: "评价晒单", to: "/account/reviews", view: "reviews" },
      { label: "会员积分", to: "/account/points", view: "points" }
    ]
  },
  {
    title: "账号与消息",
    items: [
      { label: "账号安全", to: "/account/security", view: "security" },
      { label: "隐私设置", to: "/account/privacy", view: "privacy" },
      { label: "消息中心", to: "/account/messages", view: "messages" },
      { label: "售后服务", to: "/account/after-sales", view: "afterSales" }
    ]
  }
] as const;

const pageMeta: Record<AccountView, { title: string; desc: string }> = {
  overview: { title: "会员资产", desc: "查看购物资产、最近订单、常用地址和会员服务。" },
  profile: { title: "个人资料", desc: "维护基础资料、头像、昵称和联系信息。" },
  orders: { title: "我的订单", desc: "跟踪全部订单状态，快速处理支付、收货和评价。" },
  addresses: { title: "地址管理", desc: "管理收货地址，设置常用地址并用于订单结算。" },
  coupons: { title: "优惠券", desc: "查看可用、即将过期和已使用的优惠券。" },
  favorites: { title: "收藏商品", desc: "管理关注商品，方便后续比价和下单。" },
  history: { title: "浏览足迹", desc: "按时间回看最近浏览过的商品。" },
  reviews: { title: "评价晒单", desc: "管理待评价、已评价和追评内容。" },
  points: { title: "会员积分", desc: "查看积分余额、获取方式和积分流水。" },
  security: { title: "账号安全", desc: "管理登录密码、手机绑定、实名认证和登录设备。" },
  privacy: { title: "隐私设置", desc: "控制个性化推荐、消息授权和数据可见范围。" },
  messages: { title: "消息中心", desc: "接收订单、活动、账户安全和售后通知。" },
  afterSales: { title: "售后服务", desc: "查看退换货、退款、维修等售后进度。" }
};

const coupons = [
  { name: "新人专享券", amount: "¥30", rule: "满 199 可用", expires: "07-31 到期", status: "可用" },
  { name: "会员复购券", amount: "¥50", rule: "满 399 可用", expires: "08-15 到期", status: "可用" },
  { name: "运费抵扣券", amount: "¥12", rule: "全场通用", expires: "已使用", status: "已使用" }
];

const favoriteProducts = [
  { name: "手冲咖啡豆", price: "¥128", note: "近 7 天降价 12 元" },
  { name: "基础白 T", price: "¥99", note: "有货，可加入购物车" },
  { name: "机械键盘", price: "¥399", note: "同类商品热卖" }
];

const historyItems = [
  { date: "今天", items: ["手冲咖啡豆", "陶瓷滤杯", "便携保温杯"] },
  { date: "昨天", items: ["基础白 T", "轻量运动鞋"] },
  { date: "07-06", items: ["机械键盘", "桌面收纳架"] }
];

const messages = [
  { type: "订单", title: "订单已创建，等待支付", time: "10:24", unread: true },
  { type: "账户", title: "账号安全等级已更新", time: "昨天", unread: true },
  { type: "活动", title: "会员专属优惠已到账", time: "07-06", unread: false }
];

const afterSalesCases = [
  { no: "AS20260708001", product: "机械键盘", status: "审核中", progress: "商家将在 24 小时内处理" },
  { no: "AS20260702003", product: "基础白 T", status: "已完成", progress: "退款已原路返回" }
];

const formatAddressText = (address: AddressResponse): string =>
  `${address.province}${address.city}${address.district}${address.detail}`;

export const AccountPage: React.FC<AccountPageProps> = ({
  addresses,
  lastOrder,
  orders,
  onAddressCreate,
  onAddressDelete,
  onAddressSetDefault,
  onAddressUpdate,
  onOrderPay,
  onProfileUpdate,
  user,
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
  const [messageScope, setMessageScope] = useState<"全部" | "未读">("全部");
  const [recommendEnabled, setRecommendEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const orderRows = useMemo(() => {
    const source = orders.length > 0 ? orders : lastOrder ? [lastOrder] : [];
    return source.map((order) => ({
      action: order.status === 1 ? "去支付" : "查看",
      amount: formatPrice(moneyFromCent(order.payable_amount)),
      order,
      status: order.status_text,
      no: order.order_no
    }));
  }, [lastOrder, orders]);
  const defaultAddresses = addresses.slice(0, 3);
  const filteredMessages = messageScope === "未读" ? messages.filter((message) => message.unread) : messages;
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
          <p>普通会员 · 积分 1280 · 手机号 {maskedMobile}</p>
        </div>
        <Link className="account-soft-link" to="/account/profile">完善资料</Link>
      </section>

      <section className="account-assets-grid" aria-label="会员资产">
        <Link className="panel account-asset-card" to="/account/coupons">
          <Ticket size={20} />
          <span>优惠券</span>
          <strong>3 张</strong>
        </Link>
        <Link className="panel account-asset-card" to="/account/points">
          <Star size={20} />
          <span>会员积分</span>
          <strong>1280</strong>
        </Link>
        <Link className="panel account-asset-card" to="/account/favorites">
          <Heart size={20} />
          <span>收藏商品</span>
          <strong>12 件</strong>
        </Link>
        <Link className="panel account-asset-card" to="/account/security">
          <ShieldCheck size={20} />
          <span>安全等级</span>
          <strong>高</strong>
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
          <Link to="/account/messages"><Bell size={18} /><span>消息提醒</span><ChevronRight size={16} /></Link>
          <Link to="/account/after-sales"><CreditCard size={18} /><span>售后服务</span><ChevronRight size={16} /></Link>
        </div>
      </section>
    </>
  );

  const renderOrderPanel = (title = "我的订单", compact = false): React.ReactNode => (
    <section className="panel account-orders-panel">
      <div className="account-section-title">
        <h2>{title}</h2>
        <Link to="/account/orders">{compact ? "查看全部订单" : "订单筛选"}</Link>
      </div>
      <table className="account-order-table">
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
                <button onClick={() => row.order.status === 1 ? onOrderPay(row.order) : undefined} type="button">
                  {row.action}
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4}>暂无订单</td>
            </tr>
          )}
        </tbody>
      </table>
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
      {compact ? renderCompactAddressList() : renderAddressManager()}
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
        <>
          <article className="account-address-card active">
            <MapPin size={16} />
            <span>上海市浦东新区 XX 路 88 号</span>
            <strong>默认</strong>
          </article>
          <article className="account-address-card">
            <MapPin size={16} />
            <span>杭州市西湖区 XX 街 21 号</span>
          </article>
          <article className="account-address-card">
            <MapPin size={16} />
            <span>北京市朝阳区 XX 路 9 号</span>
          </article>
        </>
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

  const renderCoupons = (): React.ReactNode => (
    <section className="account-card-grid three">
      {coupons.map((coupon) => (
        <article className={coupon.status === "已使用" ? "panel account-coupon-card muted" : "panel account-coupon-card"} key={coupon.name}>
          <strong>{coupon.amount}</strong>
          <div>
            <h3>{coupon.name}</h3>
            <p>{coupon.rule}</p>
            <span>{coupon.expires}</span>
          </div>
          <button type="button">{coupon.status === "可用" ? "去使用" : "已使用"}</button>
        </article>
      ))}
    </section>
  );

  const renderFavorites = (): React.ReactNode => (
    <section className="account-card-grid three">
      {favoriteProducts.map((product) => (
        <article className="panel account-product-mini" key={product.name}>
          <div className="account-product-thumb"><Heart size={18} /></div>
          <h3>{product.name}</h3>
          <strong>{product.price}</strong>
          <p>{product.note}</p>
          <button className="primary-button small" type="button">加入购物车</button>
        </article>
      ))}
    </section>
  );

  const renderHistory = (): React.ReactNode => (
    <section className="panel account-list-panel">
      {historyItems.map((group) => (
        <article className="account-history-row" key={group.date}>
          <strong>{group.date}</strong>
          <div>
            {group.items.map((item) => <span key={item}>{item}</span>)}
          </div>
        </article>
      ))}
    </section>
  );

  const renderReviews = (): React.ReactNode => (
    <section className="account-card-grid two">
      {["手冲咖啡豆", "基础白 T"].map((product, index) => (
        <article className="panel account-review-card" key={product}>
          <div>
            <ReceiptText size={18} />
            <strong>{product}</strong>
          </div>
          <p>{index === 0 ? "待评价，晒单可获得 20 积分。" : "已评价，可继续追评使用感受。"}</p>
          <button className="plain-button small" type="button">{index === 0 ? "去评价" : "查看评价"}</button>
        </article>
      ))}
    </section>
  );

  const renderPoints = (): React.ReactNode => (
    <div className="account-content-grid">
      <section className="panel account-points-card">
        <WalletCards size={26} />
        <span>当前积分</span>
        <strong>1280</strong>
        <p>可用于兑换优惠券、抵扣部分商品金额。</p>
      </section>
      <section className="panel account-list-panel">
        {[
          ["购物下单", "+128", "07-08"],
          ["评价晒单", "+20", "07-04"],
          ["兑换优惠券", "-300", "07-01"]
        ].map(([name, value, date]) => (
          <article className="account-ledger-row" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
            <small>{date}</small>
          </article>
        ))}
      </section>
    </div>
  );

  const renderSecurity = (): React.ReactNode => (
    <div className="account-content-grid">
      <section className="panel account-security-panel">
        <div className="account-security-level">
          <ShieldCheck size={22} />
          <div>
            <strong>安全等级：高</strong>
            <p>已绑定手机并开启异常登录提醒，请定期更新密码。</p>
          </div>
        </div>
        {[
          ["登录密码", "已设置，建议 90 天更换一次"],
          ["手机绑定", "138****8888"],
          ["实名认证", "未认证，可提升账户安全"],
          ["登录保护", "异常设备登录提醒已开启"]
        ].map(([name, desc]) => (
          <article className="account-setting-row" key={name}>
            <LockKeyhole size={16} />
            <div><strong>{name}</strong><span>{desc}</span></div>
            <button type="button">管理</button>
          </article>
        ))}
      </section>
      <section className="panel account-list-panel">
        <div className="account-section-title">
          <h2>最近登录</h2>
          <span>近 7 天</span>
        </div>
        {["Chrome · 上海", "Safari · 杭州", "移动端 · 北京"].map((item, index) => (
          <article className="account-ledger-row" key={item}>
            <span>{item}</span>
            <strong>{index === 0 ? "当前" : "正常"}</strong>
            <small>07-0{4 - index}</small>
          </article>
        ))}
      </section>
    </div>
  );

  const renderPrivacy = (): React.ReactNode => (
    <section className="panel account-security-panel">
      <article className="account-setting-row">
        <Eye size={16} />
        <div><strong>个性化推荐</strong><span>根据浏览和购买偏好推荐商品。</span></div>
        <button className={recommendEnabled ? "account-switch on" : "account-switch"} onClick={() => setRecommendEnabled((current) => !current)} type="button">
          {recommendEnabled ? "开启" : "关闭"}
        </button>
      </article>
      <article className="account-setting-row">
        <MessageCircle size={16} />
        <div><strong>短信通知</strong><span>订单、售后和安全通知通过短信发送。</span></div>
        <button className={smsEnabled ? "account-switch on" : "account-switch"} onClick={() => setSmsEnabled((current) => !current)} type="button">
          {smsEnabled ? "开启" : "关闭"}
        </button>
      </article>
      <article className="account-setting-row">
        <FileText size={16} />
        <div><strong>数据导出</strong><span>导出账户资料、订单和售后记录。</span></div>
        <button type="button">申请导出</button>
      </article>
    </section>
  );

  const renderMessages = (): React.ReactNode => (
    <section className="panel account-list-panel">
      <div className="account-filter-tabs">
        {(["全部", "未读"] as const).map((scope) => (
          <button className={messageScope === scope ? "active" : ""} key={scope} onClick={() => setMessageScope(scope)} type="button">
            {scope}
          </button>
        ))}
      </div>
      {filteredMessages.map((message) => (
        <article className={message.unread ? "account-message-row unread" : "account-message-row"} key={message.title}>
          <MessageCircle size={17} />
          <div><strong>{message.title}</strong><span>{message.type} · {message.time}</span></div>
          {message.unread ? <i>未读</i> : null}
        </article>
      ))}
    </section>
  );

  const renderAfterSales = (): React.ReactNode => (
    <section className="account-card-grid two">
      {afterSalesCases.map((item) => (
        <article className="panel account-after-card" key={item.no}>
          <div className="account-after-title">
            <Truck size={18} />
            <strong>{item.product}</strong>
            <span>{item.status}</span>
          </div>
          <p>{item.no}</p>
          <div className="account-progress-line">
            <CheckCircle2 size={16} />
            <span>{item.progress}</span>
          </div>
          <button className="plain-button small" type="button">查看详情</button>
        </article>
      ))}
    </section>
  );

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
      case "history":
        return renderHistory();
      case "reviews":
        return renderReviews();
      case "points":
        return renderPoints();
      case "security":
        return renderSecurity();
      case "privacy":
        return renderPrivacy();
      case "messages":
        return renderMessages();
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
            <Clock3 size={16} />
            <span>最近更新 10:30</span>
          </div>
        </header>
        {renderContent()}
      </div>
    </section>
  );
};

export default AccountPage;
