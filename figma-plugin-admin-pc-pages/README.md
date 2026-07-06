# Mall Admin PC Pages Builder

这个目录是本地 Figma 开发插件，用来生成商城项目的后台管理端 PC 页面，不消耗 Figma MCP 免费额度。

插件会在 Figma 文件中的 `01 后台管理端原型` 页面追加 39 个后台 PC 页面。如果文件中没有这个页面，插件会自动创建。

## 页面分组

- `01 登录与工作台`：登录、工作台总览。
- `02 商品中心`：商品列表、商品编辑、分类管理、品牌管理、库存预警、商品审核。
- `03 订单履约`：订单列表、订单详情、发货管理、物流跟踪、售后列表、售后详情。
- `04 用户会员`：用户列表、用户详情、会员等级、积分记录。
- `05 营销运营`：优惠券管理、促销活动、首页装修、推荐位管理。
- `06 财务结算`：支付流水、退款流水、商户结算、对账单。
- `07 商户管理`：商户信息、门店列表、员工管理、角色权限、权限矩阵。
- `08 客服内容`：客服工单、工单详情、发票管理、消息通知、帮助文章。
- `09 系统设置`：系统配置、操作日志、数据导出。

## 网页版 Figma

1. 打开 Figma 网页版，并打开文件 `商城项目全端原型图`。
2. 点击左上角 Figma 主菜单。
3. 进入 `Plugins > Development > Import plugin from manifest...`。
4. 选择本目录下的 `manifest.json`：

   `/Users/leo/GoWorkSpace/mall/mall-frontend/figma-plugin-admin-pc-pages/manifest.json`

5. 导入后运行 `Plugins > Development > Mall Admin PC Pages Builder`。

## 桌面版 Figma 兜底

如果网页版看不到 `Development` 或 `Import plugin from manifest...`，使用 Figma 桌面版执行同样步骤：

1. 打开 Figma 桌面版，并打开文件 `商城项目全端原型图`。
2. 进入 `Plugins > Development > Import plugin from manifest...`。
3. 选择：

   `/Users/leo/GoWorkSpace/mall/mall-frontend/figma-plugin-admin-pc-pages/manifest.json`

4. 运行 `Plugins > Development > Mall Admin PC Pages Builder`。

## 导入前检查

可以先在项目根目录运行：

```bash
node mall-frontend/figma-plugin-admin-pc-pages/check-plugin.js
```

看到全部 `PASS` 后，再导入 `manifest.json`。

## 行为说明

- 插件会优先查找名为 `01 后台管理端原型` 的页面，找不到时会自动创建。
- 插件可以重复运行。每次运行都会先删除自己生成过的 39 个后台 PC 页面、9 个分组标题条和说明条，再重新生成，避免重复堆叠。
- 页面按模块分组排布，每个分组单独占一排，组内页面横向连续展示，便于一次看完同一业务链路。
- 后台左侧导航会生成一级模块和当前模块的二级菜单，并表现展开、悬停、选中三种状态。
- 左侧导航不显示 `导航菜单` 标题，也不显示一级菜单右侧简称，避免重复信息干扰扫描。
- 一级菜单使用业务语义图标区分模块，如工作台、商品、订单、用户、营销、财务、权限、客服、系统；二级菜单保持圆点样式。
- `商户信息` 只承载主商户基础资料；下级门店/子商户放在 `门店列表`，列表提供新增、编辑、停用和删除操作入口。
- `商品编辑`、`订单详情`、`售后详情`、`用户详情`、`工单详情` 属于上下文页面，不作为左侧菜单入口；进入这些页面时，左侧会高亮对应父入口，如 `商品编辑` 高亮 `商品列表`。
