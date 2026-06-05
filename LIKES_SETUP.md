# 点赞功能配置指南

本文档介绍如何配置日记的点赞功能，支持多种后端方案。

## 当前状态

目前点赞功能默认使用 **本地存储 (localStorage)**，这意味着：
- ✅ 每个用户可以看到自己的点赞状态
- ❌ 所有用户看到的点赞数可能不一致（各存各的）

## 可用方案

### 方案 1: Waline (推荐 ⭐⭐⭐)

Waline 是一个简洁的评论系统，内置点赞功能，完美替代 Twikoo。

**优点：**
- 配置简单
- 内置点赞功能
- 可以部署在 Vercel/Netlify
- 完全免费
- 支持数据持久化

**配置步骤：**

1. **部署 Waline**
   - 访问 [Waline 官网](https://waline.js.org/)
   - 按照官方文档部署到 Vercel（推荐）
   - 配置 LeanCloud 或其他数据库存储

2. **配置项目**
   
   打开 `src/components/features/diary/MomentCard.astro`，修改以下配置：

   ```javascript
   const LIKE_BACKEND = 'waline';
   const WALINE_SERVER_URL = 'https://your-waline.vercel.app'; // 替换为你的 Waline 地址
   ```

3. **完成！** 现在所有用户都能看到相同的点赞数了。

---

### 方案 2: 自定义 API + Vercel KV

使用我们创建的 API，配合 Vercel KV 存储。

**优点：**
- 完全可控
- 最灵活
- 与项目深度集成

**配置步骤：**

1. **启用 Vercel KV**
   - 在 Vercel 项目中启用 KV 存储
   - 按照 Vercel 文档配置

2. **修改 API 代码**
   
   打开 `src/pages/api/likes.json.ts`，替换内存存储为 Vercel KV：

   ```typescript
   import { createClient } from '@vercel/kv';
   
   const kv = createClient({
     url: import.meta.env.KV_REST_API_URL,
     token: import.meta.env.KV_REST_API_TOKEN,
   });
   
   // 然后修改 GET 和 POST 函数使用 kv 存储
   ```

3. **配置项目**
   
   打开 `src/components/features/diary/MomentCard.astro`：

   ```javascript
   const LIKE_BACKEND = 'api';
   ```

---

### 方案 3: 继续使用 Twikoo (不推荐)

利用 Twikoo 的评论系统模拟点赞功能。

**缺点：**
- 需要用户手动评论来模拟点赞
- 不够优雅
- 难以管理

**不推荐使用此方案。**

---

## 快速开始（推荐 Waline）

如果你想快速上手，我强烈推荐使用 Waline：

1. 点击 [这里](https://waline.js.org/guide/get-started/) 访问 Waline 快速开始指南
2. 按照步骤部署 Waline
3. 更新项目配置文件中的 `WALINE_SERVER_URL`
4. 将 `LIKE_BACKEND` 改为 `'waline'`

## 本地开发

在本地开发时，你可以继续使用默认的 `local` 模式，这样不需要配置后端服务。

## 问题排查

如果遇到问题：

1. 检查浏览器控制台的错误信息
2. 确认后端服务是否正常运行
3. 验证配置的 URL 是否正确

## 需要帮助？

如果需要帮助配置，请告诉我你想使用哪个方案，我可以提供更详细的指导！
