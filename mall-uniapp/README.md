# Mall UniApp

`mall-uniapp` 是商城买家端的 UniApp Vue 3 CLI 工程，同时产出 H5 和微信小程序代码。接口金额单位统一为“分”，页面展示时再转换为“元”。

## 当前范围

已经接入真实后端接口：

- 账号密码注册、登录、Token 自动刷新、退出和个人资料。
- 分类、搜索、商品详情、SKU、收藏。
- 公开商户列表、商户商品入口、商品商户信息和跨商户购物车分组。
- 购物车、地址、逐商户优惠券、跨商户交易预览和原子拆单。
- 订单列表、详情、取消、物流信息和确认收货。
- 售后申请、列表、详情和取消。
- H5 以 `trade_id` 创建支付宝聚合支付意图，并支持跳转、交易结果查询和主动同步全部子订单。

当前明确暂缓：

- 微信小程序登录和微信支付。
- 对象存储，因此头像只接受已有 URL，售后凭证暂不上传图片。
- 支付宝真实资金支付和退款验收。
- 第三方快递轨迹；当前只展示承运信息和商家填写的物流节点。
- 结算确认、实际打款和平台后台；交易级支付分配、退款冲正及商家只读结算已由后端 M8-D 完成。

项目不提供模拟支付成功按钮，不调用旧的 `/orders/:id/pay` 或 `/payments/:id/mock-complete`。

## 环境准备

- Node.js 20 或 22，CI 使用 Node.js 22。
- npm 10+。
- 微信小程序开发者工具，用于导入编译后的小程序目录。

安装依赖：

```bash
cd mall-uniapp
npm ci
```

## 本地开发

H5：

```bash
npm run dev:h5
```

H5 请求同源 `/api/v1`，Vite 开发代理默认转发到 `https://mall.leedu.ac.cn`。开发服务器只监听 `127.0.0.1` 并关闭跨源访问；需要局域网真机调试时应临时使用受信网络和明确的 host 配置，不要长期对外暴露开发服务器。

隔离环境联调时用构建变量切换后端，不修改源码：

```bash
MALL_SITE_ORIGIN=https://test-mall.example.com npm run dev:h5
MALL_SITE_ORIGIN=https://test-mall.example.com npm run build:mp-weixin
```

H5 仍请求同源 `/api`，开发代理转发到该地址；小程序构建产物会直接使用该 HTTPS origin。

微信小程序：

```bash
npm run dev:mp-weixin
```

然后在微信开发者工具中导入 `dist/dev/mp-weixin`。发布前必须：

1. 在 `src/manifest.json` 的 `mp-weixin.appid` 填写真实 AppID。
2. 在微信公众平台将 `https://mall.leedu.ac.cn` 配置为 `request` 合法域名。
3. 使用开发版真机分别验收登录过期、切后台、弱网和订单恢复。

小程序运行时直接请求 `https://mall.leedu.ac.cn/api/v1`，不依赖浏览器 CORS。

## 构建

```bash
npm run build:h5
npm run build:mp-weixin
```

产物目录：

```text
dist/build/h5
dist/build/mp-weixin
```

H5 使用 hash 路由并以 `/mobile/` 为基础路径。

## 测试分层

不访问后端、不写业务数据的快速门禁：

```bash
npm test
```

该命令验证 48 个接口契约、401 刷新与并发合并、公开商户接口、购物车商户分组、逐商户优惠券、交易最新预览令牌、原子创建和 `trade_id` 支付，以及 `pages.json`、页面文件和 Tab 路由的一致性。

H5 浏览器闭环使用确定性路由 Mock，不修改后端数据：

```bash
npm run build:h5
npm run test:e2e:h5
```

覆盖移动 Chromium、移动 WebKit 和微信 H5 User-Agent，共 12 个用例，验证账号登录、Token 过期、收藏、跨商户分组、逐商户优惠券、重新预览、一次创建交易、交易级支付宝支付和结果同步。微信小程序在微信支付未实现前不展示支付操作。

线上公开只读检查：

```bash
npm run test:live
```

提供专用测试账号后会继续验证登录态只读接口：

```bash
MALL_TEST_USERNAME=test-user \
MALL_TEST_PASSWORD=test-password \
npm run test:live
```

完整 API E2E 会注册账号并创建、取消订单，只允许在隔离测试环境执行：

```bash
MALL_API_BASE=http://127.0.0.1:8080/api/v1 \
MALL_ALLOW_MUTATION_TESTS=1 \
npm run test:e2e:api
```

脚本默认拒绝写数据。目标为正式域名时还要求 `MALL_ALLOW_PRODUCTION_MUTATION=1`，正常开发和 CI 不应设置该变量。

## 部署

`.github/workflows/deploy-uniapp-h5.yml` 只在以下情况执行测试、构建和部署：

- 手动运行 `workflow_dispatch`。
- 推送到 `main`，改动包含 `mall-uniapp/**`，且本次推送任一提交信息包含 `[deploy]`。

普通推送不会运行该部署任务。需要发布时的提交示例：

```text
feat(uniapp): 完成移动端交易闭环 [deploy]
```

仓库需配置与其他前端部署相同的 GitHub Actions Secrets：

```text
SERVER_HOST
SERVER_PORT
SERVER_USER
SERVER_SSH_KEY
```

Workflow 会：

1. 运行契约测试和生产依赖审计。
2. 构建 H5、小程序并运行三个浏览器项目。
3. 将小程序产物保存为 GitHub Artifact。
4. 将 H5 原子发布到 `/opt/mall/mobile/releases`。
5. 更新 `/opt/mall/mobile/dist` 符号链接，失败时自动回切。

服务器 Nginx 需要在 `mall.leedu.ac.cn` 的 HTTPS `server` 内增加以下内容；仓库中的 `deploy/nginx/mobile-location.conf.example` 保存了同一片段：

```nginx
location = /mobile {
    return 301 /mobile/;
}

location ^~ /mobile/ {
    alias /opt/mall/mobile/dist/;
    index index.html;
    try_files $uri $uri/ =404;
}
```

应用使用 hash 路由，因此不需要将未知服务端路径回退到 `index.html`。配置后先运行 `nginx -t` 再 reload。

## 依赖安全说明

`npm audit --omit=dev --audit-level=high` 用于检查实际部署的运行依赖。DCloud 编译器位于 `devDependencies`，其完整依赖树仍可能报告上游构建工具告警；升级时需使用同一批次的 DCloud 包并重新验证 H5、小程序和浏览器闭环，不能单独强升某个编译包。
