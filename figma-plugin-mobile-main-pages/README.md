# Mall Mobile Unified Pages Builder

这个目录是本地 Figma 开发插件，用来生成商城项目的统一移动端页面，不消耗 Figma MCP 免费额度。

插件会在 Figma 文件中的 `02 前台三端原型` 页面追加 25 个移动端页面。H5 和小程序共用这一套原型，不再重复生成两份。

## 页面分组

插件会按 7 个业务模块分组排布，每个业务模块单独占一排，组内页面横向连续展示：

- `01 购物入口`：首页、分类、搜索列表、商品详情。
- `02 交易支付`：购物车、确认订单、支付结果。
- `03 订单履约`：订单列表、订单详情、物流跟踪。
- `04 售后服务`：售后列表、售后申请、售后详情。
- `05 会员中心`：我的、登录授权、个人资料、地址管理、优惠券中心、收藏夹。
- `06 消息账户`：消息中心、账号安全。
- `07 服务支持`：客服工单、发票管理、帮助中心、搜索空结果。

## 网页版 Figma

1. 打开 Figma 网页版，并打开文件 `商城项目全端原型图`。
2. 打开或选中 `02 前台三端原型` 页面。
3. 点击左上角 Figma 主菜单。
4. 进入 `Plugins > Development > Import plugin from manifest...`。
5. 选择本目录下的 `manifest.json`：

   `/Users/leo/GoWorkSpace/mall/mall-frontend/figma-plugin-mobile-main-pages/manifest.json`

6. 导入后运行 `Plugins > Development > Mall Mobile Unified Pages Builder`。

## 桌面版 Figma 兜底

如果网页版看不到 `Development` 或 `Import plugin from manifest...`，使用 Figma 桌面版执行同样步骤：

1. 打开 Figma 桌面版，并打开文件 `商城项目全端原型图`。
2. 进入 `Plugins > Development > Import plugin from manifest...`。
3. 选择：

   `/Users/leo/GoWorkSpace/mall/mall-frontend/figma-plugin-mobile-main-pages/manifest.json`

4. 运行 `Plugins > Development > Mall Mobile Unified Pages Builder`。

## 导入前检查

可以先在项目根目录运行：

```bash
node mall-frontend/figma-plugin-mobile-main-pages/check-plugin.js
```

看到全部 `PASS` 后，再导入 `manifest.json`。

## 行为说明

- 插件会优先查找名为 `02 前台三端原型` 的页面，找不到时才使用当前页面。
- 插件可以重复运行。每次运行都会先删除自己生成过的 25 个移动端页面、旧版 50 个 H5/小程序页面、7 个分组标题条和说明条，再重新生成，避免重复堆叠。
- H5 和小程序使用同一套移动端原型页面。
