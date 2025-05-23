# 环境变量配置说明

## 概述

本项目使用Vite构建，支持通过环境变量配置不同环境的参数。

## 配置文件

由于.env文件可能被全局忽略，项目已在vite.config.ts中配置了代理，无需单独创建.env文件即可正常运行。

### 开发环境

开发环境下，Vite会自动将`/api`请求代理到`http://localhost:8080`，因此前端可以直接使用相对路径`/api`。

### 生产环境

生产环境下，需要确保前端和后端部署在同一域名下，或者配置正确的CORS策略。

## 支持的环境变量

如果需要创建环境变量文件，可以创建以下文件：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 可用的环境变量

```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:8080/api

# 应用配置
VITE_APP_TITLE=小说评论管理系统
VITE_APP_VERSION=1.0.0

# 调试模式
VITE_DEBUG=true
```

## 当前配置

项目当前使用以下默认配置：

- **开发环境API地址**: `/api` (代理到 `http://localhost:8080`)
- **生产环境API地址**: `/api`
- **开发服务器端口**: `5173`
- **开发服务器地址**: `0.0.0.0`

## 如何修改配置

1. **修改API地址**: 在`src/config/index.ts`中修改`API_BASE_URL`
2. **修改代理配置**: 在`vite.config.ts`中修改`server.proxy`配置
3. **添加环境变量**: 创建对应的`.env`文件并设置变量

## 启动项目

```bash
# 在项目根目录
npm run dev

# 或者在Vue项目目录
cd cmd/server/web/admin-vue
npm run dev
```

项目启动后会自动使用代理配置，前端请求`/api/*`会被转发到后端服务器。
