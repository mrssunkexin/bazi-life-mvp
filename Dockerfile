# 使用 Node.js 20 作为基础镜像 (适配 Next.js 15+/React 19)
FROM node:20-alpine AS base

# 1. 依赖安装阶段
FROM base AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma

# 安装依赖 (根据你的包管理器自动选择)
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 2. 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 运行 prisma generate 和 next build (根据你的 package.json)
RUN npm run build

# 3. 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

# 创建非 root 用户以提高安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# USER nextjs

# 微信云托管默认监听 80 端口
EXPOSE 80

CMD ["npm", "start"]