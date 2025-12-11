/** @type {import('next').NextConfig} */
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