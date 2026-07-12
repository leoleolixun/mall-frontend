# Mall UniApp

移动端使用 PC Web 相同的商城接口。小程序和原生运行时直接请求：

```text
https://mall.leedu.ac.cn/api/v1
```

H5 使用同源 `/api/v1`，开发服务器会代理到 `https://mall.leedu.ac.cn`，避免浏览器跨域预检；正式 H5 建议部署到该商城域名，或在部署服务器配置同名 `/api` 反向代理。

可直接将 `mall-uniapp` 目录导入 HBuilderX，运行到 H5 或微信小程序。微信小程序发布前需要在微信公众平台把 `https://mall.leedu.ac.cn` 配置为 `request` 合法域名，并在 `manifest.json` 中填写小程序 AppID。

接口契约测试不依赖真实账号，也不会创建线上数据：

```powershell
node tests/api.contract.mjs
```

测试覆盖目录、认证、购物车、地址、订单和支付共 24 个接口，并检查 Bearer 鉴权、查询参数、金额适配以及 401/502 错误处理。

后端部署完成后，可运行真实环境只读联调：

```powershell
node tests/api.live.mjs
```

脚本默认以 `http://localhost:8080` 诊断后端是否支持直接 CORS；当前 H5 已使用同源代理，因此该诊断警告不会阻断验收。可通过 `MALL_TEST_ORIGIN` 指定其他来源。

提供测试账号后还会验证登录态读取接口：

```powershell
$env:MALL_TEST_USERNAME='test-user'
$env:MALL_TEST_PASSWORD='test-password'
node tests/api.live.mjs
```

显式开启注册测试会创建一个唯一的测试账号，并继续验证登录和鉴权读取接口：

```powershell
$env:MALL_TEST_REGISTER='1'
node tests/api.live.mjs
```

完整写入 E2E 会创建带 `Codex E2E` 标记的测试账号和测试订单，并验证所有商城写接口：

```powershell
node tests/api.e2e.mjs
```
