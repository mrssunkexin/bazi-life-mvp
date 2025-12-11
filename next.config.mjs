部署开始于 2025-12-11 13:12:47

AppID: wx1d7356860d50a12b
环境名称：zhibaitang-3g85tzfpc7281bc7

[1/2] 执行流水线　　　 进行中 预计需要 2 分钟...  |
----------- 检出代码仓库 -----------
[2025-12-11 13:13:03] Cloning Git repository...
[2025-12-11 13:13:03] Cloning into '.'...
[2025-12-11 13:13:04] Already on 'claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R'
[2025-12-11 13:13:04] Your branch is up to date with 'origin/claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R'.
[2025-12-11 13:13:04] Repository cloned and checked out.
----------- 构建并推送 Docker 镜像 -----------
[2025-12-11 13:13:05] Logging into Docker registry...
[2025-12-11 13:13:05] WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
[2025-12-11 13:13:05] Configure a credential helper to remove this warning. See
[2025-12-11 13:13:05] https://docs.docker.com/engine/reference/commandline/login/#credentials-store
[2025-12-11 13:13:05] 
[2025-12-11 13:13:05] Login Succeeded
[2025-12-11 13:13:05] Building Docker image: ccr.ccs.tencentyun.com/****:zhibaitang-bazisever-003-20251211131253
[2025-12-11 13:13:05] #0 building with "default" instance using docker driver
[2025-12-11 13:13:05] 
[2025-12-11 13:13:05] #1 [internal] load build definition from Dockerfile
[2025-12-11 13:13:05] #1 transferring dockerfile: 1.33kB done
[2025-12-11 13:13:05] #1 DONE 0.0s
[2025-12-11 13:13:05] 
[2025-12-11 13:13:05] #2 [internal] load metadata for docker.io/library/node:20-alpine
[2025-12-11 13:13:07] #2 DONE 1.3s
[2025-12-11 13:13:07] 
[2025-12-11 13:13:07] #3 [internal] load .dockerignore
[2025-12-11 13:13:07] #3 transferring context: 2B done
[2025-12-11 13:13:07] #3 DONE 0.0s
[2025-12-11 13:13:07] 
[2025-12-11 13:13:07] #4 [internal] load build context
[2025-12-11 13:13:07] #4 transferring context: 1.17MB 0.0s done
[2025-12-11 13:13:07] #4 DONE 0.0s
[2025-12-11 13:13:07] 
[2025-12-11 13:13:07] #5 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
[2025-12-11 13:13:07] #5 resolve docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2 0.0s done
[2025-12-11 13:13:07] #5 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 0B / 42.78MB 0.1s
[2025-12-11 13:13:07] #5 sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 0B / 1.26MB 0.1s
[2025-12-11 13:13:07] #5 sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2 7.67kB / 7.67kB done
[2025-12-11 13:13:07] #5 sha256:fb140f51db2dfb99a12ea29ddc933a8719e46501de0295bed8c4c2824d1332cf 1.72kB / 1.72kB done
[2025-12-11 13:13:07] #5 sha256:9992b59c17bf27bd13e187f54112049f23f7da7b89343bee73963ae3d6a65fb9 6.52kB / 6.52kB done
[2025-12-11 13:13:07] #5 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 0B / 3.86MB 0.1s
[2025-12-11 13:13:07] #5 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 1.05MB / 3.86MB 0.3s
[2025-12-11 13:13:07] #5 sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 1.26MB / 1.26MB 0.4s
[2025-12-11 13:13:07] #5 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 3.86MB / 3.86MB 0.4s done
[2025-12-11 13:13:07] #5 extracting sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 0.1s done
[2025-12-11 13:13:07] #5 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 26.21MB / 42.78MB 0.6s
[2025-12-11 13:13:07] #5 sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 1.26MB / 1.26MB 0.4s done
[2025-12-11 13:13:07] #5 sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 0B / 446B 0.6s
[2025-12-11 13:13:07] #5 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 38.80MB / 42.78MB 0.7s
[2025-12-11 13:13:07] #5 sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 446B / 446B 0.6s done
[2025-12-11 13:13:07] #5 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645
[2025-12-11 13:13:07] #5 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 42.78MB / 42.78MB 0.8s done
[2025-12-11 13:13:08] #5 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 0.7s done
[2025-12-11 13:13:08] #5 extracting sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 0.0s done
[2025-12-11 13:13:08] #5 extracting sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 done
[2025-12-11 13:13:08] #5 DONE 1.7s
[2025-12-11 13:13:08] 
[2025-12-11 13:13:08] #6 [runner 1/7] WORKDIR /app
[2025-12-11 13:13:08] #6 DONE 0.0s
[2025-12-11 13:13:08] 
[2025-12-11 13:13:08] #7 [deps 2/4] COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
[2025-12-11 13:13:08] #7 DONE 0.1s
[2025-12-11 13:13:08] 
[2025-12-11 13:13:08] #8 [deps 3/4] COPY prisma ./prisma
[2025-12-11 13:13:08] #8 DONE 0.0s
[2025-12-11 13:13:08] 
[2025-12-11 13:13:08] #9 [runner 2/7] RUN addgroup --system --gid 1001 nodejs
[2025-12-11 13:13:09] #9 DONE 0.2s
[2025-12-11 13:13:09] 
[2025-12-11 13:13:09] #10 [runner 3/7] RUN adduser --system --uid 1001 nextjs
[2025-12-11 13:13:09] #10 DONE 0.3s
[2025-12-11 13:13:09] 
[2025-12-11 13:13:09] #11 [deps 4/4] RUN   if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo "Lockfile not found." && exit 1;   fi
[2025-12-11 13:14:05] #11 56.49 
[2025-12-11 13:14:05] #11 56.49 > bazi-life-mvp@0.1.0 postinstall
[2025-12-11 13:14:05] #11 56.49 > prisma generate || echo 'Prisma generation failed - run npm run prisma:generate manually'
[2025-12-11 13:14:05] #11 56.49 
[2025-12-11 13:14:06] #11 57.22 warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
[2025-12-11 13:14:06] #11 57.22 For more information, see: https://pris.ly/prisma-config
[2025-12-11 13:14:06] #11 57.22 
[2025-12-11 13:14:06] #11 57.35 Prisma schema loaded from prisma/schema.prisma
[2025-12-11 13:14:06] #11 57.52 ┌─────────────────────────────────────────────────────────┐
[2025-12-11 13:14:06] #11 57.52 │  Update available 6.19.0 -> 7.1.0                       │
[2025-12-11 13:14:06] #11 57.52 │                                                         │
[2025-12-11 13:14:06] #11 57.52 │  This is a major update - please follow the guide at    │
[2025-12-11 13:14:06] #11 57.52 │  https://pris.ly/d/major-version-upgrade                │
[2025-12-11 13:14:06] #11 57.52 │                                                         │
[2025-12-11 13:14:06] #11 57.52 │  Run the following to update                            │
[2025-12-11 13:14:06] #11 57.52 │    npm i --save-dev prisma@latest                       │
[2025-12-11 13:14:06] #11 57.52 │    npm i @prisma/client@latest                          │
[2025-12-11 13:14:06] #11 57.52 └─────────────────────────────────────────────────────────┘
[2025-12-11 13:14:06] #11 57.52 
[2025-12-11 13:14:06] #11 57.52 ✔ Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client in 67ms
[2025-12-11 13:14:06] #11 57.52 
[2025-12-11 13:14:06] #11 57.52 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
[2025-12-11 13:14:06] #11 57.52 
[2025-12-11 13:14:06] #11 57.52 Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
[2025-12-11 13:14:06] #11 57.52 
[2025-12-11 13:14:06] #11 57.55 
[2025-12-11 13:14:06] #11 57.55 added 558 packages, and audited 559 packages in 57s
[2025-12-11 13:14:06] #11 57.55 
[2025-12-11 13:14:06] #11 57.55 217 packages are looking for funding
[2025-12-11 13:14:06] #11 57.55   run `npm fund` for details
[2025-12-11 13:14:06] #11 57.59 
[2025-12-11 13:14:06] #11 57.59 3 vulnerabilities (2 moderate, 1 critical)
[2025-12-11 13:14:06] #11 57.59 
[2025-12-11 13:14:06] #11 57.59 To address issues that do not require attention, run:
[2025-12-11 13:14:06] #11 57.59   npm audit fix
[2025-12-11 13:14:06] #11 57.59 
[2025-12-11 13:14:06] #11 57.59 To address all issues, run:
[2025-12-11 13:14:06] #11 57.59   npm audit fix --force
[2025-12-11 13:14:06] #11 57.59 
[2025-12-11 13:14:06] #11 57.59 Run `npm audit` for details.
[2025-12-11 13:14:06] #11 57.59 npm notice
[2025-12-11 13:14:06] #11 57.59 npm notice New major version of npm available! 10.8.2 -> 11.7.0
[2025-12-11 13:14:06] #11 57.59 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
[2025-12-11 13:14:06] #11 57.59 npm notice To update run: npm install -g npm@11.7.0
[2025-12-11 13:14:06] #11 57.59 npm notice
[2025-12-11 13:14:06] #11 DONE 58.0s
[2025-12-11 13:14:08] 
[2025-12-11 13:14:08] #12 [builder 2/4] COPY --from=deps /app/node_modules ./node_modules
[2025-12-11 13:14:10] #12 DONE 2.0s
[2025-12-11 13:14:10] 
[2025-12-11 13:14:10] #13 [builder 3/4] COPY . .
[2025-12-11 13:14:10] #13 DONE 0.1s
[2025-12-11 13:14:10] 
[2025-12-11 13:14:10] #14 [builder 4/4] RUN npm run build
[2025-12-11 13:14:11] #14 0.464 
[2025-12-11 13:14:11] #14 0.464 > bazi-life-mvp@0.1.0 build
[2025-12-11 13:14:11] #14 0.464 > prisma generate && next build
[2025-12-11 13:14:11] #14 0.464 
[2025-12-11 13:14:12] #14 1.700 warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
[2025-12-11 13:14:12] #14 1.700 For more information, see: https://pris.ly/prisma-config
[2025-12-11 13:14:12] #14 1.700 
[2025-12-11 13:14:12] #14 1.776 Prisma schema loaded from prisma/schema.prisma
[2025-12-11 13:14:12] #14 1.934 
[2025-12-11 13:14:12] #14 1.934 ✔ Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client in 72ms
[2025-12-11 13:14:12] #14 1.934 
[2025-12-11 13:14:12] #14 1.934 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
[2025-12-11 13:14:12] #14 1.934 
[2025-12-11 13:14:12] #14 1.934 Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
[2025-12-11 13:14:12] #14 1.934 
[2025-12-11 13:14:12] #14 2.286 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:13] #14 2.808  ⚠ `eslint` configuration in next.config.mjs is no longer supported. See more info here: https://nextjs.org/docs/app/api-reference/cli/next#next-lint-options
[2025-12-11 13:14:13] #14 2.814  ⚠ Invalid next.config.mjs options detected: 
[2025-12-11 13:14:13] #14 2.814  ⚠     Unrecognized key(s) in object: 'eslint'
[2025-12-11 13:14:13] #14 2.814  ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
[2025-12-11 13:14:13] #14 2.898 Attention: Next.js now collects completely anonymous telemetry regarding usage.
[2025-12-11 13:14:13] #14 2.898 This information is used to shape Next.js' roadmap and prioritize features.
[2025-12-11 13:14:13] #14 2.898 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[2025-12-11 13:14:13] #14 2.898 https://nextjs.org/telemetry
[2025-12-11 13:14:13] #14 2.898 
[2025-12-11 13:14:13] #14 2.911    ▲ Next.js 16.0.1 (Turbopack)
[2025-12-11 13:14:13] #14 2.911 
[2025-12-11 13:14:13] #14 2.987    Creating an optimized production build ...
[2025-12-11 13:14:13] #14 3.109 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:31] #14 20.54  ✓ Compiled successfully in 17.3s
[2025-12-11 13:14:31] #14 20.55    Skipping validation of types
[2025-12-11 13:14:31] #14 20.66    Collecting page data ...
[2025-12-11 13:14:33] #14 22.73 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.73 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.73 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.73 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.73 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.74 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.74 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.75 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.75 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.75 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.75 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 22.75 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:33] #14 23.07    Generating static pages (0/8) ...
[2025-12-11 13:14:35] #14 24.65 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[2025-12-11 13:14:35] #14 25.08    Generating static pages (2/8) 
[2025-12-11 13:14:35] #14 25.08    Generating static pages (4/8) 
[2025-12-11 13:14:35] #14 25.09    Generating static pages (6/8) 
[2025-12-11 13:14:35] #14 25.09  ✓ Generating static pages (8/8) in 2.0s
[2025-12-11 13:14:35] #14 25.19    Finalizing page optimization ...
[2025-12-11 13:14:36] #14 25.26 
[2025-12-11 13:14:36] #14 25.26 Route (app)
[2025-12-11 13:14:36] #14 25.26 ┌ ○ /
[2025-12-11 13:14:36] #14 25.26 ├ ○ /_not-found
[2025-12-11 13:14:36] #14 25.26 ├ ○ /admin
[2025-12-11 13:14:36] #14 25.26 ├ ƒ /admin/reports/[id]
[2025-12-11 13:14:36] #14 25.26 ├ ƒ /api/reports
[2025-12-11 13:14:36] #14 25.26 ├ ƒ /api/reports/[id]
[2025-12-11 13:14:36] #14 25.26 ├ ƒ /api/reports/[id]/status
[2025-12-11 13:14:36] #14 25.26 ├ ○ /calc
[2025-12-11 13:14:36] #14 25.26 ├ ○ /dev
[2025-12-11 13:14:36] #14 25.26 └ ƒ /reports/[id]
[2025-12-11 13:14:36] #14 25.26 
[2025-12-11 13:14:36] #14 25.26 
[2025-12-11 13:14:36] #14 25.26 ○  (Static)   prerendered as static content
[2025-12-11 13:14:36] #14 25.26 ƒ  (Dynamic)  server-rendered on demand
[2025-12-11 13:14:36] #14 25.26 
[2025-12-11 13:14:36] #14 25.44 npm notice
[2025-12-11 13:14:36] #14 25.44 npm notice New major version of npm available! 10.8.2 -> 11.7.0
[2025-12-11 13:14:36] #14 25.44 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
[2025-12-11 13:14:36] #14 25.44 npm notice To update run: npm install -g npm@11.7.0
[2025-12-11 13:14:36] #14 25.44 npm notice
[2025-12-11 13:14:36] #14 DONE 25.6s
[2025-12-11 13:14:36] 
[2025-12-11 13:14:36] #15 [runner 4/7] COPY --from=builder /app/public ./public
[2025-12-11 13:14:36] #15 DONE 0.1s
[2025-12-11 13:14:36] 
[2025-12-11 13:14:36] #16 [runner 5/7] COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
[2025-12-11 13:14:37] #16 DONE 0.5s
[2025-12-11 13:14:54] 
[2025-12-11 13:14:54] #17 [runner 6/7] COPY --from=builder /app/node_modules ./node_modules
[2025-12-11 13:14:56] #17 DONE 2.0s
[2025-12-11 13:14:56] 
[2025-12-11 13:14:56] #18 [runner 7/7] COPY --from=builder /app/package.json ./package.json
[2025-12-11 13:14:56] #18 DONE 0.1s
[2025-12-11 13:14:56] 
[2025-12-11 13:14:56] #19 exporting to image
[2025-12-11 13:14:56] #19 exporting layers
[2025-12-11 13:15:18] #19 exporting layers 22.2s done
[2025-12-11 13:15:18] #19 writing image sha256:e0e88a068f0cb29983ef6ad9d6f225c8de7f5037bff5261887a4819505acad1d done
[2025-12-11 13:15:18] #19 naming to ccr.ccs.tencentyun.com/****:zhibaitang-bazisever-003-20251211131253 done
[2025-12-11 13:15:18] #19 DONE 22.2s
[2025-12-11 13:15:18] 镜像的大小是：997MB
[2025-12-11 13:15:18] 优化镜像大小具体可参考： https://docs.cloudbase.net/run/develop/image-optimization
[2025-12-11 13:15:18] Pushing Docker image to TCR...
[2025-12-11 13:15:18] The push refers to repository [ccr.ccs.tencentyun.com/****]
[2025-12-11 13:15:18] b46b3d9009ed: Preparing
[2025-12-11 13:15:18] 88e1e99d7661: Preparing
[2025-12-11 13:15:18] 9440822d8576: Preparing
[2025-12-11 13:15:18] 872d89f2fae7: Preparing
[2025-12-11 13:15:18] ddabc47ec153: Preparing
[2025-12-11 13:15:18] 6622534ff282: Preparing
[2025-12-11 13:15:18] 750a62a0f2da: Preparing
[2025-12-11 13:15:18] c6b6d11f000e: Preparing
[2025-12-11 13:15:18] 61b83bf0de98: Preparing
[2025-12-11 13:15:18] 614db0c0a156: Preparing
[2025-12-11 13:15:18] 5aa68bbbc67e: Preparing
[2025-12-11 13:15:18] 6622534ff282: Waiting
[2025-12-11 13:15:18] 750a62a0f2da: Waiting
[2025-12-11 13:15:18] c6b6d11f000e: Waiting
[2025-12-11 13:15:18] 614db0c0a156: Waiting
[2025-12-11 13:15:18] 5aa68bbbc67e: Waiting
[2025-12-11 13:15:18] 61b83bf0de98: Waiting
[2025-12-11 13:15:20] 872d89f2fae7: Pushed
[2025-12-11 13:15:20] ddabc47ec153: Pushed
[2025-12-11 13:15:20] b46b3d9009ed: Pushed
[2025-12-11 13:15:21] 6622534ff282: Pushed
[2025-12-11 13:15:21] c6b6d11f000e: Pushed
[2025-12-11 13:15:21] 750a62a0f2da: Pushed
[2025-12-11 13:15:21] 9440822d8576: Pushed
[2025-12-11 13:15:22] 61b83bf0de98: Pushed
[2025-12-11 13:15:24] 5aa68bbbc67e: Pushed
[2025-12-11 13:15:43] 614db0c0a156: Pushed
[2025-12-11 13:17:39] 88e1e99d7661: Pushed
[2025-12-11 13:17:42] zhibaitang-bazisever-003-20251211131253: digest: sha256:57fa5ab9066453b718622c81672bafe89967ba4183e03aec549906f80d97ad5c size: 2617
[2025-12-11 13:17:42] Image pushed successfully.
***
-----------构建zhibaitang-bazisever-003-----------
2025-12-11 13:12:54 create_build_image : creating
2025-12-11 13:17:46 check_build_image : succ
-----------服务zhibaitang-bazisever部署zhibaitang-bazisever-003-----------
2025-12-11 13:17:48 create_eks_virtual_service : creating
2025-12-11 13:17:49 check_eks_virtual_service : process, 部署版本失败：Back-off restarting failed container, [service]:[Back-off restarting failed container,]
-----------启动日志-----------

> bazi-life-mvp@0.1.0 start
> next start

 ⨯ Failed to start server
Error: listen EACCES: permission denied 0.0.0.0:80
    at <unknown> (Error: listen EACCES: permission denied 0.0.0.0:80)
    at new Promise (<anonymous>) {
  code: 'EACCES',
  errno: -13,
  syscall: 'listen',
  address: '0.0.0.0',
  port: 80
}
wx1d7356860d50a12b zhibaitang-3g85tzfpc7281bc7 tid=1160543 rid=multi_tenant_1vTYywmbou6XV5 zhibaitang-bazisever ptid=735741 bid=2600153637 zhibaitang-bazisever-/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许生产构建中存在 ESLint 错误
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 允许生产构建中存在 TypeScript 错误
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;