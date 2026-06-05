# Waline 部署指南 🚀

## 目录
- [简介](#简介)
- [前置准备](#前置准备)
- [第一步：部署 Waline 到 Netlify](#第一步部署-waline-到-netlify)
- [第二步：创建 Neon 数据库](#第二步创建-neon-数据库)
- [第三步：配置环境变量](#第三步配置环境变量)
- [第四步：注册管理员](#第四步注册管理员)
- [配置你的博客](#配置你的博客)
- [常见问题](#常见问题)

---

## 简介

Waline 是一个简洁、安全的评论系统，支持点赞功能！本指南将帮助你把 Waline 部署到 Netlify，用 Neon 数据库替代 LeanCloud。

---

## 前置准备

你需要：
1. 一个 GitHub 账号
2. 一个 Netlify 账号（你已经有了！）
3. 一个 Neon 账号（免费）

---

## 第一步：部署 Waline 到 Netlify

1. 访问 [Waline 官网](https://waline.js.org/)，找到部署到 Netlify 的按钮
2. 或者访问 Waline 的 GitHub 仓库，然后部署到 Netlify
3. 使用 GitHub 账号登录 Netlify
4. 给仓库起个名字，比如 `waline-server`
5. 点击部署

---

## 第二步：创建 Neon 数据库

1. 登录 [Neon Console](https://console.neon.tech/)
2. 创建一个新项目
3. 选择免费的 Free Plan
4. 数据库位置建议选择亚太区域（Singapore 或 Tokyo）
5. 创建数据库后，记录下连接信息

---

## 第三步：配置环境变量

在 Netlify 的项目设置中：

1. 进入 **Site settings** → **Environment variables**
2. 添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | 从 Neon 复制的完整连接字符串（类似 `postgresql://...`） |
| `SITE_NAME` | 你的博客名称 |
| `SITE_URL` | 你的博客地址 |

3. 保存后，重新部署使环境变量生效

---

## 第四步：注册管理员

1. 访问你的 Waline 地址 `https://<你的-waline-域名>.netlify.app/ui/register`
2. 注册的第一个账号自动成为管理员

---

## 配置你的博客

### 1. 更新 MomentCard.astro

打开 `src/components/features/diary/MomentCard.astro`，找到：

```javascript
// ⚠️ 配置你的 Waline 服务器地址！
// 部署 Waline 后，把地址填在这里，例如：'https://your-waline.netlify.app'
const WALINE_SERVER_URL = '';
```

填入你的 Waline 地址：

```javascript
const WALINE_SERVER_URL = 'https://your-waline.netlify.app';
```

---

## 常见问题

### Q: 点赞数不更新？
A: 检查 `WALINE_SERVER_URL` 配置是否正确

### Q: 怎么绑定自定义域名？
A: 在 Netlify 的 **Site settings** → **Domain management** 中添加你的域名

---

## 参考资料

- Waline 官方文档：https://waline.js.org/
- Neon 数据库：https://neon.tech/

有问题随时问我！😉
